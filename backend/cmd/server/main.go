/*
 * ============================================================================
 * cmd/server/main.go — API SERVER ENTRYPOINT
 * Component: Person A + <Go API / Team Lead>
 * ============================================================================
 */

package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"

	"github.com/kijanifarmer/backend/internal/api/middleware"
	"github.com/kijanifarmer/backend/internal/api/routes"
	"github.com/kijanifarmer/backend/internal/clients"
	"github.com/kijanifarmer/backend/internal/config"
	"github.com/kijanifarmer/backend/internal/queue"
	"github.com/kijanifarmer/backend/internal/queue/workers"
	"github.com/kijanifarmer/backend/internal/repository"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		slog.Error("Failed to load configuration", slog.String("error", err.Error()))
		os.Exit(1)
	}
	slog.Info("Configuration loaded", slog.String("port", cfg.Port))

	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	ctx := context.Background()

	dbPool, err := clients.NewSupabasePool(ctx, cfg.SupabaseDBURL)
	if err != nil {
		slog.Error("Failed to connect to database", slog.String("error", err.Error()))
		os.Exit(1)
	}
	defer dbPool.Close()
	slog.Info("Database connected")

	redisClient, err := clients.NewRedisClient(ctx, cfg.RedisURL)
	if err != nil {
		slog.Error("Failed to connect to Redis", slog.String("error", err.Error()))
		os.Exit(1)
	}
	defer redisClient.Close()
	slog.Info("Redis connected")

	asynqClient, err := queue.NewAsynqClient(cfg.RedisURL)
	if err != nil {
		slog.Error("Failed to create Asynq client", slog.String("error", err.Error()))
		os.Exit(1)
	}
	defer asynqClient.Close()
	slog.Info("Asynq client initialized")

	var asynqServer *asynq.Server
	asynqServer, err = queue.NewAsynqServer(cfg.RedisURL)
	if err != nil {
		slog.Warn("Failed to create Asynq server — retrying in background",
			slog.String("error", err.Error()))
		go func() {
			for {
				time.Sleep(30 * time.Second)
				srv, retryErr := queue.NewAsynqServer(cfg.RedisURL)
				if retryErr == nil {
					slog.Info("Asynq server initialized after retry")
					startAsynqWorker(srv, cfg, dbPool)
					return
				}
				slog.Warn("Asynq server retry failed", slog.String("error", retryErr.Error()))
			}
		}()
	} else {
		slog.Info("Asynq server initialized")
	}

	var mqttClient *clients.MQTTClient
	if broker := os.Getenv("MQTT_BROKER_URL"); broker != "" {
		mqttClient, err = clients.NewMQTTClient(broker, "amatsi-api")
		if err != nil {
			slog.Warn("MQTT unavailable", slog.String("error", err.Error()))
			mqttClient = nil
		}
	}

	router := gin.New()
	router.Use(middleware.RequestLogger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORSMiddleware(cfg.AllowedOrigins))
	router.Use(injectDeps(dbPool, redisClient, asynqClient, mqttClient, cfg))

	router.GET("/health", func(c *gin.Context) {
		if err := dbPool.Ping(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "unhealthy",
				"error":  fmt.Sprintf("database ping failed: %v", err),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"service":   "kijanifarmer-api",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	routes.RegisterRoutes(router, cfg, redisClient)

	startAsynqWorker(asynqServer, cfg, dbPool)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	serverErr := make(chan error, 1)
	go func() {
		slog.Info("Server starting", slog.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serverErr <- err
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	select {
	case sig := <-quit:
		slog.Info("Shutdown signal received", slog.String("signal", sig.String()))
	case err := <-serverErr:
		slog.Error("Server failed — initiating shutdown", slog.String("error", err.Error()))
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("Server shutdown error", slog.String("error", err.Error()))
	}
	if asynqServer != nil {
		asynqDone := make(chan struct{})
		go func() {
			asynqServer.Shutdown()
			close(asynqDone)
		}()
		select {
		case <-asynqDone:
		case <-time.After(15 * time.Second):
			slog.Warn("Asynq shutdown timed out; continuing")
		}
	}
	if mqttClient != nil {
		mqttClient.Disconnect()
	}
	slog.Info("Server shutdown complete")
}

func startAsynqWorker(asynqServer *asynq.Server, cfg *config.AppConfig, dbPool *pgxpool.Pool) {
	if asynqServer == nil {
		return
	}
	atClient := clients.NewAfricasTalkingClient(cfg.AfricaTalkingUsername, cfg.AfricaTalkingAPIKey, cfg.AfricaTalkingSandbox)
	smsProcessor := workers.NewSMSProcessor(atClient, repository.NewAlertRepository(dbPool))
	mux := asynq.NewServeMux()
	mux.HandleFunc(queue.TypeSendSMS, smsProcessor.ProcessTask)

	go func() {
		slog.Info("Asynq worker starting")
		if err := asynqServer.Start(mux); err != nil {
			slog.Error("Asynq worker failed to start", slog.String("error", err.Error()))
		}
	}()
}

func injectDeps(
	db *pgxpool.Pool,
	rdb *redis.Client,
	asynqClient *asynq.Client,
	mqttClient *clients.MQTTClient,
	cfg *config.AppConfig,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("db_pool", db)
		c.Set("redis_client", rdb)
		c.Set("asynq_client", asynqClient)
		c.Set("jwt_secret", cfg.JWTSecret)
		c.Set("jwt_ttl", cfg.JWTTokenTTL)
		c.Set("kijanibox_base_url", cfg.KijaniBoxBaseURL)
		c.Set("kijanibox_api_key", cfg.KijaniBoxAPIKey)
		c.Set("ai_service_url", cfg.AIServiceURL)
		if mqttClient != nil {
			c.Set("mqtt_client", mqttClient)
		}
		c.Next()
	}
}
