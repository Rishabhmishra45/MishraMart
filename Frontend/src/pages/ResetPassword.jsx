import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../assets/logo.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validToken, setValidToken] = useState(false);
  
  let { serverUrl } = useContext(authDataContext);

  // Check if token is valid
  useEffect(() => {
    if (!token) {
      setError("Invalid or expired reset link");
      return;
    }
    setValidToken(true);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { token, newPassword: password }
      );
      
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError(
        error.response?.data?.message || 
        "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-400 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-gray-300 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="bg-[#4aa4b5] hover:bg-[#3a8c9a] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Get New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col">
      {/* Navbar / Logo */}
      <div className="w-full px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
        <img
          className="h-16 sm:h-20 lg:h-24 w-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
          src={Logo}
          alt="Logo"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Reset Password
          </h1>
          <p className="text-gray-300 mt-2 text-xs sm:text-sm lg:text-base">
            Enter your new password
          </p>
        </div>

        {/* Reset Password Box */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/10 border border-white/20 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            {/* New Password */}
            <div>
              <label className="block text-gray-300 text-sm sm:text-base mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full h-10 sm:h-11 lg:h-12 px-3 sm:px-4 pr-10 rounded-lg bg-white/10 border border-white/20 
                    focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300 text-sm sm:text-base transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  minLength="6"
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 
                    hover:text-white transition-colors duration-200 disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IoEyeOffOutline size={18} className="sm:w-5 sm:h-5" />
                  ) : (
                    <IoEyeOutline size={18} className="sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-sm sm:text-base mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full h-10 sm:h-11 lg:h-12 px-3 sm:px-4 pr-10 rounded-lg bg-white/10 border border-white/20 
                    focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300 text-sm sm:text-base transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  minLength="6"
                  value={confirmPassword}
                  disabled={loading}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 
                    hover:text-white transition-colors duration-200 disabled:opacity-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <IoEyeOffOutline size={18} className="sm:w-5 sm:h-5" />
                  ) : (
                    <IoEyeOutline size={18} className="sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-10 sm:h-11 lg:h-12 rounded-lg text-white font-semibold mt-2 transition-all duration-200
                ${loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[#4aa4b5] hover:bg-[#3a8c9a] active:scale-95"
                }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {/* Back to Login */}
            <div className="text-center mt-4">
              <span
                className="text-[#4aa4b5] text-sm sm:text-base font-semibold cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                ← Back to Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;