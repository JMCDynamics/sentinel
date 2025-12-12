package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mateusgcoelho/sentinel/engine/internal/auth"
)

const (
	ErrMissingEnvVariables = "missing required environment variables"
)

type Config struct {
	Username      string
	Password      string
	JwtSecret     []byte
	OriginAllowed string
}

func New() (Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("[config] no .env file found, relying on system environment variables")
	}

	rootUsername := os.Getenv("ROOT_USERNAME")
	rootPassword := os.Getenv("ROOT_PASSWORD")
	originAllowed := os.Getenv("CORS_ORIGIN_ALLOWED")
	jwtSecretEnvironment := os.Getenv("JWT_SECRET")
	var jwtSecret []byte

	if jwtSecretEnvironment == "" {
		secret, err := auth.EnsureJwtSecret()
		if err != nil {
			return Config{}, err
		}

		log.Println("[config] generated new JWT secret as none was found in environment variables")
		jwtSecret = secret
	} else {
		log.Println("[config] using existing JWT secret from environment variable")
		jwtSecret = []byte(jwtSecretEnvironment)
	}

	if rootUsername == "" {
		rootUsername = "admin"
	}

	if rootPassword == "" {
		rootPassword = "admin"
	}

	return Config{
		Username:      rootUsername,
		Password:      rootPassword,
		JwtSecret:     jwtSecret,
		OriginAllowed: originAllowed,
	}, nil
}
