package monitor

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/mateusgcoelho/sentinel/engine/internal/discord"
	"github.com/mateusgcoelho/sentinel/engine/internal/integration"
	"github.com/mateusgcoelho/sentinel/engine/internal/slack"
	"gorm.io/gorm"
)

var (
	ErrDeadlineExceeded = fmt.Errorf("request timeout exceeded")
)

func ExecuteMonitor(database *gorm.DB, monitorConfig MonitorConfig) {
	logPrefix := fmt.Sprintf("[execute-monitor id=%d name=%s]", monitorConfig.ID, monitorConfig.Name)

	log.Printf("%s executing monitor...", logPrefix)

	executionResponse, err := executeHttpRequestToEndpoint(monitorConfig)

	isHealthy := err == nil && (executionResponse.StatusCode >= 200 && executionResponse.StatusCode < 300)
	response := executionResponse.ResponseBody
	if err != nil {
		response = err.Error()
	}

	log.Printf("%s execution completed. healthy: %t", logPrefix, isHealthy)

	attempt := Attempt{
		MonitorConfigID: monitorConfig.ID,
		Healthy:         isHealthy,
		StatusCode:      executionResponse.StatusCode,
		Response:        response,
	}
	if err := database.Create(&attempt).Error; err != nil {
		log.Printf("%s failed to log attempt: %v", logPrefix, err)
		return
	}

	if !isHealthy {
		monitorConfig.FailedAttempts += 1
	}

	if monitorConfig.FailedAttempts >= monitorConfig.Threshold && isHealthy {
		log.Printf("%s monitor has recovered after %d failed attempts", logPrefix, monitorConfig.FailedAttempts)

		monitorConfig.FailedAttempts = 0

		for _, item := range monitorConfig.Integrations {
			if item.Type == integration.IntegrationTypeDiscord {
				if err := discord.SendRecoverMessage(item.URL, monitorConfig.Name, monitorConfig.FailedAttempts); err != nil {
					log.Printf("%s failed to send recovery alert via integration [%s]: %v", logPrefix, item.Name, err)
				} else {
					log.Printf("%s recovery alert sent successfully via integration [%s]", logPrefix, item.Name)
				}
				continue
			}

			if item.Type == integration.IntegrationTypeSlack {
				if err := slack.SendRecoverMessage(item.URL, monitorConfig.Name, monitorConfig.FailedAttempts); err != nil {
					log.Printf("%s failed to send recovery alert via integration [%s]: %v", logPrefix, item.Name, err)
				} else {
					log.Printf("%s recovery alert sent successfully via integration [%s]", logPrefix, item.Name)
				}
				continue
			}
		}
	}

	if monitorConfig.FailedAttempts > monitorConfig.Threshold*3 && !isHealthy {
		monitorConfig.FailedAttempts = 1
	}

	if monitorConfig.FailedAttempts == monitorConfig.Threshold && !isHealthy {
		log.Printf("%s monitor failed after %d attempts", logPrefix, monitorConfig.FailedAttempts)

		for _, item := range monitorConfig.Integrations {
			if item.Type == integration.IntegrationTypeDiscord {
				if err := discord.SendAlertMessage(item.URL, monitorConfig.Name, executionResponse.ResponseBody, monitorConfig.FailedAttempts); err != nil {
					log.Printf("%s failed to send recovery alert via integration [%s]: %v", logPrefix, item.Name, err)
				} else {
					log.Printf("%s recovery alert sent successfully via integration [%s]", logPrefix, item.Name)
				}
				continue
			}

			if item.Type == integration.IntegrationTypeSlack {
				if err := slack.SendAlertMessage(item.URL, monitorConfig.Name, executionResponse.ResponseBody, monitorConfig.FailedAttempts); err != nil {
					log.Printf("%s failed to send recovery alert via integration [%s]: %v", logPrefix, item.Name, err)
				} else {
					log.Printf("%s recovery alert sent successfully via integration [%s]", logPrefix, item.Name)
				}
				continue
			}
		}
	}

	tx := database.Model(&MonitorConfig{}).
		Where("id = ? AND enabled = ?", monitorConfig.ID, true).
		UpdateColumns(map[string]any{
			"last_run":        gorm.Expr("strftime('%s','now')"),
			"healthy":         isHealthy,
			"running":         false,
			"failed_attempts": monitorConfig.FailedAttempts,
		})
	if tx.Error != nil {
		log.Printf("%s failed to update monitor status: %v", logPrefix, tx.Error)
		return
	}
}

type ExecutionResponse struct {
	StatusCode   int
	ResponseBody string
}

func executeHttpRequestToEndpoint(monitorConfig MonitorConfig) (response ExecutionResponse, err error) {
	timeout := time.Duration(monitorConfig.Timeout) * time.Second
	ctx, cancel := context.WithDeadline(context.Background(), time.Now().Add(timeout))
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, monitorConfig.Method, monitorConfig.URL, nil)
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return ExecutionResponse{}, ErrDeadlineExceeded
		}

		return ExecutionResponse{}, fmt.Errorf("failed to create http request: %v", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		if err == context.DeadlineExceeded || ctx.Err() == context.DeadlineExceeded {
			return ExecutionResponse{}, ErrDeadlineExceeded
		}

		return ExecutionResponse{}, fmt.Errorf("failed to execute http request: %v", err)
	}
	defer resp.Body.Close()

	var responseBody string

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		responseBody = fmt.Sprintf("failed to read response body: %v", err)
	} else {
		responseBody = string(bodyBytes)
	}

	return ExecutionResponse{
		StatusCode:   resp.StatusCode,
		ResponseBody: responseBody,
	}, nil
}
