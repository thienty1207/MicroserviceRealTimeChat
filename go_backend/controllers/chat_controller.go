package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/realtime-chat/go_backend/config"
	"github.com/realtime-chat/go_backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetChatToken generates a token for chat services using Stream Chat API
// @Summary Get Stream Chat token
// @Description Generate a token for authenticating with Stream Chat API
// @Tags Chat
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.ChatToken "Successfully generated token"
// @Failure 401 {object} map[string]string "Unauthorized - User not authenticated"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/chat/token [get]
func GetChatToken(c *gin.Context) {
	// Get the user ID from the context (set by middleware)
	userIDObj, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userID, ok := userIDObj.(primitive.ObjectID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user ID"})
		return
	}

	// Convert ObjectID to string for Stream Chat
	userIDStr := userID.Hex()

	// Generate Stream Chat token
	token, err := config.StreamClient.CreateToken(userIDStr, time.Now().Add(24*time.Hour))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Stream token", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.ChatToken{Token: token})
}

// SaveMessage saves a chat message to the database
// @Summary Save a chat message
// @Description Save a new chat message to the database
// @Tags Chat
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param message body models.MessageRequest true "Message data"
// @Success 201 {object} models.Message "Successfully saved message"
// @Failure 400 {object} map[string]string "Bad request - Invalid message data"
// @Failure 401 {object} map[string]string "Unauthorized - User not authenticated"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/chat/messages [post]
func SaveMessage(c *gin.Context) {
	// Extract message data from request
	var message models.Message
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by middleware)
	userIDObj, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userID, ok := userIDObj.(primitive.ObjectID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user ID"})
		return
	}

	// Set message properties
	message.UserID = userID
	message.CreatedAt = time.Now()
	message.ID = primitive.NewObjectID()

	// Here you would save the message to MongoDB
	// For now, we'll just return a success response
	c.JSON(http.StatusCreated, message)
}
