package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Message represents a chat message
// @Description Chat message model
type Message struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty" example:"507f1f77bcf86cd799439011"`
	Content   string             `bson:"content" json:"content" example:"Hello, how are you?"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId" example:"507f1f77bcf86cd799439012"`
	RoomID    string             `bson:"roomId" json:"roomId" example:"room123"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt" example:"2023-12-01T10:00:00Z"`
}

// MessageRequest represents the request payload for creating a message
// @Description Request payload for creating a chat message
type MessageRequest struct {
	Content string `json:"content" binding:"required" example:"Hello, how are you?"`
	RoomID  string `json:"roomId" binding:"required" example:"room123"`
}

// ChatToken represents a token response for chat authentication
// @Description Chat authentication token response
type ChatToken struct {
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}
