import express from "express";
import isAuth from "../middleware/isAuth.js";
import { validateCoupon } from "../controller/couponController.js";

const couponRoutes = express.Router();

couponRoutes.post("/validate", isAuth, validateCoupon);

export default couponRoutes;
