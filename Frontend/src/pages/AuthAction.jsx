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

// Modern toast below navbar
const Toast = ({ type = "success", message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-[90px] left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-[9999] w-[92%] sm:w-[420px]">
      <div
        className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-[fadeIn_.25s_ease-out] ${
          type === "success"
            ? "bg-green-500/15 border-green-500/30 text-green-100"
            : "bg-red-500/15 border-red-500/30 text-red-100"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </div>
          <button
            className="text-xs font-semibold opacity-80 hover:opacity-100"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (type, msg) => {
    setToastType(type);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 6500);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("mode");
    const code = params.get("oobCode");

    setMode(m || "");
    setOobCode(code || "");
  }, [location.search]);

  const syncBackendVerified = async (email) => {
    if (!email) return;

    const pendingName =
      localStorage.getItem("MM_PENDING_NAME") || "MishraMart User";

    try {
      await axios.post(
        `${serverUrl}/api/auth/firebase-sync`,
        { name: pendingName, email, verified: true },
        { withCredentials: true }
      );

      localStorage.removeItem("MM_PENDING_NAME");
      localStorage.removeItem("MM_PENDING_EMAIL");
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
        showToast("error", "Invalid action link.");
        return;
      }

      try {
        if (mode === "verifyEmail") {
          setStatus("Verifying your email...");
          await checkActionCode(firebaseAuth, oobCode);
          await applyActionCode(firebaseAuth, oobCode);

          const email =
            firebaseAuth?.currentUser?.email ||
            localStorage.getItem("MM_PENDING_EMAIL");

          await syncBackendVerified(email);

          setSuccess(true);
          setStatus("✅ Email verified successfully! You can now login.");
          showToast("success", "✅ Email verified successfully! Now login.");
          setLoading(false);
          return;
        }

        if (mode === "resetPassword") {
          setStatus("Please set your new password.");
          setSuccess(false);
          setLoading(false);
          return;
        }

        setSuccess(false);
        setStatus("Unsupported action link.");
        showToast("error", "Unsupported action link.");
        setLoading(false);
      } catch (err) {
        console.error("AuthAction error:", err);
        setSuccess(false);
        setLoading(false);

        const msg = err?.message?.includes("expired")
          ? "This link has expired. Please request a new one."
          : "Invalid or expired link.";

        setStatus(msg);
        showToast("error", msg);
      }
    };

    runAction();
  }, [mode, oobCode, firebaseAuth]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      return showToast("error", "Password must be at least 6 characters");
    }

    if (newPassword !== confirmNewPassword) {
      return showToast("error", "Password and Confirm Password do not match");
    }

    try {
      setResetLoading(true);

      await confirmPasswordReset(firebaseAuth, oobCode, newPassword);

      setSuccess(true);
      setStatus("✅ Password reset successful! Please login.");
      showToast("success", "✅ Password reset successful! Now login.");

      setNewPassword("");
      setConfirmNewPassword("");

      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      console.error("Reset password error:", err);
      showToast(
        "error",
        err?.message?.includes("expired")
          ? "Reset link expired. Request new reset link."
          : "Failed to reset password."
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col select-none">
      <Toast
        type={toastType}
        message={toastMsg}
        onClose={() => setToastMsg("")}
      />

      {/* Top Bar */}
      <div className="w-full h-[62px] sm:h-[80px] flex items-center justify-start px-4 sm:px-8">
        <img
          src={Logo}
          alt="Logo"
          className="h-[90px] sm:h-[150px] w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
          draggable={false}
          onClick={() => navigate("/")}
        />
      </div>

      {/* Body */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-lg pt-2 sm:pt-8">
          <div className="w-full bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-5 sm:p-10">
            <div className="text-center">
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-wide">
                MishraMart Authentication
              </h1>
              <p className="text-gray-300 mt-2 text-xs sm:text-base">
                Secure verification and password reset
              </p>
            </div>

            {loading && (
              <div className="mt-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-gray-300 text-xs sm:text-sm">{status}</p>
              </div>
            )}

            {!loading && mode !== "resetPassword" && (
              <div
                className={`mt-6 p-4 rounded-2xl border text-xs sm:text-base ${
                  success
                    ? "bg-green-500/15 border-green-500/30 text-green-200"
                    : "bg-red-500/15 border-red-500/30 text-red-200"
                }`}
              >
                {status}
              </div>
            )}

            {!loading && mode === "resetPassword" && (
              <>
                <div className="mt-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 text-xs sm:text-sm">
                  Please enter a new password below to reset your account.
                </div>

                <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      className="w-full h-12 px-4 pr-16 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300 text-sm"
                      required
                      disabled={resetLoading}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#4aa4b5] hover:text-white transition"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={resetLoading}
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300 text-sm"
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

            <p className="text-center text-[10px] sm:text-xs text-gray-300 mt-8 leading-relaxed">
              If this link is expired, please request a new verification/reset link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthAction;
