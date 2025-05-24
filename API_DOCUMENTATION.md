# API Documentation with Swagger

This project now includes comprehensive Swagger/OpenAPI documentation for both the Express.js and Go backends.

## 🚀 Quick Start

### Starting the Servers

1. **Express Backend (Port 5001)**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Go Backend (Port 5002)**:
   ```bash
   cd go_backend
   go mod tidy
   go run main.go
   ```

## 📖 API Documentation

### Express Backend Swagger UI
- **URL**: http://localhost:5001/api-docs
- **Base Path**: `/api`
- **Covers**: Authentication, User Management, Friend Requests, Video Call Tokens

### Go Backend Swagger UI  
- **URL**: http://localhost:5002/swagger/index.html
- **Base Path**: `/api`
- **Covers**: Chat functionality, Message handling, Stream Chat tokens

## 🔑 Authentication

Both APIs use JWT authentication but with different methods:

- **Express API**: Uses HTTP-only cookies (`jwt` cookie)
- **Go API**: Supports both Bearer tokens in headers and JWT cookies

### Authentication Flow
1. Register/Login via Express API (`/api/auth/signup` or `/api/auth/login`)
2. The JWT cookie will be automatically set
3. Use the same cookie for authenticated requests to both APIs

## 📋 API Endpoints Overview

### Express Backend (`localhost:5001/api`)

#### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login  
- `POST /auth/logout` - User logout
- `POST /auth/onboarding` - Complete user profile
- `GET /auth/me` - Get current user info

#### Users & Friends
- `GET /users` - Get recommended users
- `GET /users/friends` - Get user's friends
- `POST /users/friend-request/{id}` - Send friend request
- `PUT /users/friend-request/{id}/accept` - Accept friend request
- `DELETE /users/friend-request/{id}/reject` - Reject friend request
- `DELETE /users/friend-request/{id}/cancel` - Cancel friend request
- `DELETE /users/friends/{id}` - Remove friend
- `GET /users/friend-requests` - Get incoming friend requests
- `GET /users/outgoing-friend-requests` - Get outgoing friend requests

#### Video Calls
- `GET /chat/token` - Get Stream token for video calls

### Go Backend (`localhost:5002/api`)

#### Chat
- `GET /chat/token` - Get Stream Chat token for text messaging
- `POST /chat/messages` - Save chat messages
- `GET /chat/debug` - Debug authentication (no auth required)

## 🛠 Testing the APIs

### Using Swagger UI
1. Open the Swagger UI URLs in your browser
2. For protected endpoints, first authenticate via the Express API
3. The authentication cookie will work for both APIs

### Using curl/Postman
```bash
# Register a user
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}' \
  -c cookies.txt

# Use the same cookies for Go API
curl -X GET http://localhost:5002/api/chat/token \
  -b cookies.txt
```

## 🔧 Development

### Regenerating Go Swagger Docs
```bash
cd go_backend
swag init
```

### Express Swagger
The Express Swagger docs are automatically generated from JSDoc comments in the controllers.

## 📁 Architecture

- **Express Backend**: Handles user management, authentication, friend requests, and video calls
- **Go Backend**: Handles real-time chat messaging and Stream Chat integration
- **Frontend**: React.js application that communicates with both backends
- **Database**: MongoDB (shared between both backends)

## 🔐 Security Considerations

- JWT tokens expire after 7 days
- HTTP-only cookies prevent XSS attacks
- CORS is configured for frontend origin
- All sensitive endpoints require authentication

---

**Note**: Make sure both backends are running simultaneously for full functionality. The frontend communicates with the Express backend for user operations and the Go backend for chat operations.