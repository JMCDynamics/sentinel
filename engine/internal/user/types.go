package user

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Username string `gorm:"uniqueIndex;not null"`
	Password string `gorm:"not null"`
}

type UpdateProfileRequest struct {
	Password string `json:"password" binding:"required,min=8"`
}
