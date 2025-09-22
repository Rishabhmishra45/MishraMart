import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import morgan from "morgan";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();
const port = process.env.PORT || 6000;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://mishramarts.netlify.app",
  "http://localhost:5174",
];

// Simple CORS config
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

// Default root
app.get("/", (req, res) => res.send("API is running"));

// DB connect then start server
connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
