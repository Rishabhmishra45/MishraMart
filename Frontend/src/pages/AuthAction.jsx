import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../assets/logo.png";
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "../../utils/Firebase";
import { IoEyeOutline, IoEyeOffOutline, IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";

const AuthAction = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const mode = useMemo(() => params.get("mode"), [params]);
  const oobCode = useMemo(() => params.get("oobCode"), [params]);

  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Processing...");
  const [subTitle, setSubTitle] = useState("Please wait a moment");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Reset password UI state
  const [showPass, setShowPass] = useState(false);
  const [showCpass, setShowCpass] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const isVerifyEmail = mode === "verifyEmail";
  const isResetPass = mode === "resetPassword";

  // Beautiful background glow effect
  const Glow = () => (
    <>
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full" />
    </>
  );

  const runAction = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (!mode || !oobCode) {
        setPageTitle("Invalid Link");
        setSubTitle("This link is missing required parameters.");
        setErrorMsg("Invalid or expired link. Please request again.");
        setLoading(false);
        return;
      }

      // ✅ Verify email flow
      if (mode === "verifyEmail") {
        setPageTitle("Verifying Email...");
        setSubTitle("We are activating your MishraMart account");

        await checkActionCode(auth, oobCode);
        await applyActionCode(auth, oobCode);

        setSuccessMsg("✅ Email verified successfully! Your account is now active.");
        setPageTitle("Email Verified 🎉");
        setSubTitle("You can now login to MishraMart");
        setLoading(false);
        return;
      }

      // ✅ Reset password flow
      if (mode === "resetPassword") {
        setPageTitle("Reset Password");
        setSubTitle("Create a new secure password for your account");

        await verifyPasswordResetCode(auth, oobCode);

        setSuccessMsg("Enter your new password below.");
        setLoading(false);
        return;
      }

      // Unsupported
      setPageTitle("Unsupported Action");
      setSubTitle("This action is not supported on this page.");
      setErrorMsg("Unsupported action.");
      setLoading(false);
    } catch (err) {
      console.error("Auth action error:", err);

      setPageTitle("Link Expired / Invalid");
      setSubTitle("Please request a new verification/reset link.");
      setErrorMsg("This link is invalid or expired. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    runAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, oobCode]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPass || newPass.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setErrorMsg("Password and Confirm Password do not match.");
      return;
    }

    setResetLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPass);

      setSuccessMsg("✅ Password changed successfully! Now you can login.");
      setPageTitle("Password Updated ✅");
      setSubTitle("Redirecting you to login...");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Reset password error:", err);
      setErrorMsg("Failed to reset password. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col">
      <Glow />

      {/* Top Bar */}
      <div className="relative z-10 w-full px-4 sm:px-10 py-6 flex items-center justify-between">
        <img
          src={Logo}
          alt="Logo"
          className="h-14 sm:h-16 cursor-pointer hover:scale-105 transition"
          draggable={false}
          onClick={() => navigate("/")}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="hidden sm:block px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-lg bg-[#4aa4b5] hover:bg-[#3a8c9a] transition font-semibold"
          >
            Login
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-xl bg-white/10 border border-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-10">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
              {pageTitle}
            </h1>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">
              {subTitle}
            </p>
          </div>

          {/* Status */}
          {loading && (
            <div className="mt-8 text-center">
              <div className="w-14 h-14 border-[3px] border-cyan-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-cyan-200 text-sm">
                Please don’t close this page...
              </p>
            </div>
          )}

          {!loading && successMsg && (
            <div className="mt-8 p-4 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-200">
              <div className="flex items-start gap-3">
                <IoCheckmarkCircleOutline size={24} className="mt-0.5" />
                <div>
                  <p className="font-semibold">Success</p>
                  <p className="text-sm mt-1">{successMsg}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && errorMsg && (
            <div className="mt-8 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200">
              <div className="flex items-start gap-3">
                <IoWarningOutline size={24} className="mt-0.5" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm mt-1">{errorMsg}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={runAction}
                  className="flex-1 h-11 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="flex-1 h-11 rounded-xl bg-[#4aa4b5] hover:bg-[#3a8c9a] transition font-semibold"
                >
                  Forgot Password
                </button>
              </div>
            </div>
          )}

          {/* Reset password form */}
          {!loading && isResetPass && !errorMsg && (
            <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="New Password"
                  className="w-full h-12 px-4 pr-10 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300"
                  value={newPass}
                  disabled={resetLoading}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <button
                  type="button"
                  disabled={resetLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showCpass ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full h-12 px-4 pr-10 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300"
                  value={confirmPass}
                  disabled={resetLoading}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
                <button
                  type="button"
                  disabled={resetLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
                  onClick={() => setShowCpass(!showCpass)}
                >
                  {showCpass ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className={`w-full h-12 rounded-xl font-semibold transition ${
                  resetLoading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#4aa4b5] hover:bg-[#3a8c9a] active:scale-[0.99]"
                }`}
              >
                {resetLoading ? "Updating..." : "Update Password"}
              </button>

              <p className="text-xs text-gray-400 text-center pt-2">
                Tip: Choose a strong password to keep your account safe.
              </p>
            </form>
          )}

          {/* Verify email CTA */}
          {!loading && isVerifyEmail && !errorMsg && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 h-12 rounded-xl bg-[#4aa4b5] hover:bg-[#3a8c9a] transition font-semibold"
              >
                Continue to Login
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 h-12 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
              >
                Go Home
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-[11px] sm:text-xs text-gray-400 mt-8 text-center leading-relaxed">
            If you didn’t request this email, you can safely ignore it.
            <br />
            MishraMart protects your account with secure email verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthAction;
