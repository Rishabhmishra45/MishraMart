import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import google from "../assets/google.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
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
    <div className="fixed top-[92px] left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-[9999] w-[92%] sm:w-[420px]">
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
    setTimeout(() => setToastMsg(""), 6500);
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
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col select-none">
      <Toast
        type={toastType}
        message={toastMsg}
        onClose={() => setToastMsg("")}
      />

      <div className="w-full h-[70px] sm:h-[80px] flex items-center justify-start px-4 sm:px-8">
        <img
          className="h-[120px] sm:h-[160px] w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
          src={Logo}
          alt="Logo"
          draggable={false}
          onClick={() => !loading && navigate("/")}
        />
      </div>

      <div className="w-full text-center mt-2 sm:mt-4 px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide">
          Create Account
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Join <span className="text-[#4aa4b5] font-semibold">MishraMart</span>{" "}
          and start shopping today!
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-3 sm:px-4 py-6">
        <div className="w-full max-w-sm sm:max-w-md bg-[#ffffff10] border border-[#ffffff20] backdrop-blur-2xl rounded-2xl shadow-2xl p-6 sm:p-8">
          <div
            className={`w-full flex items-center justify-center gap-3 bg-[#42656cae] rounded-lg py-3 mb-6 transition 
              ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#42656c] cursor-pointer"
              }`}
            onClick={!loading ? googleSignup : undefined}
          >
            <img
              src={google}
              alt="Google"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full"
              draggable={false}
            />
            <span className="font-medium text-white text-sm sm:text-base">
              Sign up with Google
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
            <div className="flex-1 h-[1px] bg-[#96969635]" />
            <span className="text-xs sm:text-sm">OR</span>
            <div className="flex-1 h-[1px] bg-[#96969635]" />
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-[#ffffff15] border border-transparent 
                focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base transition"
              required
              disabled={loading}
              onChange={(e) => setName(e.target.value)}
              value={name}
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-[#ffffff15] border border-transparent 
                focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base transition"
              required
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full h-11 sm:h-12 px-4 pr-10 rounded-lg bg-[#ffffff15] border border-transparent 
                  focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base transition"
                required
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <button
                type="button"
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <IoEyeOffOutline size={20} />
                ) : (
                  <IoEyeOutline size={20} />
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full h-11 sm:h-12 px-4 pr-10 rounded-lg bg-[#ffffff15] border border-transparent 
                  focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base transition"
                required
                disabled={loading}
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
              <button
                type="button"
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <IoEyeOffOutline size={20} />
                ) : (
                  <IoEyeOutline size={20} />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 sm:h-12 rounded-lg text-white font-semibold mt-2 transition
                ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#4aa4b5] hover:bg-[#3a8c9a] hover:shadow-lg"
                }`}
            >
              {loading
                ? sendingVerify
                  ? "Sending verification..."
                  : "Creating..."
                : "Create Account"}
            </button>

            <p className="text-center text-gray-400 mt-2 text-xs sm:text-sm">
              Already have an account?{" "}
              <span
                className={`text-[#1a1aebcf] font-semibold ${
                  loading
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:underline"
                }`}
                onClick={() => !loading && navigate("/login")}
              >
                Login
              </span>
            </p>

            <p className="text-center text-gray-400 mt-3 text-[11px] sm:text-xs leading-relaxed">
              Note: We send a verification link to your email.
              <br />
              Please verify first, then login.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
