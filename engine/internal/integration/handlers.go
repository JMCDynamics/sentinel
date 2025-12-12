package integration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type IntegrationHandler struct {
	database *gorm.DB
}

func NewHandler(db *gorm.DB) *IntegrationHandler {
	return &IntegrationHandler{
		database: db,
	}
}

func (h *IntegrationHandler) SetupRoutes(r *gin.Engine) {
	integrations := r.Group("/integrations")
	{
		integrations.POST("", h.HandleCreateIntegration)
		integrations.GET("", h.HandleListIntegrations)
	}
}

func (h *IntegrationHandler) HandleCreateIntegration(c *gin.Context) {
	var req CreateIntegrationConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	integration := IntegrationConfig{
		Name: req.Name,
		Type: req.Type,
		URL:  req.URL,
	}

	if err := h.database.Create(&integration).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to create integration"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "integration created successfully", "data": integration})
}

func (h *IntegrationHandler) HandleListIntegrations(c *gin.Context) {
	search := c.Query("search")

	if search != "" {
		var integrations []IntegrationConfig
		if err := h.database.
			Where("name LIKE ?", ""+search+"%").
			Order("created_at DESC").
			Limit(50).
			Find(&integrations).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to list integrations"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": integrations})
		return
	}

	var integrations []IntegrationConfig

	if err := h.database.
		Order("created_at DESC").
		Find(&integrations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to list integrations"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": integrations})
}
