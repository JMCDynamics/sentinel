package request

import (
	"log"
	"time"

	"gorm.io/gorm"
)

type PruneRequestsWorker struct {
	database *gorm.DB
}

func NewPruneRequestsWorker(db *gorm.DB) *PruneRequestsWorker {
	return &PruneRequestsWorker{
		database: db,
	}
}

func (w *PruneRequestsWorker) StartWorker() {
	log.Println("[prune-requests-worker] starting prune requests worker")

	for {
		cutoff := time.Now().Add(-42 * time.Hour)
		log.Printf("[prune-requests-worker] pruning request logs older than %d", cutoff.UnixMilli())

		result := w.database.Where("created_at < ? OR created_at IS NULL", cutoff.Unix()).Delete(&RequestLog{})

		if result.Error != nil {
			log.Printf("[prune-requests-worker] failed to prune request logs: %v", result.Error)
		} else {
			log.Printf("[prune-requests-worker] successfully pruned %d old request logs", result.RowsAffected)
		}

		time.Sleep(1 * time.Hour)
	}
}
