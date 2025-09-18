import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";

dotenv.config();

let port = process.env.PORT || 6000;

let app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173", // frontend ka URL
    credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDb(); // DB connect on startup
});
