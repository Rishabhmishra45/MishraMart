import express from "express";
import { 
  adminLogin, 
  googleLogin, 
  login, 
  logOut, 
  registration 
} from "../controller/authController.js";

const authRoutes = express.Router();

authRoutes.post("/registration", registration);
authRoutes.post("/login", login);
authRoutes.post("/logout", logOut);
authRoutes.post("/googlelogin", googleLogin);
authRoutes.post("/adminlogin", adminLogin);

// Remove this line - we'll use user/getcurrentuser instead
// authRoutes.get("/check", isAuth, checkAuth);

export default authRoutes;