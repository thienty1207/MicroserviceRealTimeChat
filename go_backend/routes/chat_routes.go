package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/realtime-chat/go_backend/controllers"
	"github.com/realtime-chat/go_backend/middleware"
)

// SetupChatRoutes sets up all chat-related routes
func SetupChatRoutes(r *gin.Engine) {
	// Health check route (no auth required)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Go backend is running",
		})
	})

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
