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
import chatbotRoutes from './routes/chatbotRoutes.js';

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
      "https://mishramart-admin.netlify.app/",
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

// SIMPLE CORS FIX
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mishramarts.netlify.app",
    "https://mishramart-admin.netlify.app",
    "http://localhost:5174", 
    "http://192.168.1.3:5174",
  ],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ 
    success: true,
    message: "Server is running"
  });
});

// Default
app.get("/", (req, res) => res.json({ 
  success: true,
  message: "MishraMart API"
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error'
  });
});

// Start server
connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });