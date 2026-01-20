import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import google from "../assets/google.png";
import { IoEyeOutline, IoEyeOffOutline, IoArrowBack } from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, provider } from "../../utils/Firebase";
import { userDataContext } from "../context/UserContext";

// Modern toast below navbar
const Toast = ({ type = "success", message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-[76px] sm:top-[88px] left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-[9999] w-[92%] sm:w-96 pointer-events-none">
      <div
        className={`pointer-events-auto p-3 sm:p-4 rounded-2xl border backdrop-blur-xl shadow-xl animate-fade-in ${
          type === "success"
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-1 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {message}
          </div>
          <button
            className="text-base opacity-80 hover:opacity-100 transition"
            onClick={onClose}
            type="button"
            aria-label="Close toast"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  let { serverUrl } = useContext(authDataContext);
  let { getCurrentUser } = useContext(userDataContext);

  const showToast = (type, msg) => {
    setToastType(type);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCred.user;
      await user.reload();

      if (!user.emailVerified) {
        await signOut(auth);
        showToast(
          "error",
          "⚠️ Email not verified!\n\nGo to your email inbox/spam and click verification link, then login again."
        );
        setLoading(false);
        return;
      }

      await axios.post(
        `${serverUrl}/api/auth/login`,
        { email: email.trim(), password },
        { withCredentials: true }
      );

      await getCurrentUser();
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      if (error?.code === "auth/invalid-credential") {
        showToast("error", "Invalid email or password.");
      } else {
        const backendMsg = error?.response?.data?.message;
        showToast(
          "error",
          backendMsg || error?.message || "Network error during login"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const googlelogin = async () => {
    try {
      setLoading(true);

      const response = await signInWithPopup(auth, provider);
      const user = response.user;

      const name = user.displayName;
      const email = user.email;

      await axios.post(
        `${serverUrl}/api/auth/googlelogin`,
        { name, email },
        { withCredentials: true }
      );

      await getCurrentUser();
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      showToast("error", "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] pb-[20px] bg-[color:var(--background)] text-[color:var(--text)] overflow-hidden overflow-x-hidden">
      <Toast
        type={toastType}
        message={toastMsg}
        onClose={() => setToastMsg("")}
      />

      {/* Navbar offset */}
      <div className="pt-[88px] sm:pt-[96px]">
        {/* Mobile: top aligned + margin | Desktop: centered */}
        <div className="min-h-[calc(100svh-88px)] sm:min-h-[calc(100svh-96px)] flex justify-center px-4">
          <div className="w-full max-w-sm sm:max-w-md">
            <div className="min-h-[calc(100svh-88px)] sm:min-h-[calc(100svh-96px)] flex items-start sm:items-center justify-center">
              {/* Mobile: push up + keep bottom safe space */}
              <div className="w-full mt-6 sm:mt-0">
                <div className="text-center mb-5 sm:mb-7">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                    Welcome back
                  </h1>
                  <p className="text-[color:var(--muted)] text-sm sm:text-base leading-relaxed">
                    Sign in to Your
                    <span className="text-cyan-500 font-semibold">
                      {" "}
                      MishraMart
                    </span>{" "}
                    Account and start shopping today!
                  </p>
                </div>

                <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                  <button
                    onClick={!loading ? googlelogin : undefined}
                    className={`w-full min-h-[44px] flex items-center justify-center gap-2 sm:gap-3 bg-[color:var(--surface-2)] border border-[color:var(--border)] rounded-xl py-3 px-4 mb-4 transition ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[color:var(--surface)] active:scale-[0.99]"
                    }`}
                    disabled={loading}
                  >
                    <img
                      src={google}
                      alt="Google"
                      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                      draggable={false}
                    />
                    <span className="font-semibold text-sm sm:text-base">
                      Continue with Google
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[color:var(--muted)] mb-4 sm:mb-6">
                    <div className="flex-1 h-px bg-[color:var(--border)]"></div>
                    <span className="text-xs sm:text-sm px-2">OR</span>
                    <div className="flex-1 h-px bg-[color:var(--border)]"></div>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[color:var(--muted)] mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-transparent border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 text-sm sm:text-base"
                        required
                        value={email}
                        disabled={loading}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[color:var(--muted)] mb-2">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-transparent border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 text-sm sm:text-base pr-11"
                          required
                          value={password}
                          disabled={loading}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          disabled={loading}
                          className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] grid place-items-center rounded-lg text-[color:var(--muted)] hover:text-[color:var(--text)] transition focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <IoEyeOffOutline size={18} />
                          ) : (
                            <IoEyeOutline size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => !loading && navigate("/forgot-password")}
                        className={`text-cyan-500 text-xs sm:text-sm font-semibold ${
                          loading
                            ? "cursor-not-allowed opacity-50"
                            : "hover:underline"
                        }`}
                        disabled={loading}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full min-h-[48px] px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-extrabold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                        loading
                          ? "bg-gray-500 cursor-not-allowed text-white"
                          : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-white hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </button>

                    <p className="text-center text-[color:var(--muted)] text-xs sm:text-sm mt-4">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => !loading && navigate("/signup")}
                        className={`text-cyan-500 font-semibold ${
                          loading
                            ? "cursor-not-allowed opacity-50"
                            : "hover:underline"
                        }`}
                        disabled={loading}
                      >
                        Create Account
                      </button>
                    </p>
                  </form>
                </div>

                {/* Mobile bottom safe space so it never touches bottom nav */}
                <div className="h-12 sm:hidden" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
