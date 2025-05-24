package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a user in the system
// @Description User model
type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty" example:"507f1f77bcf86cd799439011"`
	Username  string             `bson:"username" json:"username" example:"john_doe"`
	Email     string             `bson:"email" json:"email" example:"john@example.com"`
	Password  string             `bson:"password" json:"-"` // "-" means this field is not included in JSON response
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt" example:"2023-12-01T10:00:00Z"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt" example:"2023-12-01T10:00:00Z"`
}

// UserResponse is the user response without sensitive data
// @Description User response model without sensitive data
type UserResponse struct {
	ID        primitive.ObjectID `json:"id,omitempty" example:"507f1f77bcf86cd799439011"`
	Username  string             `json:"username" example:"john_doe"`
	Email     string             `json:"email" example:"john@example.com"`
	CreatedAt time.Time          `json:"createdAt" example:"2023-12-01T10:00:00Z"`
}

// ErrorResponse represents an error response
// @Description Error response model
type ErrorResponse struct {
	Error   string `json:"error" example:"Something went wrong"`
	Details string `json:"details,omitempty" example:"Additional error details"`
}
