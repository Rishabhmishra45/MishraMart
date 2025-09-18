import express from "express";
import { login, logOut, registration } from "../controller/authController.js";

const authRoutes = express.Router();

authRoutes.post("/registration", registration)
authRoutes.post("/login", login)
authRoutes.get("/logout", logOut)

export default authRoutes;