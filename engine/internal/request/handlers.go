package request

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

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
	}
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
		Order("id DESC").
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
			ServiceName: r.ServiceName,
			Timestamp:   r.Timestamp,
			Method:      r.Method,
			URL:         r.URL,
			StatusCode:  r.StatusCode,
			Duration:    r.Duration,
			IP:          r.IP,
			UserAgent:   r.UserAgent,
			Query:       datatypes.JSON(r.Query),
			Params:      datatypes.JSON(r.Params),
			Headers:     datatypes.JSON(r.Headers),
			Body:        anyToString(r.Body),
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
