package auth

import (
	"crypto/rand"
	"log"
	"math/big"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func NewJwtToken(sub string, jwtSecret []byte) (string, error) {
	claims := jwt.MapClaims{
		"sub": sub,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(jwtSecret)
}

func randomJwtSecret() ([]byte, error) {
	const secretLength = 32
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/`~"

	b := make([]byte, secretLength)

	for i := range b {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return nil, err
		}
		b[i] = charset[n.Int64()]
	}

	return b, nil
}

func EnsureJwtSecret() ([]byte, error) {
	secret, err := randomJwtSecret()
	if err != nil {
		return nil, err
	}

	f, err := os.OpenFile(".env", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	defer f.Close()

	_, err = f.WriteString("\nJWT_SECRET=\"" + string(secret) + "\"\n")
	if err != nil {
		return nil, err
	}

	log.Println("[config] generated and persisted JWT secret in .env")

	return secret, nil
}

func validateJwtToken(tokenString string, jwtSecret []byte) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrTokenMalformed
		}
		return jwtSecret, nil
	})
}
