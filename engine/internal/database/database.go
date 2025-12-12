package database

import (
	"log"
	"os"

	"github.com/mateusgcoelho/sentinel/engine/internal/apikey"
	"github.com/mateusgcoelho/sentinel/engine/internal/config"
	"github.com/mateusgcoelho/sentinel/engine/internal/integration"
	"github.com/mateusgcoelho/sentinel/engine/internal/monitor"
	"github.com/mateusgcoelho/sentinel/engine/internal/password"
	"github.com/mateusgcoelho/sentinel/engine/internal/request"
	"github.com/mateusgcoelho/sentinel/engine/internal/user"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func OpenDatabaseConnection(appConfig config.Config) (*gorm.DB, error) {
	log.Println("[database] establishing database connection")

	if err := os.MkdirAll("./db", os.ModePerm); err != nil {
		return nil, err
	}

	gormDb, err := gorm.Open(sqlite.Open("./db/sentinel.db"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := gormDb.AutoMigrate(
		&monitor.MonitorConfig{},
		&monitor.Attempt{},
		&integration.IntegrationConfig{},
		&user.User{},
		&request.RequestLog{},
		&apikey.ApiKeyConfig{},
	); err != nil {
		return nil, err
	}

	if err := createAdminUserIfNotExists(appConfig, gormDb); err != nil {
		return nil, err
	}

	log.Println("[database] database connection established successfully")

	return gormDb, nil
}

func createAdminUserIfNotExists(appConfig config.Config, gormDb *gorm.DB) error {
	var count int64
	if err := gormDb.Model(&user.User{}).Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	hashedPassword, err := password.Hash(appConfig.Password)
	if err != nil {
		return err
	}

	user := user.User{
		Username: appConfig.Username,
		Password: hashedPassword,
	}
	if err := gormDb.Create(&user).Error; err != nil {
		return err
	}

	log.Println("[database] created default admin user with username 'admin' and password 'admin'")

	return nil
}
