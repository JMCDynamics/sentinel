package apikey

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ApiKeyHandler struct {
	database *gorm.DB
}

func NewHandler(db *gorm.DB) *ApiKeyHandler {
	return &ApiKeyHandler{
		database: db,
	}
}

func (h *ApiKeyHandler) SetupRoutes(r *gin.Engine) {
	request := r.Group("/keys")
	{
		request.GET("", h.HandleListApiKeys)
		request.POST("", h.HandleCreateApiKey)
	}
}

func (h *ApiKeyHandler) HandleListApiKeys(c *gin.Context) {
	var apiKeys []ApiKeyConfig
	if err := h.database.Find(&apiKeys).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve API keys"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": apiKeys})
}

func (h *ApiKeyHandler) HandleCreateApiKey(c *gin.Context) {
	var req CreateApiKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	apiKey := ApiKeyConfig{
		Name:  req.Name,
		Value: GenerateSecureApiKey(),
	}
	if err := h.database.Create(&apiKey).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create API key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "API key created successfully",
	})
}
