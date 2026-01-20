import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import google from "../assets/google.png";
import { IoEyeOutline, IoEyeOffOutline, IoArrowBack } from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
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

const Registration = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingVerify, setSendingVerify] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  let { serverUrl } = useContext(authDataContext);
  let { getCurrentUser } = useContext(userDataContext);

  let [name, setName] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [confirmPassword, setConfirmPassword] = useState("");

  const showToast = (type, msg) => {
    setToastType(type);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) return showToast("error", "Please enter username");
    if (!cleanEmail) return showToast("error", "Please enter email");
    if (!password || password.length < 6)
      return showToast("error", "Password must be at least 6 characters");
    if (password !== confirmPassword)
      return showToast("error", "Password and Confirm Password do not match");

    setLoading(true);

    try {
      // Save username temporarily for verification sync
      localStorage.setItem("MM_PENDING_NAME", cleanName);
      localStorage.setItem("MM_PENDING_EMAIL", cleanEmail);

      const userCred = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      setSendingVerify(true);
      await sendEmailVerification(userCred.user);

      // Sync in backend
      await axios.post(
        `${serverUrl}/api/auth/firebase-sync`,
        { name: cleanName, email: cleanEmail, verified: false, password },
        { withCredentials: true }
      );

      await signOut(auth);

      showToast(
        "success",
        "✅ Account created!\n\nVerification link sent to your email.\nPlease verify FIRST, then login."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      console.error("Signup error:", error);

      const firebaseMsg =
        error?.code === "auth/email-already-in-use"
          ? "This email is already registered. Please login."
          : error?.code === "auth/invalid-email"
          ? "Invalid email address."
          : error?.code === "auth/weak-password"
          ? "Weak password. Try a stronger one."
          : error?.message;

      const backendMsg = error?.response?.data?.message;
      showToast("error", backendMsg || firebaseMsg || "Signup failed");
    } finally {
      setSendingVerify(false);
      setLoading(false);
    }
  };

  const googleSignup = async () => {
    try {
      setLoading(true);

      const response = await signInWithPopup(auth, provider);
      const user = response.user;

      const gName = user.displayName || "MishraMart User";
      const gEmail = user.email;

      await axios.post(
        `${serverUrl}/api/auth/googlelogin`,
        { name: gName, email: gEmail },
        { withCredentials: true }
      );

      await getCurrentUser();
      navigate("/");
    } catch (error) {
      console.error("Google signup error:", error);
      showToast("error", "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-[color:var(--background)] text-[color:var(--text)] overflow-hidden overflow-x-hidden">
      <Toast
        type={toastType}
        message={toastMsg}
        onClose={() => setToastMsg("")}
      />

      {/* Navbar offset */}
      <div className="pt-[88px] sm:pt-[96px] pb-[20px]">
        {/* Mobile: top aligned | Desktop: centered */}
        <div className="min-h-[calc(100svh-88px)] sm:min-h-[calc(100svh-96px)] flex justify-center px-4">
          <div className="w-full max-w-sm sm:max-w-md">
            <div className="min-h-[calc(100svh-88px)] sm:min-h-[calc(100svh-96px)] flex items-start sm:items-center justify-center">
              {/* Mobile: push up + bottom safe space */}
              <div className="w-full mt-6 sm:mt-0">
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                    Create Account
                  </h1>
                  <p className="text-[color:var(--muted)] text-sm sm:text-base leading-relaxed">
                    Join{" "}
                    <span className="text-cyan-500 font-semibold">
                      MishraMart
                    </span>{" "}
                    and start shopping today!
                  </p>
                </div>

                <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                  <button
                    onClick={!loading ? googleSignup : undefined}
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
                      Sign up with Google
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[color:var(--muted)] mb-4 sm:mb-6">
                    <div className="flex-1 h-px bg-[color:var(--border)]"></div>
                    <span className="text-xs sm:text-sm px-2">OR</span>
                    <div className="flex-1 h-px bg-[color:var(--border)]"></div>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[color:var(--muted)] mb-2">
                        Username <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your username"
                        className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-transparent border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 text-sm sm:text-base"
                        required
                        disabled={loading}
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[color:var(--muted)] mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-transparent border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 text-sm sm:text-base"
                        required
                        disabled={loading}
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
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
                          disabled={loading}
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                          autoComplete="new-password"
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

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[color:var(--muted)] mb-2">
                        Confirm Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-transparent border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 text-sm sm:text-base pr-11"
                          required
                          disabled={loading}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          value={confirmPassword}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          disabled={loading}
                          className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] grid place-items-center rounded-lg text-[color:var(--muted)] hover:text-[color:var(--text)] transition focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <IoEyeOffOutline size={18} />
                          ) : (
                            <IoEyeOutline size={18} />
                          )}
                        </button>
                      </div>
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
                      {loading
                        ? sendingVerify
                          ? "Sending verification..."
                          : "Creating Account..."
                        : "Create Account"}
                    </button>

                    <p className="text-center text-[color:var(--muted)] text-xs sm:text-sm mt-4">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => !loading && navigate("/login")}
                        className={`text-cyan-500 font-semibold ${
                          loading
                            ? "cursor-not-allowed opacity-50"
                            : "hover:underline"
                        }`}
                        disabled={loading}
                      >
                        Login
                      </button>
                    </p>

                    <p className="text-center text-[color:var(--muted)] text-xs mt-3 leading-relaxed">
                      Note: We send a verification link to your email.
                      <br />
                      Please verify first, then login.
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

export default Registration;
