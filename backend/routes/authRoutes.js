// routes/authRoutes.js
import express from "express";
import { adminLogin, googleLogin, login, logOut, registration } from "../controller/authController.js";

const authRoutes = express.Router();

authRoutes.post("/registration", registration);
authRoutes.post("/login", login);
authRoutes.get("/logout", logOut);
authRoutes.post("/googlelogin", googleLogin);
authRoutes.post("/adminlogin", adminLogin);

export default authRoutes;
