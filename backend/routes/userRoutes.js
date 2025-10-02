import express from "express";
import isAuth from "../middleware/isAuth.js";
import { getAdmin, getCurrentUser, updateUserProfile } from "../controller/userController.js";
import adminAuth from "../middleware/adminAuth.js";

const userRoutes = express.Router();

userRoutes.get("/getcurrentuser", isAuth, getCurrentUser);
userRoutes.get("/getadmin", adminAuth, getAdmin);
userRoutes.put("/update-profile", isAuth, updateUserProfile);

export default userRoutes;