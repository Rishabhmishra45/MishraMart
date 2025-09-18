import express from "express";
import { login, registration } from "../controller/authController.js";

const authRoutes = express.Router();

authRoutes.post("/registration", registration)
authRoutes.post("/login", login)

export default authRoutes;