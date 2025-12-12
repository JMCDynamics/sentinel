package discord

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type DiscordWebhookPayload struct {
	Content string         `json:"content,omitempty"`
	Embeds  []DiscordEmbed `json:"embeds"`
}

type DiscordEmbed struct {
	Title       string              `json:"title"`
	Description string              `json:"description"`
	Color       int                 `json:"color"`
	Fields      []DiscordEmbedField `json:"fields,omitempty"`
	Footer      *DiscordEmbedFooter `json:"footer,omitempty"`
	Timestamp   string              `json:"timestamp,omitempty"`
}

type DiscordEmbedField struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline"`
}

type DiscordEmbedFooter struct {
	Text string `json:"text"`
}

func SendAlertMessage(webhookURL, monitorName string, errorMessage string, failedAttempts int) error {
	payload := DiscordWebhookPayload{
		Content: "@everyone",
		Embeds: []DiscordEmbed{
			{
				Title:       "🚨 Ops... Look out!!",
				Description: fmt.Sprintf("**%s** failed to respond!", monitorName),
				Color:       15158332,
				Fields: []DiscordEmbedField{
					{
						Name:   "Status",
						Value:  "❌ Unhealthy",
						Inline: true,
					},
					{
						Name:   "Consecutive failures",
						Value:  fmt.Sprintf("%d", failedAttempts),
						Inline: true,
					},
					{
						Name:   "Last error",
						Value:  errorMessage,
						Inline: false,
					},
				},
				Footer: &DiscordEmbedFooter{
					Text: "🔧 Automatic monitor • Sentinel (JMCDynamics)",
				},
				Timestamp: time.Now().Format(time.RFC3339),
			},
		},
	}

	return sendDiscordWebhook(webhookURL, payload)
}

func SendRecoverMessage(webhookURL, monitorName string, failedAttempts int) error {

	payload := DiscordWebhookPayload{
		Content: "@everyone",
		Embeds: []DiscordEmbed{
			{
				Title:       "✅ Uff.. All good now!",
				Description: fmt.Sprintf("The service **%s** is back to normal.", monitorName),
				Color:       3066993,
				Fields: []DiscordEmbedField{
					{
						Name:   "Status",
						Value:  "🟢 Healthy",
						Inline: true,
					},
				},
				Footer: &DiscordEmbedFooter{
					Text: "🔧 Automatic monitor • Sentinel (JMCDynamics)",
				},
				Timestamp: time.Now().Format(time.RFC3339),
			},
		},
	}

	return sendDiscordWebhook(webhookURL, payload)
}

func sendDiscordWebhook(webhookURL string, payload interface{}) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", webhookURL, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 204 && resp.StatusCode != 200 {
		return fmt.Errorf("discord retornou status %d", resp.StatusCode)
	}

	return nil
}
