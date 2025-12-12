package request

import (
	"github.com/mateusgcoelho/sentinel/engine/internal/apikey"
	"gorm.io/datatypes"
)

type RequestLog struct {
	ID             uint                `gorm:"primaryKey" json:"id"`
	ServiceName    string              `json:"serviceName"`
	Timestamp      int64               `json:"timestamp"`
	Method         string              `json:"method"`
	URL            string              `json:"url"`
	StatusCode     int                 `json:"statusCode"`
	Duration       int64               `json:"duration"`
	IP             string              `json:"ip"`
	UserAgent      string              `json:"userAgent"`
	Query          datatypes.JSON      `gorm:"type:json" json:"query"`
	Params         datatypes.JSON      `gorm:"type:json" json:"params"`
	Headers        datatypes.JSON      `gorm:"type:json" json:"headers"`
	Body           *string             `json:"body"`
	ApiKeyConfigID uint                `gorm:"not null" json:"api_key_config_id"`
	ApiKeyConfig   apikey.ApiKeyConfig `gorm:"foreignKey:ApiKeyConfigID" json:"-"`
}
