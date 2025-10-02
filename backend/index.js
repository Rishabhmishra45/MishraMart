import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import morgan from "morgan";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
const port = process.env.PORT || 8000;
const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://mishramarts.netlify.app",
      "http://localhost:5174",
      "http://192.168.1.3:5174",
    ],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware to make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan("dev"));

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://mishramarts.netlify.app",
  "http://localhost:5174",
  "http://192.168.1.3:5174",
];

// CORS config
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", orderRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    success: true,
    message: "Server is running healthy",
    timestamp: new Date().toISOString()
  });
});

// Default root
app.get("/", (req, res) => res.json({ 
  success: true,
  message: "MishraMart API is running",
  version: "1.0.0"
}));

// 404 handler - FIXED: Remove the problematic wildcard route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// DB connect then start server
connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📱 API URL: http://localhost:${port}`);
      console.log(`🔗 CORS enabled for: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });