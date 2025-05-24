import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";
import { specs, swaggerUi } from "./lib/swagger.js";

const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5002"],
    credentials: true,
  },
});

// Store connected users with their socket ids
const connectedUsers = new Map(); // userId -> socketId

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    // Find and remove the user from connectedUsers
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Export io instance to use in other files
export { io, connectedUsers };

const __dirname = path.resolve();

// Adjust CORS to allow requests from both frontend and Go backend
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5002"],
    credentials: true, // allow frontend to send cookies
  })
);

app.use(express.json());
app.use(cookieParser());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// Chat endpoints have been moved to Go backend (http://localhost:5002/api/chat/*)
// This route is kept for backward compatibility
app.use("/api/chat", chatRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Express Swagger documentation available at: http://localhost:${PORT}/api-docs`);
  console.log(`Note: Chat functionality is now handled by Go backend on port 5002`);
  connectDB();
});
