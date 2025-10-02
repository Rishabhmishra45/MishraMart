import User from "../model/UserModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // ADD THIS IMPORT
import { genToken, genToken1 } from "../config/token.js";

// Common cookie options for cross-site (Netlify <-> Render)
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email and password are required" 
      });
    }

    const existUser = await User.findOne({ email: email.toLowerCase() });
    if (existUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please enter a valid email address" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = genToken(user._id);

    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ 
      success: true,
      message: "Registration successful",
      user: userObj 
    });
    
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: `Registration failed: ${error.message}` 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found with this email" 
      });
    }

    // Check if user has password (social login users might not have password)
    if (!user.password) {
      return res.status(400).json({ 
        success: false,
        message: "Please use social login for this account" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Incorrect password" 
      });
    }

    const token = genToken(user._id);

    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ 
      success: true,
      message: "Login successful", 
      user: userObj 
    });
    
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: `Login failed: ${error.message}` 
    });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    
    return res.status(200).json({ 
      success: true,
      message: "Logout successful" 
    });
    
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: `Logout failed: ${error.message}` 
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({ 
        name, 
        email: email.toLowerCase() 
      });
    }

    const token = genToken(user._id);

    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ 
      success: true,
      message: "Google login successful", 
      user: userObj 
    });
    
  } catch (error) {
    console.error("Google login error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: `Google login failed: ${error.message}` 
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = genToken1(email);
      
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: "Invalid admin credentials" 
    });
    
  } catch (error) {
    console.error("Admin login error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: `Admin login failed: ${error.message}` 
    });
  }
};

// Add this new endpoint for auth check
export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        isAuthenticated: false,
        message: "Not authenticated"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({
          success: false,
          isAuthenticated: false,
          message: "User not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        isAuthenticated: true,
        user: user
      });
    }
    
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      message: "Invalid token"
    });
    
  } catch (error) {
    console.error("Auth check error:", error.message);
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      message: "Authentication failed"
    });
  }
};