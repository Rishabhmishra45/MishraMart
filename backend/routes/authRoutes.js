import express from "express";
import {
  registration,
  login,
  logOut,
  googleLogin,
  adminLogin,
  forgotPasswordOtp,
  verifyOtpAndResetPassword,
  startSignup,
  completeSignup,
  sendEmailVerifyOtp,
  verifyEmailOtp,
  firebaseSync,
} from "../controller/authController.js";

const authRoutes = express.Router();

// Old registration (keep)
authRoutes.post("/registration", registration);

// Login/logout
authRoutes.post("/login", login);
authRoutes.post("/logout", logOut);

// Google login
authRoutes.post("/googlelogin", googleLogin);

// Admin login
authRoutes.post("/adminlogin", adminLogin);

// OTP signup flow (keep)
authRoutes.post("/start-signup", startSignup);
authRoutes.post("/complete-signup", completeSignup);

// OTP verify routes (keep)
authRoutes.post("/send-verify-otp", sendEmailVerifyOtp);
authRoutes.post("/verify-email-otp", verifyEmailOtp);

// Firebase sync (required for link based auth)
authRoutes.post("/firebase-sync", firebaseSync);

// Reset password OTP (keep services)
authRoutes.post("/forgot-password-otp", forgotPasswordOtp);
authRoutes.post("/verify-reset-otp", verifyOtpAndResetPassword);

export default authRoutes;
