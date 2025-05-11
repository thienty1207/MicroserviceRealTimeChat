package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// JWTClaims represents JWT claims structure
type JWTClaims struct {
	UserID string `json:"userId"`
	jwt.RegisteredClaims
}

// AuthMiddleware protects routes from unauthorized access
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		// First check Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			// Extract the token from the header (Bearer token)
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) == 2 && tokenParts[0] == "Bearer" {
				tokenString = tokenParts[1]
			}
		}

		// If no token in header, check JWT cookie
		if tokenString == "" {
			jwtCookie, err := c.Cookie("jwt")
			if err == nil && jwtCookie != "" {
				tokenString = jwtCookie
			}
		}

		// If still no token, return unauthorized
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No authentication token found"})
			return
		}

		claims := &JWTClaims{}

		// Parse the token
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET_KEY")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
			return
		}

		// Set the user ID in the context for use in controller
		userID, err := primitive.ObjectIDFromHex(claims.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID in token"})
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}
