package slack

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type SlackBlocksPayload struct {
	Blocks []any `json:"blocks"`
}

func SendRecoverMessage(webhookURL, monitorName string, failedAttempts int) error {
	payload := SlackBlocksPayload{
		Blocks: []any{
			map[string]any{
				"type": "header",
				"text": map[string]string{
					"type": "plain_text",
					"text": "✅ Uff.. All good now!",
				},
			},
			map[string]any{
				"type": "section",
				"text": map[string]string{
					"type": "mrkdwn",
					"text": fmt.Sprintf(
						"The service *%s* is back to normal.",
						monitorName,
					),
				},
			},
			map[string]any{
				"type": "section",
				"fields": []map[string]string{
					{
						"type": "mrkdwn",
						"text": "*Status:*\n🟢 Healthy",
					},
					{
						"type": "mrkdwn",
						"text": fmt.Sprintf(
							"*Time:*\n%s",
							time.Now().Format("2006-01-02 15:04:05"),
						),
					},
				},
			},
			map[string]any{
				"type": "divider",
			},
			map[string]any{
				"type": "context",
				"elements": []map[string]string{
					{
						"type": "mrkdwn",
						"text": "🔧 Automatic monitor • Sentinel (JMCDynamics)",
					},
				},
			},
		},
	}

	return sendSlackBlocks(webhookURL, payload)
}

func SendAlertMessage(webhookURL, monitorName string, errorMessage string, failedAttempts int) error {
	payload := SlackBlocksPayload{
		Blocks: []any{
			map[string]any{
				"type": "header",
				"text": map[string]string{
					"type": "plain_text",
					"text": "🚨 Ops... Look out!!",
				},
			},
			map[string]any{
				"type": "section",
				"text": map[string]string{
					"type": "mrkdwn",
					"text": fmt.Sprintf(
						"<!here>\n*%s* failed to respond!",
						monitorName,
					),
				},
			},
			map[string]any{
				"type": "section",
				"fields": []map[string]string{
					{
						"type": "mrkdwn",
						"text": "*Status:*\n❌ Unhealthy",
					},
					{
						"type": "mrkdwn",
						"text": fmt.Sprintf(
							"*Consecutive failures:*\n%d",
							failedAttempts,
						),
					},
					{
						"type": "mrkdwn",
						"text": fmt.Sprintf(
							"*Last error:*\n%s",
							errorMessage,
						),
					},
					{
						"type": "mrkdwn",
						"text": fmt.Sprintf(
							"*Time:*\n%s",
							time.Now().Format("2006-01-02 15:04:05"),
						),
					},
				},
			},
			map[string]any{
				"type": "divider",
			},
			map[string]any{
				"type": "context",
				"elements": []map[string]string{
					{
						"type": "mrkdwn",
						"text": "🔧 Automatic monitor • Sentinel (JMCDynamics)",
					},
				},
			},
		},
	}

	return sendSlackBlocks(webhookURL, payload)
}

func sendSlackBlocks(webhookURL string, payload any) error {
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

	if resp.StatusCode != 200 {
		return fmt.Errorf("slack retornou status %d", resp.StatusCode)
	}

	return nil
}
