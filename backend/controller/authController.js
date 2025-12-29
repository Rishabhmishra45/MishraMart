import User from "../model/UserModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { genToken, genToken1 } from "../config/token.js";
import sendEmail from "../utils/sendEmail.js";
import otpEmailTemplate from "../utils/otpEmailTemplate.js"; // ✅ NEW IMPORT

// cookie options (unchanged)
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* ================= REGISTER ================= */
export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: "Invalid email" });

    const existUser = await User.findOne({ email: email.toLowerCase() });
    if (existUser)
      return res.status(400).json({ success: false, message: "User already exists" });

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

    res.status(201).json({ success: true, user: userObj });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Wrong password" });

    const token = genToken(user._id);
    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ success: true, user: userObj });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= LOGOUT ================= */
export const logOut = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.json({ success: true, message: "Logged out" });
};

/* ================= GOOGLE LOGIN ================= */
export const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({ name, email: email.toLowerCase() });
    }

    const token = genToken(user._id);
    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ success: true, user: userObj });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= ADMIN LOGIN ================= */
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = genToken1(email);
    res.cookie("token", token, cookieOptions);
    return res.json({ success: true, message: "Admin login success" });
  }

  res.status(401).json({ success: false, message: "Invalid admin credentials" });
};

/* ================= SEND OTP (HTML EMAIL) ================= */
export const forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const otp = user.generateResetOtp();
    await user.save({ validateBeforeSave: false });

    // ✅ HTML EMAIL
    await sendEmail({
      email: user.email,
      subject: "MishraMart - Password Reset OTP",
      html: otpEmailTemplate(otp),
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= VERIFY OTP + RESET ================= */
export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp)
      return res.status(400).json({ success: false, message: "OTP expired" });

    if (user.resetOtpAttempts >= 3) {
      user.resetOtp = undefined;
      user.resetOtpExpire = undefined;
      user.resetOtpAttempts = 0;
      await user.save();

      return res.status(429).json({
        success: false,
        message: "Too many wrong attempts. Request new OTP.",
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== user.resetOtp || user.resetOtpExpire < Date.now()) {
      user.resetOtpAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. Attempts left: ${3 - user.resetOtpAttempts}`,
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    user.resetOtpAttempts = 0;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
