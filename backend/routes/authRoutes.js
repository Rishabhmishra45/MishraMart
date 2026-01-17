import express from "express";
import {
  registration,
  login,
  logOut,
  googleLogin,
  adminLogin,
  forgotPasswordOtp,
  verifyOtpAndResetPassword,

  // ✅ NEW Signup flow
  startSignup,
  completeSignup,

  // ✅ Email verify OTP
  sendEmailVerifyOtp,
  verifyEmailOtp,
} from "../controller/authController.js";

const authRoutes = express.Router();

/* ================= OLD ================= */
// registration old (will keep but not use in frontend anymore)
authRoutes.post("/registration", registration);

authRoutes.post("/login", login);
authRoutes.post("/logout", logOut);
authRoutes.post("/googlelogin", googleLogin);
authRoutes.post("/adminlogin", adminLogin);

/* ================= ✅ NEW SIGNUP FLOW ================= */
authRoutes.post("/start-signup", startSignup);
authRoutes.post("/complete-signup", completeSignup);

/* ================= EMAIL VERIFY OTP ================= */
authRoutes.post("/send-verify-otp", sendEmailVerifyOtp);
authRoutes.post("/verify-email-otp", verifyEmailOtp);

/* ================= RESET PASSWORD ================= */
authRoutes.post("/forgot-password-otp", forgotPasswordOtp);
authRoutes.post("/verify-reset-otp", verifyOtpAndResetPassword);

export default authRoutes;
