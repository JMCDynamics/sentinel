package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

var (
	WITH_FAKE_ERROR_DATABASE = false
	WITH_FAKE_ERROR_WHATSAPP = false
)

// To simulate errors in services for testing purposes.
func main() {
	r := gin.Default()

	r.GET("/check-database", func(c *gin.Context) {
		if WITH_FAKE_ERROR_DATABASE {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "database connection failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "database connection successful"})
	})

	r.GET("/whatsapp/queue-check", func(c *gin.Context) {
		if WITH_FAKE_ERROR_WHATSAPP {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "whatsapp queue check failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "whatsapp queue is healthy"})
	})

	r.POST("/toggle", func(c *gin.Context) {
		kind := c.Query("kind")

		switch kind {
		case "database":
			WITH_FAKE_ERROR_DATABASE = !WITH_FAKE_ERROR_DATABASE
			c.JSON(http.StatusOK, gin.H{"status": "ok", "database_error": WITH_FAKE_ERROR_DATABASE})
			return
		case "whatsapp":
			WITH_FAKE_ERROR_WHATSAPP = !WITH_FAKE_ERROR_WHATSAPP
			c.JSON(http.StatusOK, gin.H{"status": "ok", "whatsapp_error": WITH_FAKE_ERROR_WHATSAPP})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "invalid kind"})
	})

	if err := r.Run(":6276"); err != nil {
		panic(err)
	}
}
