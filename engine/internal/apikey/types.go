package apikey

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
)

type ApiKeyConfig struct {
	ID        uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string `gorm:"type:varchar(255);not null" json:"name"`
	CreatedAt int64  `gorm:"autoCreateTime" json:"created_at"`
	Value     string `gorm:"type:varchar(512);not null;uniqueIndex" json:"value"`
	Revoked   bool   `gorm:"default:false" json:"revoked"`
	UpdatedAt int64  `gorm:"autoUpdateTime" json:"updated_at"`
}

type CreateApiKeyRequest struct {
	Name string `json:"name" binding:"required"`
}

func GenerateSecureApiKey() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		panic(err)
	}
	return fmt.Sprintf("heim_%s", base64.RawURLEncoding.EncodeToString(b))
}
