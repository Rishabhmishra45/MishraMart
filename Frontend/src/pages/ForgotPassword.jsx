import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/Firebase";
import { IoMailOutline, IoArrowBack } from "react-icons/io5";

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
    <div className="min-h-[100svh] bg-[color:var(--background)] text-[color:var(--text)] overflow-hidden">
      {/* Centered Content (mobile: push a bit up, desktop: remain centered) */}
      <div className="min-h-[100svh] pt-[88px] sm:pt-[96px] flex justify-center px-4">
        <div className="w-full max-w-md">
          {/* Mobile: items-start so it stays upper | Desktop: center */}
          <div className="min-h-[calc(100svh-88px)] sm:min-h-[calc(100svh-96px)] flex items-start sm:items-center justify-center">
            {/* Mobile: add a little top spacing to keep it upper */}
            <div className="w-full mt-6 sm:mt-0">
              <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                    <IoMailOutline className="text-cyan-500 text-xl sm:text-2xl" />
                  </div>

                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                    Forgot Password
                  </h1>
                  <p className="text-[color:var(--muted)] text-sm sm:text-base">
                    We'll send you a reset link to change your password securely.
                  </p>
                </div>

                {/* Alerts */}
                {message && (
                  <div className="mb-4 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[color:var(--muted)] mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-transparent border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 text-sm sm:text-base"
                      required
                      value={email}
                      disabled={loading || cooldown > 0}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className={`w-full min-h-[48px] px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-extrabold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                      loading || cooldown > 0
                        ? "bg-gray-500 cursor-not-allowed text-white"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-white hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                  >
                    {cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : loading
                      ? "Sending..."
                      : "Send Reset Link"}
                  </button>
                </form>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => navigate("/signup")}
                    className="min-h-[44px] px-3 sm:px-4 py-2.5 bg-[color:var(--surface-2)] border border-[color:var(--border)] hover:bg-[color:var(--surface)] rounded-xl transition text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="min-h-[44px] px-3 sm:px-4 py-2.5 bg-[color:var(--surface-2)] border border-[color:var(--border)] hover:bg-[color:var(--surface)] rounded-xl transition text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    Home
                  </button>
                </div>

                <p className="text-xs text-[color:var(--muted)] mt-6 text-center leading-relaxed">
                  Reset link valid for limited time.
                  <br />
                  If you didn't request it, ignore this safely.
                </p>
              </div>

              {/* Mobile bottom safe space so it never touches mobile navbar */}
              <div className="h-10 sm:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
