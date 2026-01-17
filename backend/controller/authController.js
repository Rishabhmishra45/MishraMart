import User from "../model/UserModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { genToken, genToken1 } from "../config/token.js";
import sendEmail from "../utils/sendEmail.js";
import otpEmailTemplate from "../utils/otpEmailTemplate.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* =========================================================
   ✅ NEW SIGNUP FLOW (SINGLE PAGE)
   1) startSignup -> (name+email) create/update user + send OTP
   2) verifyEmailOtp -> verify OTP
   3) completeSignup -> set password + login token
========================================================= */

/* ================= START SIGNUP (NEW) ================= */
export const startSignup = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Email are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const userEmail = email.toLowerCase();

    let user = await User.findOne({ email: userEmail });

    // ✅ If already exists AND verified => block
    if (user && user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // ✅ If not exists => create user without password (yet)
    if (!user) {
      user = await User.create({
        name,
        email: userEmail,
        isVerified: false,
        password: "", // will set after otp verified
      });
    } else {
      // if exists but unverified, update name if needed
      user.name = name;
    }

    // ✅ Generate + send OTP
    const otp = user.generateEmailVerifyOtp();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: "MishraMart - Verify Your Email OTP",
      html: otpEmailTemplate(otp, "VERIFY_EMAIL"),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
      email: user.email,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= COMPLETE SIGNUP (NEW) ================= */
export const completeSignup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // ✅ set password now
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // ✅ login token
    const token = genToken(user._id);
    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: "Account created successfully",
      user: userObj,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= REGISTER (OLD - KEEP) ================= */
export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    if (!validator.isEmail(email))
      return res
        .status(400)
        .json({ success: false, message: "Invalid email" });

    const existUser = await User.findOne({ email: email.toLowerCase() });

    if (existUser && existUser.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    if (existUser && !existUser.isVerified) {
      const otp = existUser.generateEmailVerifyOtp();
      await existUser.save({ validateBeforeSave: false });

      await sendEmail({
        email: existUser.email,
        subject: "MishraMart - Verify Your Email OTP",
        html: otpEmailTemplate(otp, "VERIFY_EMAIL"),
      });

      return res.status(200).json({
        success: true,
        message:
          "Account already created but not verified. OTP resent to your email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
    });

    const otp = user.generateEmailVerifyOtp();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: "MishraMart - Verify Your Email OTP",
      html: otpEmailTemplate(otp, "VERIFY_EMAIL"),
    });

    res.status(201).json({
      success: true,
      message: "OTP sent to email. Please verify to complete registration.",
      email: user.email,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= SEND VERIFY OTP (EXISTING) ================= */
export const sendEmailVerifyOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid email required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    const otp = user.generateEmailVerifyOtp();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: "MishraMart - Verify Your Email OTP",
      html: otpEmailTemplate(otp, "VERIFY_EMAIL"),
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= VERIFY EMAIL OTP (EXISTING) ================= */
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.emailVerifyOtp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired" });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    if (user.emailVerifyOtpAttempts >= 3) {
      user.emailVerifyOtp = undefined;
      user.emailVerifyOtpExpire = undefined;
      user.emailVerifyOtpAttempts = 0;
      await user.save();

      return res.status(429).json({
        success: false,
        message: "Too many wrong attempts. Request new OTP.",
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (
      hashedOtp !== user.emailVerifyOtp ||
      user.emailVerifyOtpExpire < Date.now()
    ) {
      user.emailVerifyOtpAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. Attempts left: ${3 - user.emailVerifyOtpAttempts}`,
      });
    }

    user.isVerified = true;
    user.emailVerifyOtp = undefined;
    user.emailVerifyOtpExpire = undefined;
    user.emailVerifyOtpAttempts = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= LOGIN (Block unverified) ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

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

/* ================= GOOGLE LOGIN (Auto verified) ================= */
export const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        isVerified: true,
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      user.emailVerifyOtp = undefined;
      user.emailVerifyOtpExpire = undefined;
      user.emailVerifyOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
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

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = genToken1(email);
    res.cookie("token", token, cookieOptions);
    return res.json({ success: true, message: "Admin login success" });
  }

  res.status(401).json({ success: false, message: "Invalid admin credentials" });
};

/* ================= RESET PASSWORD OTP (EXISTING) ================= */
export const forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const otp = user.generateResetOtp();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: "MishraMart - Password Reset OTP",
      html: otpEmailTemplate(otp, "RESET_PASSWORD"),
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= VERIFY OTP + RESET (EXISTING) ================= */
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
