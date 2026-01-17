import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
    },

    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    cardData: { type: Object, default: {} },

    // ✅ Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyOtp: String,
    emailVerifyOtpExpire: Date,
    emailVerifyOtpAttempts: {
      type: Number,
      default: 0,
    },

    // 🔐 OTP RESET (existing)
    resetOtp: String,
    resetOtpExpire: Date,
    resetOtpAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, minimize: false }
);

/* =========================
   🔐 Generate Reset OTP (existing)
========================= */
userSchema.methods.generateResetOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.resetOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 min
  this.resetOtpAttempts = 0;

  return otp;
};

/* =========================
   ✅ Generate Email Verify OTP (NEW)
========================= */
userSchema.methods.generateEmailVerifyOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.emailVerifyOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.emailVerifyOtpExpire = Date.now() + 10 * 60 * 1000; // 10 min
  this.emailVerifyOtpAttempts = 0;

  return otp;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
