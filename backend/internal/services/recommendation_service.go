package services

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/kijanifarmer/backend/internal/clients"
	"github.com/kijanifarmer/backend/internal/models"
	"github.com/kijanifarmer/backend/internal/repository"
	"time"
)

// ErrUpstream marks failures caused by external services (KijaniBox / AI),
// letting handlers distinguish them from local persistence errors.
var ErrUpstream = errors.New("recommendation upstream unavailable")

type RecommendationService struct {
	recRepo     *repository.RecommendationRepository
	weatherRepo *repository.WeatherRepository
	farmRepo    *repository.FarmRepository
	userRepo    *repository.UserRepository
	kijani      *clients.KijaniboxClient
	ai          *clients.PythonAIClient
	mqtt        *clients.MQTTClient
	alertSvc    *AlertService
}

func NewRecommendationService(
	recRepo *repository.RecommendationRepository,
	weatherRepo *repository.WeatherRepository,
	farmRepo *repository.FarmRepository,
	userRepo *repository.UserRepository,
	kijani *clients.KijaniboxClient,
	ai *clients.PythonAIClient,
	mqtt *clients.MQTTClient,
	alertSvc *AlertService,
) *RecommendationService {
	return &RecommendationService{
		recRepo:     recRepo,
		weatherRepo: weatherRepo,
		farmRepo:    farmRepo,
		userRepo:    userRepo,
		kijani:      kijani,
		ai:          ai,
		mqtt:        mqtt,
		alertSvc:    alertSvc,
	}
}

func (s *RecommendationService) GenerateRecommendation(ctx context.Context, farmID string) (*models.Recommendation, error) {
	farm, err := s.farmRepo.GetFarmByID(ctx, farmID)
	if err != nil {
		return nil, err
	}

	weatherData, soilData, err := s.kijani.GetLandForecast(ctx, farm.Latitude, farm.Longitude)
	if err != nil {
		return nil, fmt.Errorf("%w: kijanibox: %v", ErrUpstream, err)
	}

	weatherRecord := &models.Weather{
		FarmID:              farmID,
		Temperature:         weatherData.Temperature,
		RainfallProbability: weatherData.RainfallProbability,
		SoilMoisture:        soilData.MoistureLevel,
		ForecastDate:        time.Now(),
	}
	_ = s.weatherRepo.SaveWeatherForecast(ctx, weatherRecord)

	aiReq := &clients.RecommendationRequest{
		CropType:            farm.CropType,
		SoilType:            farm.SoilType,
		Temperature:         weatherRecord.Temperature,
		RainfallProbability: weatherRecord.RainfallProbability,
		SoilMoisture:        weatherRecord.SoilMoisture,
		TankCapacityLiters:  farm.TankCapacityLiters,
		FieldSizeSquareM:    farm.AreaHectares * 10_000,
	}

	aiRes, err := s.ai.GetRecommendation(ctx, aiReq)
	if err != nil {
		return nil, fmt.Errorf("%w: ai: %v", ErrUpstream, err)
	}

	rec := &models.Recommendation{
		FarmID:             farmID,
		Action:             aiRes.Action,
		Reason:             aiRes.Reason,
		WaterSavedEstimate: aiRes.WaterSavedEstimate,
	}

	if err := s.recRepo.CreateRecommendation(ctx, rec); err != nil {
		return nil, err
	}

	if rec.Action == "IRRIGATE" {
		user, err := s.userRepo.GetUserByID(ctx, farm.UserID)
		if err != nil {
			slog.Error("recommendation side-effect skipped: user lookup failed",
				slog.String("farm_id", farmID), slog.String("error", err.Error()))
		} else {
			if user.IsPremium && farm.DeviceID != nil && *farm.DeviceID != "" && s.mqtt != nil {
				durationMinutes := 45.0
				if err := s.mqtt.TriggerIrrigation(*farm.DeviceID, durationMinutes); err != nil {
					slog.Error("mqtt irrigation trigger failed",
						slog.String("farm_id", farmID), slog.String("error", err.Error()))
				}
			} else {
				// Standard user -> Send SMS Alert
				msg := "AMATSI Advisor: " + rec.Reason + " Action: " + rec.Action
				if err := s.alertSvc.SendAlert(ctx, farmID, user.PhoneNumber, msg); err != nil {
					slog.Error("sms alert enqueue failed",
						slog.String("farm_id", farmID), slog.String("error", err.Error()))
				}
			}
		}
	}

	return rec, nil
}
