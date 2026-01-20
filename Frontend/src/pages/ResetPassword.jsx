import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { IoEyeOutline, IoEyeOffOutline, IoArrowBack } from "react-icons/io5";
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
      <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Invalid Access</h2>
            <p className="text-[color:var(--muted)] mb-4">Please request a password reset first.</p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-white font-semibold rounded-xl transition"
            >
              Go to Forgot Password
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--text)]">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <img
            src={Logo}
            alt="Logo"
            className="h-12 sm:h-16 w-auto cursor-pointer"
            draggable={false}
            onClick={() => navigate("/")}
          />
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[color:var(--surface)] border border-[color:var(--border)] hover:bg-[color:var(--surface-2)] transition text-xs sm:text-sm"
          >
            <IoArrowBack className="text-sm" />
            <span className="hidden sm:inline">Back to Login</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-[color:var(--muted)] text-sm">
              OTP expires in{" "}
              <span className="text-cyan-500 font-semibold">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </p>
          </div>

          <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
            {message && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[color:var(--muted)] mb-2">
                  6-digit OTP *
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-transparent border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 text-center text-lg tracking-widest"
                  required
                  value={otp}
                  maxLength={6}
                  disabled={loading}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[color:var(--muted)] mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-transparent border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 pr-10 ${
                      !otpValid ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    required
                    value={password}
                    disabled={!otpValid || loading}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={!otpValid || loading}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition ${
                      !otpValid || loading
                        ? "text-[color:var(--muted)] cursor-not-allowed"
                        : "text-[color:var(--text)] hover:text-cyan-500"
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[color:var(--muted)] mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-transparent border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 pr-10 ${
                      !otpValid ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    required
                    value={confirmPassword}
                    disabled={!otpValid || loading}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={!otpValid || loading}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition ${
                      !otpValid || loading
                        ? "text-[color:var(--muted)] cursor-not-allowed"
                        : "text-[color:var(--text)] hover:text-cyan-500"
                    }`}
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg font-semibold transition-all duration-300 ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-white hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p className="text-center text-[color:var(--muted)] text-xs sm:text-sm mt-4">
              <button
                onClick={() => navigate("/login")}
                className="text-cyan-500 hover:underline"
              >
                ← Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;