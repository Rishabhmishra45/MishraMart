import express from "express";
import { 
    adminLogin, 
    googleLogin, 
    login, 
    logOut, 
    registration, 
    getCurrentUser 
} from "../controller/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const authRoutes = express.Router();

// Public routes
authRoutes.post("/registration", registration);
authRoutes.post("/login", login);
authRoutes.post("/googlelogin", googleLogin);
authRoutes.post("/adminlogin", adminLogin);

// Protected routes
authRoutes.get("/me", protect, getCurrentUser);
authRoutes.get("/logout", protect, logOut);

export default authRoutes;