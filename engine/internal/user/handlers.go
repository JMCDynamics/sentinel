package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mateusgcoelho/sentinel/engine/internal/password"
	"gorm.io/gorm"
)

type UserHandler struct {
	database *gorm.DB
}

func NewHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{
		database: db,
	}
}

func (h *UserHandler) SetupRoutes(r *gin.Engine) {
	user := r.Group("/users")
	{
		user.PATCH("", h.HandleUpdateProfile)
	}
}

func (h *UserHandler) HandleUpdateProfile(c *gin.Context) {
	userID := c.GetString("user_id")

	var user User
	if err := h.database.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user not found"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	hashedPassword, err := password.Hash(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user.Password = hashedPassword

	if err := h.database.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "profile updated successfully"})
}
