import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // 🔁 resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/forgot-password-otp`,
        { email }
      );

      setMessage(res.data.message);
      setCooldown(60); // 🔁 60 sec
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col">
      {/* Logo */}
      <div className="w-full px-4 py-6">
        <img
          src={Logo}
          alt="Logo"
          className="h-16 cursor-pointer hover:scale-105 transition"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-300 text-center mb-6">
            Enter your email to receive OTP
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
            <input
              type="email"
              placeholder="Enter registered email"
              className="w-full h-11 px-4 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5] text-white"
              required
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className={`w-full h-11 rounded-lg font-semibold transition-all
                ${
                  loading || cooldown > 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#4aa4b5] hover:bg-[#3a8c9a] active:scale-95"
                }`}
            >
              {cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : loading
                ? "Sending..."
                : "Send OTP"}
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

export default ForgotPassword;
