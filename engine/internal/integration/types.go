package integration

type IntegrationType string

const (
	IntegrationTypeSlack   IntegrationType = "SLACK"
	IntegrationTypeDiscord IntegrationType = "DISCORD"
)

type IntegrationConfig struct {
	ID        uint            `gorm:"primaryKey" json:"id"`
	Name      string          `gorm:"not null" json:"name"`
	Type      IntegrationType `gorm:"not null" json:"type"`
	URL       string          `gorm:"not null" json:"url"`
	CreatedAt int64           `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt int64           `gorm:"autoUpdateTime" json:"updated_at"`
}

type CreateIntegrationConfigRequest struct {
	Name string          `json:"name" binding:"required"`
	Type IntegrationType `json:"type" binding:"required,oneof=SLACK DISCORD"`
	URL  string          `json:"url" binding:"required,url"`
}
