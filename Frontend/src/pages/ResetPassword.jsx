import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const { serverUrl } = useContext(authDataContext);

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // ⏱ 10 min

  // ✅ OTP valid when 6 digits
  const otpValid = useMemo(() => otp?.length === 6, [otp]);

  // ⏱ OTP expiry timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // ✅ Submit (OTP + password reset)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otpValid) {
      return setError("Please enter 6-digit OTP first");
    }

    if (!password || password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${serverUrl}/api/auth/verify-reset-otp`,
        { email, otp, password },
        { withCredentials: true }
      );

      setMessage(res.data.message || "Password reset successful ✅");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Invalid access
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col">
      {/* Logo */}
      <div className="w-full px-4 py-6">
        <img
          src={Logo}
          alt="Logo"
          className="h-16 cursor-pointer hover:scale-105 transition"
          draggable={false}
          onClick={() => navigate("/")}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-1">Reset Password</h1>

          <p className="text-center text-gray-300 mb-4 text-sm">
            OTP expires in{" "}
            <span className="text-[#4aa4b5] font-semibold">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </p>

          {message && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded text-green-300 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP */}
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="w-full h-11 px-4 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5] tracking-widest text-center"
              required
              value={otp}
              maxLength={6}
              disabled={loading}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />

            {/* Password (Visible but disabled until OTP filled ✅) */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className={`w-full h-11 px-4 pr-10 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5]
                  ${!otpValid ? "opacity-60 cursor-not-allowed" : ""}`}
                required
                value={password}
                disabled={!otpValid || loading}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className={`absolute right-3 top-3 text-gray-300 transition ${
                  !otpValid || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
                onClick={() => {
                  if (!otpValid || loading) return;
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                className={`w-full h-11 px-4 pr-10 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5]
                  ${!otpValid ? "opacity-60 cursor-not-allowed" : ""}`}
                required
                value={confirmPassword}
                disabled={!otpValid || loading}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className={`absolute right-3 top-3 text-gray-300 transition ${
                  !otpValid || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
                onClick={() => {
                  if (!otpValid || loading) return;
                  setShowConfirm(!showConfirm);
                }}
              >
                {showConfirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 rounded-lg font-semibold transition-all
                ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#4aa4b5] hover:bg-[#3a8c9a] active:scale-95"
                }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="text-center mt-4">
            <span
              className="text-[#4aa4b5] cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              ← Back to Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
