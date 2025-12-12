package apikey

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ApiKeyMiddleware struct {
	database *gorm.DB
}

func NewApiKeyMiddleware(db *gorm.DB) *ApiKeyMiddleware {
	return &ApiKeyMiddleware{
		database: db,
	}
}

func (m *ApiKeyMiddleware) ValidateApiKey(c *gin.Context) {
	apiKeyToken := c.GetHeader("X-API-KEY")
	if apiKeyToken == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "API key is required"})
		c.Abort()
		return
	}

	var apiKey ApiKeyConfig
	if err := m.database.Where("value = ? AND revoked = false", apiKeyToken).First(&apiKey).Error; err != nil {
		println(err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to validate API key"})

		c.Abort()
		return
	}

	c.Set("api_key_config_id", apiKey.ID)

	c.Next()
}
