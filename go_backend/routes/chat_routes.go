package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/realtime-chat/go_backend/controllers"
	"github.com/realtime-chat/go_backend/middleware"
)

// SetupChatRoutes sets up all chat-related routes
func SetupChatRoutes(r *gin.Engine) {
	// Health check route has been removed as it's not essential for core functionality

	chatRoutes := r.Group("/api/chat")

	// Route for debugging token issues (no auth required)
	chatRoutes.GET("/debug", func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		jwtCookie, _ := c.Cookie("jwt")

		c.JSON(200, gin.H{
			"hasAuthHeader": authHeader != "",
			"hasCookie":     jwtCookie != "",
		})
	})

	// Protected routes (require authentication)
	chatRoutes.GET("/token", middleware.AuthMiddleware(), controllers.GetChatToken)
	chatRoutes.POST("/messages", middleware.AuthMiddleware(), controllers.SaveMessage)
}
