package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Message represents a chat message
type Message struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Content   string             `bson:"content" json:"content"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId"`
	RoomID    string             `bson:"roomId" json:"roomId"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

// ChatToken represents a token response for chat authentication
type ChatToken struct {
	Token string `json:"token"`
}
