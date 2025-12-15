package request

import (
	"encoding/json"

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
	Duration       float64             `json:"duration"`
	IP             string              `json:"ip"`
	UserAgent      string              `json:"userAgent"`
	Query          datatypes.JSON      `gorm:"type:json" json:"query"`
	Params         datatypes.JSON      `gorm:"type:json" json:"params"`
	Headers        datatypes.JSON      `gorm:"type:json" json:"headers"`
	Body           string              `json:"body"`
	ApiKeyConfigID uint                `gorm:"not null" json:"api_key_config_id"`
	ApiKeyConfig   apikey.ApiKeyConfig `gorm:"foreignKey:ApiKeyConfigID" json:"-"`
}

type RequestLogDTO struct {
	ServiceName    string          `json:"serviceName"`
	Timestamp      int64           `json:"timestamp"`
	Method         string          `json:"method"`
	URL            string          `json:"url"`
	StatusCode     int             `json:"statusCode"`
	Duration       float64         `json:"duration"`
	IP             string          `json:"ip"`
	UserAgent      string          `json:"userAgent"`
	Query          json.RawMessage `json:"query"`
	Params         json.RawMessage `json:"params"`
	Headers        json.RawMessage `json:"headers"`
	Body           any             `json:"body"`
	ApiKeyConfigID uint            `json:"api_key_config_id"`
}
