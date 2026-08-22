package workers

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/hibiken/asynq"
	"github.com/kijanifarmer/backend/internal/clients"
	"github.com/kijanifarmer/backend/internal/queue"
	"github.com/kijanifarmer/backend/internal/repository"
)

type SMSProcessor struct {
	atClient *clients.AfricasTalkingClient
	alertRepo *repository.AlertRepository
}

func NewSMSProcessor(atClient *clients.AfricasTalkingClient, alertRepo *repository.AlertRepository) *SMSProcessor {
	return &SMSProcessor{
		atClient:  atClient,
		alertRepo: alertRepo,
	}
}

func (p *SMSProcessor) ProcessTask(ctx context.Context, t *asynq.Task) error {
	var payload queue.SendSMSPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %v: %w", err, asynq.SkipRetry)
	}

	err := p.atClient.SendSMS(ctx, payload.PhoneNumber, payload.Message)
	
	status := "SENT"
	if err != nil {
		status = "FAILED"
	}

	if payload.AlertID != "" {
		if err := p.alertRepo.UpdateSMSStatus(ctx, payload.AlertID, status); err != nil {
			slog.Error("failed to update sms alert status",
				slog.String("alert_id", payload.AlertID),
				slog.String("status", status),
				slog.String("error", err.Error()))
		}
	}

	return err
}
