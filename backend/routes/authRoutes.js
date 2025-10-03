import express from "express";
import {
  registration,
  login,
  logOut,
  googleLogin,
  adminLogin
} from "../controller/authController.js";

const authRoutes = express.Router();

authRoutes.post("/registration", registration);
authRoutes.post("/login", login);
authRoutes.post("/logout", logOut); // ✅ This is the logout route
authRoutes.post("/googlelogin", googleLogin);
authRoutes.post("/adminlogin", adminLogin);

export default authRoutes;
