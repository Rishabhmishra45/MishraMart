import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/Firebase";
import { IoMailOutline } from "react-icons/io5";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [cooldown, setCooldown] = useState(0);

  // resend cooldown timer
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
      await sendPasswordResetEmail(auth, email);

      setMessage(
        "✅ Reset link sent successfully! Please check your Inbox / Spam folder."
      );
      setCooldown(60);
    } catch (err) {
      console.error("Reset link error:", err);

      const msg =
        err?.code === "auth/user-not-found"
          ? "No user found with this email."
          : err?.code === "auth/invalid-email"
          ? "Invalid email address."
          : err?.message || "Failed to send reset link. Please try again.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col select-none">
      {/* Top Bar */}
      <div className="w-full px-4 sm:px-8 py-6 flex items-center justify-between">
        <img
          src={Logo}
          alt="Logo"
          className="h-14 sm:h-16 cursor-pointer hover:scale-105 transition"
          onClick={() => navigate("/")}
          draggable={false}
        />

        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm sm:text-base font-semibold"
        >
          Back to Login
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-lg bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-4">
              <IoMailOutline size={26} className="text-cyan-200" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Forgot Password
            </h1>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">
              We’ll send you a reset link to change your password securely.
            </p>
          </div>

          {/* Alerts */}
          {message && (
            <div className="mt-6 p-4 bg-green-500/15 border border-green-500/30 rounded-2xl text-green-200 text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-6 p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Enter your registered email"
              className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300"
              required
              value={email}
              disabled={loading || cooldown > 0}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className={`w-full h-12 rounded-xl font-semibold transition
                ${
                  loading || cooldown > 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#4aa4b5] hover:bg-[#3a8c9a] active:scale-[0.99]"
                }`}
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="flex-1 h-11 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
            >
              Create New Account
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 h-11 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
            >
              Home
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6 text-center leading-relaxed">
            Reset link valid for limited time.
            <br />
            If you didn’t request it, ignore this safely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
