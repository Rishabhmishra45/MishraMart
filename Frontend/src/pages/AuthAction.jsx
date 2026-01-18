import React, { useEffect, useMemo, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  getAuth,
} from "firebase/auth";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";

const AuthAction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const firebaseAuth = useMemo(() => getAuth(), []);

  const { serverUrl } = useContext(authDataContext);

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("");
  const [oobCode, setOobCode] = useState("");

  const [status, setStatus] = useState("Processing...");
  const [success, setSuccess] = useState(false);

  // Reset Password States
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("mode");
    const code = params.get("oobCode");

    setMode(m || "");
    setOobCode(code || "");
  }, [location.search]);

  // Sync verified state to backend DB
  const syncBackendVerified = async (email) => {
    if (!email) return;
    try {
      await axios.post(
        `${serverUrl}/api/auth/firebase-sync`,
        { name: "MishraMart User", email, verified: true },
        { withCredentials: true }
      );
    } catch (e) {
      console.error("Backend sync failed:", e);
    }
  };

  useEffect(() => {
    const runAction = async () => {
      if (!mode || !oobCode) {
        setLoading(false);
        setSuccess(false);
        setStatus("Invalid action link.");
        return;
      }

      try {
        if (mode === "verifyEmail") {
          setStatus("Verifying your email...");
          await checkActionCode(firebaseAuth, oobCode);
          await applyActionCode(firebaseAuth, oobCode);

          // Sync verified in backend after firebase verify
          const email = firebaseAuth?.currentUser?.email;
          await syncBackendVerified(email);

          setSuccess(true);
          setStatus("✅ Email verified successfully! You can now login.");
          setLoading(false);
          return;
        }

        if (mode === "resetPassword") {
          // For reset password, show form
          setStatus("Please set your new password.");
          setSuccess(false);
          setLoading(false);
          return;
        }

        setSuccess(false);
        setStatus("Unsupported action link.");
        setLoading(false);
      } catch (err) {
        console.error("AuthAction error:", err);
        setSuccess(false);
        setLoading(false);
        setStatus(
          err?.message?.includes("expired")
            ? "This link has expired. Please request a new one."
            : "Invalid or expired link."
        );
      }
    };

    runAction();
  }, [mode, oobCode, firebaseAuth]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    if (newPassword !== confirmNewPassword) {
      return alert("Password and Confirm Password do not match");
    }

    try {
      setResetLoading(true);

      await confirmPasswordReset(firebaseAuth, oobCode, newPassword);

      setSuccess(true);
      setStatus("✅ Password reset successful! Please login.");
      setNewPassword("");
      setConfirmNewPassword("");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Reset password error:", err);
      alert(
        err?.message?.includes("expired")
          ? "Reset link expired. Request new reset link."
          : "Failed to reset password."
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    // ✅ overflow-x-hidden to remove right side bug on mobile
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col select-none">
      {/* Navbar */}
      <div className="w-full h-[70px] sm:h-[80px] flex items-center justify-start px-4 sm:px-8">
        <img
          src={Logo}
          alt="Logo"
          className="h-[110px] sm:h-[150px] w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
          draggable={false}
          onClick={() => navigate("/")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        {/* ✅ Mobile: form slightly upper (pt-4), Desktop: centered (pt-10) */}
        <div className="w-full max-w-lg pt-4 sm:pt-10">
          <div className="w-full bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
                MishraMart Authentication
              </h1>
              <p className="text-gray-300 mt-2 text-sm sm:text-base">
                Secure verification and password reset
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="mt-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-gray-300 text-sm">{status}</p>
              </div>
            )}

            {/* Status Messages */}
            {!loading && mode !== "resetPassword" && (
              <div
                className={`mt-6 p-4 rounded-2xl border text-sm sm:text-base ${
                  success
                    ? "bg-green-500/15 border-green-500/30 text-green-200"
                    : "bg-red-500/15 border-red-500/30 text-red-200"
                }`}
              >
                {status}
              </div>
            )}

            {/* ✅ Reset Password Form */}
            {!loading && mode === "resetPassword" && (
              <>
                <div className="mt-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 text-sm">
                  Please enter a new password below to reset your account.
                </div>

                <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      className="w-full h-12 px-4 pr-16 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300"
                      required
                      disabled={resetLoading}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#4aa4b5] hover:text-white transition"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={resetLoading}
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300"
                    required
                    disabled={resetLoading}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className={`w-full h-12 rounded-xl font-semibold transition ${
                      resetLoading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-[#4aa4b5] hover:bg-[#3a8c9a] active:scale-[0.99]"
                    }`}
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full h-11 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
                  >
                    Back to Login
                  </button>
                </form>
              </>
            )}

            {/* Buttons */}
            {!loading && mode !== "resetPassword" && (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 h-11 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 h-11 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
                >
                  Go to Home
                </button>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
              If this link is expired, please request a new verification/reset link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthAction;
