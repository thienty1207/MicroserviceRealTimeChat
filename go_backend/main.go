// @title RealTimeChat Go API
// @version 1.0
// @description Go backend API for RealTimeChat application
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:5002
// @BasePath /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/realtime-chat/go_backend/config"
	"github.com/realtime-chat/go_backend/routes"

	// Swagger imports
	_ "github.com/realtime-chat/go_backend/docs" // Import generated docs
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Set up router
	r := gin.Default()

	// Set up CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, Pragma, Expires, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := config.ConnectDB(ctx); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer config.DisconnectDB(ctx)

	// Initialize Stream Chat client
	if err := config.InitStreamClient(); err != nil {
		log.Fatalf("Failed to initialize Stream Chat client: %v", err)
	}

	// Set up routes
	routes.SetupChatRoutes(r)

	// Swagger endpoint
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Get port from environment variable, default to 5002
	port := os.Getenv("PORT")
	if port == "" {
		port = "5002"
	}

	// Start server
	fmt.Printf("Server running on port %s\n", port)
	fmt.Printf("Swagger documentation available at: http://localhost:%s/swagger/index.html\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
