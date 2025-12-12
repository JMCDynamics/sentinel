package monitor

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mateusgcoelho/sentinel/engine/internal/integration"
	"gorm.io/gorm"
)

type MonitorHandler struct {
	database *gorm.DB
}

func NewHandler(db *gorm.DB) *MonitorHandler {
	return &MonitorHandler{
		database: db,
	}
}

func (h *MonitorHandler) SetupRoutes(r *gin.Engine) {
	monitors := r.Group("/monitors")
	{
		monitors.POST("", h.HandleCreateMonitor)
		monitors.GET("", h.HandleListMonitors)
		monitors.PUT("/:id", h.HandleUpdateMonitor)
		monitors.GET("/:id", h.HandleGetMonitorDetails)
	}

	events := r.Group("/events")
	{
		events.GET("", h.HandleListAttempts)
	}
}

func (h *MonitorHandler) HandleListAttempts(c *gin.Context) {
	var attempts []Attempt

	if err := h.database.
		Where("healthy = ?", false).
		Order("id DESC").
		Limit(20).
		Preload("MonitorConfig").
		Find(&attempts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to retrieve attempts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": attempts})
}

func (h *MonitorHandler) HandleGetMonitorDetails(c *gin.Context) {
	var monitor MonitorConfig
	if err := h.database.Preload("Integrations").First(&monitor, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "monitor not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": monitor})
}

func (h *MonitorHandler) HandleCreateMonitor(c *gin.Context) {
	var req CreateMonitorConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	if len(req.IntegrationIdList) <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "at least one integration is required"})
		return
	}

	var integrations []integration.IntegrationConfig
	if err := h.database.
		Where("id IN ?", req.IntegrationIdList).
		Find(&integrations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to retrieve integrations"})
		return
	}

	if len(integrations) != len(req.IntegrationIdList) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "one or more integrations not found"})
		return
	}

	monitor := MonitorConfig{
		Name:         req.Name,
		URL:          req.URL,
		Method:       req.Method,
		Interval:     req.Interval,
		Threshold:    req.Threshold,
		Timeout:      req.Timeout,
		Healthy:      false,
		Running:      false,
		Integrations: integrations,
	}

	if err := h.database.Create(&monitor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to create monitor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "monitor created successfully", "data": monitor})
}

func (h *MonitorHandler) HandleListMonitors(c *gin.Context) {
	var monitors []MonitorConfig

	if err := h.database.
		Order("enabled DESC").
		Find(&monitors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to retrieve monitors"})
		return
	}

	for i, monitor := range monitors {
		var attempts []Attempt

		cutoff := int64(monitor.Interval * 27)

		if err := h.database.
			Where("monitor_config_id = ? AND created_at >= strftime('%s', 'now') - ?", monitor.ID, cutoff).
			Order("id DESC").
			Limit(25).
			Find(&attempts).Error; err != nil {
			continue
		}

		monitors[i].Slots = generateSlots(attempts, monitor.Interval)
	}

	c.JSON(http.StatusOK, gin.H{"data": monitors})
}

func (m *MonitorHandler) HandleUpdateMonitor(c *gin.Context) {
	var req UpdateMonitorConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	var monitor MonitorConfig
	if err := m.database.First(&monitor, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "monitor not found"})
		return
	}

	if req.Name != nil {
		monitor.Name = *req.Name
	}
	if req.URL != nil {
		monitor.URL = *req.URL
	}
	if req.Method != nil {
		monitor.Method = *req.Method
	}
	if req.Interval != nil {
		monitor.Interval = *req.Interval
	}
	if req.Threshold != nil {
		monitor.Threshold = *req.Threshold
	}
	if req.Timeout != nil {
		monitor.Timeout = *req.Timeout
	}
	if req.Enabled != nil {
		monitor.Enabled = *req.Enabled
		if !*req.Enabled {
			monitor.Running = false
			monitor.Healthy = false
		}
	}
	if req.IntegrationIdList != nil {
		if len(*req.IntegrationIdList) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"message": "at least one integration is required"})
			return
		}

		var integrations []integration.IntegrationConfig
		if err := m.database.
			Where("id IN ?", *req.IntegrationIdList).
			Find(&integrations).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to retrieve integrations"})
			return
		}

		if len(integrations) != len(*req.IntegrationIdList) {
			c.JSON(http.StatusBadRequest, gin.H{"message": "one or more integrations not found"})
			return
		}

		if err := m.database.Model(&monitor).Association("Integrations").Clear(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to clear existing integrations"})
			return
		}

		monitor.Integrations = integrations
	}

	if err := m.database.Save(&monitor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to update monitor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "monitor updated successfully", "data": monitor})
}
