package request

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mateusgcoelho/sentinel/engine/internal/pagination"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type RequestLogHandler struct {
	database *gorm.DB

	apiKeyMiddleware gin.HandlerFunc
}

func NewHandler(db *gorm.DB, apiKeyMiddleware gin.HandlerFunc) *RequestLogHandler {
	return &RequestLogHandler{
		database:         db,
		apiKeyMiddleware: apiKeyMiddleware,
	}
}

func (h *RequestLogHandler) SetupRoutes(r *gin.Engine) {
	request := r.Group("/requests")
	{
		request.GET("", h.HandleListRequestLogs)
		request.POST("", h.apiKeyMiddleware, h.HandleCaptureLog)
		request.GET("/metrics", h.HandleGetMetrics)
	}
}

func (h *RequestLogHandler) HandleGetMetrics(c *gin.Context) {
	now := time.Now()
	startOfToday := time.Date(
		now.Year(),
		now.Month(),
		now.Day(),
		0, 0, 0, 0,
		now.Location(),
	)

	var metrics Metrics
	if err := h.database.Model(&RequestLog{}).
		Where("timestamp >= ?", startOfToday.UnixMilli()).
		Count(&metrics.TotalRequests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate total requests"})
		return
	}

	var errorCount int64
	if err := h.database.Model(&RequestLog{}).
		Where("status_code >= ?", 500).
		Where("timestamp >= ?", startOfToday.UnixMilli()).
		Count(&errorCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate error rate"})
		return
	}
	if metrics.TotalRequests > 0 {
		metrics.ErrorRate = float64(errorCount) / float64(metrics.TotalRequests) * 100
	} else {
		metrics.ErrorRate = 0
	}

	dailyTraffic := []DailyTraffic{}

	sqlQuery := `
		WITH RECURSIVE time_buckets(time_interval) AS (
			SELECT (CAST(? AS INTEGER) / 1800000) * 1800000
			UNION ALL
			SELECT time_interval + 1800000
			FROM time_buckets
			WHERE time_interval + 1800000 <= ?
		)
		SELECT
			CASE
				WHEN rl.status_code >= 200 AND rl.status_code < 500 THEN 1
				ELSE 0
			END AS successful,
			tb.time_interval,
			COALESCE(COUNT(rl.timestamp), 0) AS count
		FROM
			time_buckets tb
		LEFT JOIN request_logs rl
			ON ((CAST(rl.timestamp AS INTEGER) / 1800000) * 1800000) = tb.time_interval
		GROUP BY
			tb.time_interval,
    		successful
		ORDER BY
			tb.time_interval,
			successful DESC;
	`
	err := h.database.Raw(sqlQuery, startOfToday.UnixMilli(), now.UnixMilli()).Scan(&dailyTraffic).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate today's traffic"})
		return
	}
	metrics.DailyTraffic = dailyTraffic

	var groupedRequests []GroupedRequest = []GroupedRequest{}

	sqlQuery = `
		SELECT
			service_name,
			method,
			url,
			COUNT(*) AS total,
			SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) AS failed,
			AVG(duration) AS average_duration
		FROM request_logs
		GROUP BY service_name, method, url
		ORDER BY total DESC
		LIMIT 10;
	`
	err = h.database.Raw(sqlQuery).Scan(&groupedRequests).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate grouped requests"})
		return
	}
	metrics.GroupedRequests = groupedRequests

	c.JSON(http.StatusOK, gin.H{"data": metrics})
}

func (h *RequestLogHandler) HandleListRequestLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))

	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}

	offset := (page - 1) * perPage

	var total int64
	if err := h.database.Model(&RequestLog{}).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count request logs"})
		return
	}

	var logs []RequestLog
	if err := h.database.
		Order("timestamp DESC").
		Limit(perPage).
		Offset(offset).
		Find(&logs).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve request logs"})
		return
	}

	pagination := pagination.New(int(total), perPage, page)

	c.JSON(http.StatusOK, gin.H{
		"data":       logs,
		"pagination": pagination,
	})
}

func (h *RequestLogHandler) HandleCaptureLog(c *gin.Context) {
	apiKeyConfigID := c.GetUint("api_key_config_id")
	if apiKeyConfigID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid API key"})
		return
	}

	var req []RequestLogDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var entries = []RequestLog{}

	for _, r := range req {
		entries = append(entries, RequestLog{
			ServiceName:    r.ServiceName,
			Timestamp:      r.Timestamp,
			Method:         r.Method,
			URL:            r.URL,
			StatusCode:     r.StatusCode,
			Duration:       r.Duration,
			IP:             r.IP,
			UserAgent:      r.UserAgent,
			Query:          datatypes.JSON(r.Query),
			Params:         datatypes.JSON(r.Params),
			Headers:        datatypes.JSON(r.Headers),
			Body:           anyToString(r.Body),
			ApiKeyConfigID: apiKeyConfigID,
		})
	}

	if err := h.database.Create(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to capture request log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "request log captured successfully"})
}

func anyToString(data any) string {
	switch v := data.(type) {
	case string:
		return v
	case nil:
		return ""
	default:
		bytes, err := json.Marshal(v)
		if err != nil {
			return ""
		}
		return string(bytes)
	}
}
