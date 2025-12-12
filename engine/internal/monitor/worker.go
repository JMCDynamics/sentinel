package monitor

import (
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

type MonitorWorker struct {
	database *gorm.DB
}

func NewWorker(db *gorm.DB) *MonitorWorker {
	return &MonitorWorker{
		database: db,
	}
}

func (w *MonitorWorker) StartWorker() error {
	log.Println("[worker] starting monitor worker")

	if err := w.updateRunningMonitorsToFalse(); err != nil {
		return err
	}

	for {
		var monitors []MonitorConfig
		now := time.Now().Unix()

		if err := w.database.Where("(last_run + interval) <= ? AND running = ? AND enabled = ?", now, false, true).Preload("Integrations").Find(&monitors).Error; err != nil {
			log.Printf("[worker] failed to retrieve monitors for execution: %v", err)
			continue
		}

		for _, m := range monitors {
			logPrefix := fmt.Sprintf("[worker] [monitor_config_id: %d | monitor_config_name: %s]", m.ID, m.Name)

			m.Running = true
			if err := w.database.Save(&m).Error; err != nil {
				log.Printf("%s failed to set monitor as running: %v", logPrefix, err)
				continue
			}

			go ExecuteMonitor(w.database, m)
		}

		time.Sleep(300 * time.Millisecond)
	}
}

func (w *MonitorWorker) updateRunningMonitorsToFalse() error {
	if err := w.database.Model(&MonitorConfig{}).
		Where("running = ?", true).
		Update("running", false).Error; err != nil {
		return fmt.Errorf("failed to update running monitors: %w", err)
	}

	return nil
}
