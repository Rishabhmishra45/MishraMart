import User from "../model/UserModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { genToken } from "../config/token.js";

// common cookie options for cross-site (Netlify <-> Render)
const cookieOptions = {
  httpOnly: true,
  secure: true,        // always true for cross-site
  sameSite: "None",    // required for cross-site cookies
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password required" });
    }

    // check if user already exists
    const existUser = await User.findOne({ email: email.toLowerCase() });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter valid email" });
    }

    // validate password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // generate token
    const token = genToken(user._id);

    // set cookie
    res.cookie("token", token, cookieOptions);

    // remove password before sending
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ user: userObj });
  } catch (error) {
    console.error("Register error:", error.message);
    return res
      .status(500)
      .json({ message: `registration error ${error.message}` });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    let token = genToken(user._id);

    // set cookie
    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ message: "Login successful", user: userObj });
  } catch (error) {
    console.error("Login error:", error.message);
    return res
      .status(500)
      .json({ message: `login error ${error.message}` });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("logOut error:", error.message);
    return res.status(500).json({ message: `LogOut error ${error.message}` });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({ name, email: email.toLowerCase() });
    }

    const token = genToken(user._id);

    // set cookie
    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ message: "Login successful", user: userObj });
  } catch (error) {
    console.error("googleLogin error:", error.message);
    return res
      .status(500)
      .json({ message: "googleLogin error", error: error.message });
  }
};
