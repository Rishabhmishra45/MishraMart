import express from "express";
import {
  registration,
  login,
  logOut,
  googleLogin,
  adminLogin,
  forgotPasswordOtp,
  verifyOtpAndResetPassword,
} from "../controller/authController.js";

const authRoutes = express.Router();

authRoutes.post("/registration", registration);
authRoutes.post("/login", login);
authRoutes.post("/logout", logOut);
authRoutes.post("/googlelogin", googleLogin);
authRoutes.post("/adminlogin", adminLogin);

// 🔐 OTP RESET
authRoutes.post("/forgot-password-otp", forgotPasswordOtp);
authRoutes.post("/verify-reset-otp", verifyOtpAndResetPassword);

export default authRoutes;
