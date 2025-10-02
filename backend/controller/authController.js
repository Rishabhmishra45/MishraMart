import User from "../model/User.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// common cookie options for cross-site (Netlify <-> Render)
const cookieOptions = {
  httpOnly: true,
  secure: true,        // always true for cross-site cookies
  sameSite: "None",    // required for cross-site cookies
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Generate JWT token
const genToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Generate admin token
const genToken1 = (email) => {
  return jwt.sign(
    { email, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by protect middleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;

    return res.status(200).json({
      success: true,
      user: userObj
    });

  } catch (error) {
    console.error("Get current user error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch user data",
      error: error.message 
    });
  }
};

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email and password required" 
      });
    }

    const existUser = await User.findOne({ email: email.toLowerCase() });
    if (existUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists" 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Enter valid email" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters" 
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Password will be hashed by pre-save middleware
    });

    const token = genToken(user._id);

    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      user: userObj,
      token 
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: `Registration error: ${error.message}` 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password required" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const isMatch = await user.comparePassword(password);
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
      user: userObj,
      token 
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: `Login error: ${error.message}` 
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
    console.error("logOut error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: `Logout error: ${error.message}` 
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
        email: email.toLowerCase(),
        password: await bcrypt.hash(Math.random().toString(36), 10) // Random password for Google users
      });
    }

    const token = genToken(user._id);

    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ 
      success: true,
      message: "Google login successful", 
      user: userObj,
      token 
    });
  } catch (error) {
    console.error("googleLogin error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Google login failed", 
      error: error.message 
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password required" 
      });
    }

    // Check if admin credentials match
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      let token = genToken1(email);
      
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          name: "Admin",
          email: email,
          role: "admin",
          isAdmin: true
        }
      });
    }
    
    return res.status(400).json({ 
      success: false,
      message: "Invalid admin credentials" 
    });
  } catch (error) {
    console.error("AdminLogin error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Admin login failed", 
      error: error.message 
    });
  }
};