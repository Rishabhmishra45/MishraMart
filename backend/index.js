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
import chatbotRoutes from "./routes/chatbotRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import compression from "compression";

// NEW
import newsletterRoutes from "./routes/newsletterRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();
const server = createServer(app);

app.use(compression());

const allowedOrigins = [
  "http://localhost:5173",
  "https://mishramarts.netlify.app",
  "https://mishramart-admin.netlify.app",
  "http://localhost:5174",
  "http://192.168.1.3:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinUserRoom", (userId) => {
    if (userId) socket.join(userId.toString());
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      skip: (req, res) => req.path === "/health",
    })
  );
}

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/review", reviewRoutes);

// NEW
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/", (req, res) =>
  res.json({
    success: true,
    message: "MishraMart API",
    version: "1.0.0",
  })
);

app.use("/api/static", (req, res, next) => {
  res.set("Cache-Control", "public, max-age=300");
  next();
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const message =
    process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message;

  res.status(err.status || 500).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => console.log("Process terminated"));
});

const connectWithRetry = async (retries = 5, delay = 5000) => {
  try {
    await connectDb();
    console.log("✅ Database connected successfully");

    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✅ Compression enabled for faster responses`);
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (err) {
    console.error(`❌ DB connection failed (${retries} retries left):`, err.message);

    if (retries > 0) {
      console.log(`🔄 Retrying connection in ${delay / 1000} seconds...`);
      setTimeout(() => connectWithRetry(retries - 1, delay), delay);
    } else {
      console.error("❌ Maximum retries reached. Exiting...");
      process.exit(1);
    }
  }
};

connectWithRetry();

export { io };
