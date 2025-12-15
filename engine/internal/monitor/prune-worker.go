package monitor

import (
	"log"
	"time"

	"gorm.io/gorm"
)

type PruneEventsWorker struct {
	database *gorm.DB
}

func NewPruneEventsWorker(db *gorm.DB) *PruneEventsWorker {
	return &PruneEventsWorker{
		database: db,
	}
}

func (w *PruneEventsWorker) StartWorker() error {
	log.Println("[prune-events-worker] starting prune events worker")

	for {
		cutoff := time.Now().Add(-30 * time.Minute)
		log.Printf("[prune-events-worker] pruning monitor events older than %d", cutoff.Unix())

		result := w.database.Where("created_at < ?", cutoff.Unix()).Delete(&Attempt{})

		if result.Error != nil {
			log.Printf("[prune-events-worker] failed to prune monitor events: %v", result.Error)
		} else {
			log.Printf("[prune-events-worker] successfully pruned %d old monitor events", result.RowsAffected)
		}

		time.Sleep(30 * time.Second)
	}
}
