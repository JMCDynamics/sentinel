package monitor

import (
	"math"
	"time"

	"github.com/mateusgcoelho/sentinel/engine/internal/integration"
)

type MonitorConfig struct {
	ID             uint                            `gorm:"primaryKey" json:"id"`
	Name           string                          `gorm:"not null" json:"name"`
	URL            string                          `gorm:"not null" json:"url"`
	Method         string                          `gorm:"not null" json:"method"`
	Interval       int                             `gorm:"not null" json:"interval"`
	Threshold      int                             `gorm:"not null" json:"threshold"`
	Timeout        int                             `gorm:"not null" json:"timeout"`
	Healthy        bool                            `gorm:"not null" json:"healthy"`
	LastRun        int64                           `gorm:"not null" json:"last_run"`
	Running        bool                            `gorm:"not null" json:"running"`
	Enabled        bool                            `gorm:"default:true" json:"enabled"`
	CreatedAt      int64                           `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      int64                           `gorm:"autoUpdateTime" json:"updated_at"`
	FailedAttempts int                             `gorm:"not null" json:"failed_attempts"`
	Slots          []Slot                          `gorm:"-" json:"slots"`
	Integrations   []integration.IntegrationConfig `gorm:"many2many:monitor_config_integrations;" json:"integrations"`
}

type Slot struct {
	Timestamp           int64 `json:"timestamp"`
	Healthy             bool  `json:"healthy"`
	IsMonitoringEnabled bool  `json:"is_monitoring_enabled"`
}

type Attempt struct {
	ID              uint          `gorm:"primaryKey" json:"id"`
	MonitorConfigID uint          `gorm:"not null" json:"monitor_config_id"`
	MonitorConfig   MonitorConfig `gorm:"foreignKey:MonitorConfigID" json:"monitor_config"`
	Healthy         bool          `gorm:"not null" json:"healthy"`
	StatusCode      int           `gorm:"not null" json:"status_code"`
	Response        any           `gorm:"type:json" json:"response"`
	CreatedAt       int64         `gorm:"autoCreateTime" json:"created_at"`
}

type CreateMonitorConfigRequest struct {
	Name              string `json:"name" binding:"required"`
	URL               string `json:"url" binding:"required,url"`
	Method            string `json:"method" binding:"required,oneof=GET POST PUT"`
	Interval          int    `json:"interval" binding:"required,min=1"`
	Threshold         int    `json:"threshold" binding:"required,min=1"`
	Timeout           int    `json:"timeout" binding:"required,min=1"`
	IntegrationIdList []uint `json:"integration_id_list"`
}

type UpdateMonitorConfigRequest struct {
	Name              *string `json:"name"`
	URL               *string `json:"url" binding:"omitempty,url"`
	Method            *string `json:"method" binding:"omitempty,oneof=GET POST PUT"`
	Interval          *int    `json:"interval" binding:"omitempty,min=1"`
	Threshold         *int    `json:"threshold" binding:"omitempty,min=1"`
	Timeout           *int    `json:"timeout" binding:"omitempty,min=1"`
	Enabled           *bool   `json:"enabled"`
	IntegrationIdList *[]uint `json:"integration_id_list"`
}

const totalSlots = 25

func generateSlots(attempts []Attempt, intervalInSeconds int) []Slot {
	slots := make([]Slot, totalSlots)

	for i := range slots {
		slots[i] = Slot{
			Timestamp:           0,
			Healthy:             false,
			IsMonitoringEnabled: false,
		}
	}

	if intervalInSeconds <= 0 {
		return slots
	}

	intervalInMilliseconds := int64(intervalInSeconds) * 1000

	now := time.Now().UnixNano() / int64(time.Millisecond)

	referenceTime := (now / intervalInMilliseconds) * intervalInMilliseconds

	for _, attempt := range attempts {
		attemptTime := attempt.CreatedAt * 1000

		intervalsPassed := int(math.Floor(float64(referenceTime-attemptTime) / float64(intervalInMilliseconds)))

		finalIndex := totalSlots - 1 - intervalsPassed

		if finalIndex >= 0 && finalIndex < totalSlots {
			slots[finalIndex] = Slot{
				Timestamp:           attemptTime,
				Healthy:             attempt.Healthy,
				IsMonitoringEnabled: true,
			}
		}
	}

	return slots
}
