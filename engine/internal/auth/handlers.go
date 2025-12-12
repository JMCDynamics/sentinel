package auth

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/mateusgcoelho/sentinel/engine/internal/password"
	"github.com/mateusgcoelho/sentinel/engine/internal/user"
	"gorm.io/gorm"
)

type AuthHandler struct {
	database  *gorm.DB
	jwtSecret []byte
}

func NewHandler(db *gorm.DB, jwtSecret []byte) *AuthHandler {
	return &AuthHandler{
		database:  db,
		jwtSecret: jwtSecret,
	}
}

func (h *AuthHandler) SetupRoutes(r *gin.Engine) {
	auth := r.Group("/auth")
	{
		auth.POST("", h.HandleSignIn)
		auth.GET("/me", h.AuthMiddleware(), h.HandleMe)
		auth.POST("/sign-out", h.AuthMiddleware(), h.HandleSignOut)
	}
}

func (h *AuthHandler) HandleMe(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "authenticated"})
}

func (h *AuthHandler) HandleSignIn(c *gin.Context) {
	var req SignInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var user user.User
	if err := h.database.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	if valid := password.Compare(user.Password, req.Password); !valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	signedToken, err := NewJwtToken(fmt.Sprint(user.ID), h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.SetCookie(
		"auth_token",
		signedToken,
		86400,
		"/",
		"",
		false,
		true,
	)

	c.JSON(http.StatusOK, gin.H{"message": "sign-in successful"})
}

func (h *AuthHandler) HandleSignOut(c *gin.Context) {
	c.SetCookie(
		"auth_token",
		"",
		-1,
		"/",
		"",
		false,
		true,
	)

	c.JSON(http.StatusOK, gin.H{"message": "sign-out successful"})
}

func (h *AuthHandler) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("auth_token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authentication token required"})
			return
		}

		token, err := validateJwtToken(tokenStr, h.jwtSecret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authentication token"})
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		c.Set("user_id", claims["sub"])

		c.Next()
	}
}
