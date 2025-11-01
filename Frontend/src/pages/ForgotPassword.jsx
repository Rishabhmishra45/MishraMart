import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  let { serverUrl } = useContext(authDataContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${serverUrl}/api/auth/forgot-password`,
        { email }
      );
      
      setMessage(response.data.message);
      setEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(
        error.response?.data?.message || 
        "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
            Forgot Password
          </h1>
          <p className="text-gray-300 mt-2 text-xs sm:text-sm lg:text-base">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Forgot Password Box */}
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
            <div>
              <label className="block text-gray-300 text-sm sm:text-base mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                className="w-full h-10 sm:h-11 lg:h-12 px-3 sm:px-4 rounded-lg bg-white/10 border border-white/20 
                  focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300 text-sm sm:text-base transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
                required
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
              />
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
              {loading ? "Sending..." : "Send Reset Link"}
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

        {/* Additional Info */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mt-6 text-center">
          <p className="text-gray-400 text-xs">
            You will receive an email with instructions to reset your password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;