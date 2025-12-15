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
	CreatedAt      int64               `gorm:"autoCreateTime" json:"created_at"`
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

type DailyTraffic struct {
	Successful   bool  `json:"successful"`
	TimeInterval int64 `json:"time_interval"`
	Count        int64 `json:"count"`
}

type GroupedRequest struct {
	ServiceName     string  `json:"service_name"`
	Method          string  `json:"method"`
	URL             string  `json:"url"`
	Total           int64   `json:"total"`
	Failed          int64   `json:"failed"`
	AverageDuration float64 `json:"average_duration"`
}

type Metrics struct {
	TotalRequests   int64            `json:"total_requests"`
	ErrorRate       float64          `json:"error_rate"`
	DailyTraffic    []DailyTraffic   `json:"daily_traffic"`
	GroupedRequests []GroupedRequest `json:"grouped_requests"`
}
