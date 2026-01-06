package server

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/mateusgcoelho/sentinel/engine/internal/config"
)

type IHandler interface {
	SetupRoutes(r *gin.Engine)
}

type Server struct {
	config config.Config

	handlers []IHandler
}

func New(config config.Config, handlers []IHandler) *Server {
	return &Server{
		handlers: handlers,
		config:   config,
	}
}

func (s *Server) Run() error {
	r := gin.Default()

	s.useCors(r)

	for _, handler := range s.handlers {
		handler.SetupRoutes(r)
	}

	return r.Run()
}

func (s *Server) useCors(r *gin.Engine) {
	allowedOrigins := []string{
		"http://localhost:5173",
		"http://localhost:*",
	}
	if s.config.OriginAllowed != "" {
		allowedOrigins = append(allowedOrigins, s.config.OriginAllowed)
	}

	r.Use(cors.New(cors.Config{
		AllowWildcard:       true,
		AllowPrivateNetwork: true,
		AllowOrigins:        allowedOrigins,
		AllowMethods:        []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
		AllowHeaders: []string{
			"Content-Type",
			"Authorization",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
}
