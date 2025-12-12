package main

import (
	"log"

	"github.com/mateusgcoelho/sentinel/engine/internal/apikey"
	"github.com/mateusgcoelho/sentinel/engine/internal/auth"
	"github.com/mateusgcoelho/sentinel/engine/internal/config"
	"github.com/mateusgcoelho/sentinel/engine/internal/database"
	"github.com/mateusgcoelho/sentinel/engine/internal/integration"
	"github.com/mateusgcoelho/sentinel/engine/internal/monitor"
	"github.com/mateusgcoelho/sentinel/engine/internal/request"
	"github.com/mateusgcoelho/sentinel/engine/internal/server"
	"github.com/mateusgcoelho/sentinel/engine/internal/user"
	"gorm.io/gorm"
)

func main() {
	defer func() {
		if r := recover(); r != nil {
			log.Fatalf("application panicked: %v", r)
		}
	}()

	appConfig, err := config.New()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	gormDb, err := database.OpenDatabaseConnection(appConfig)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	startWorkers(gormDb)

	apiKeyMiddleware := apikey.NewApiKeyMiddleware(gormDb)

	handlers := []server.IHandler{
		auth.NewHandler(gormDb, appConfig.JwtSecret),
		monitor.NewHandler(gormDb),
		integration.NewHandler(gormDb),
		user.NewHandler(gormDb),
		request.NewHandler(gormDb, apiKeyMiddleware.ValidateApiKey),
		apikey.NewHandler(gormDb),
	}

	server := server.New(appConfig, handlers)

	if err := server.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}

func startWorkers(gormDb *gorm.DB) {
	monitorWorker := monitor.NewWorker(gormDb)

	go func() {
		if err := monitorWorker.StartWorker(); err != nil {
			log.Fatalf("monitor worker encountered an error: %v", err)
		}
	}()
}
