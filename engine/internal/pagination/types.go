package pagination

type Pagination struct {
	TotalItems  int  `json:"total_items"`
	TotalPages  int  `json:"total_pages"`
	Page        int  `json:"page"`
	PerPage     int  `json:"per_page"`
	HasNext     bool `json:"has_next"`
	HasPrevious bool `json:"has_previous"`
}

func New(totalItems, perPage, currentPage int) *Pagination {
	if perPage <= 0 {
		perPage = 10
	}
	if currentPage <= 0 {
		currentPage = 1
	}

	totalPages := (totalItems + perPage - 1) / perPage

	return &Pagination{
		TotalItems:  totalItems,
		TotalPages:  totalPages,
		Page:        currentPage,
		PerPage:     perPage,
		HasNext:     currentPage < totalPages,
		HasPrevious: currentPage > 1,
	}
}
