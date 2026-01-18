import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import google from "../assets/google.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { signInWithPopup, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, provider } from "../../utils/Firebase";
import { userDataContext } from "../context/UserContext";

/* ✅ Modern toast component */
const Toast = ({ type = "success", message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-[9999] w-[92%] sm:w-[380px]">
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
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ✅ Normal login (Firebase verify check + backend session)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Firebase sign-in
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCred.user;

      // 2) refresh verification
      await user.reload();

      // 3) If not verified -> STOP + modern notification
      if (!user.emailVerified) {
        await signOut(auth); // don't keep firebase auth session
        showToast(
          "error",
          "⚠️ Email not verified!\n\nGo to your email inbox and click the verification link, then login again."
        );
        setLoading(false);
        return;
      }

      // 4) Backend login (cookie/session)
      await axios.post(
        `${serverUrl}/api/auth/login`,
        { email: email.trim(), password },
        { withCredentials: true }
      );

      await getCurrentUser();
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      // If wrong user/pass show invalid credential message
      const firebaseCode = error?.code;

      if (firebaseCode === "auth/invalid-credential") {
        showToast("error", "Invalid email or password.");
      } else {
        const backendMsg = error?.response?.data?.message;
        showToast("error", backendMsg || error?.message || "Network error during login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google login
  const googlelogin = async () => {
    try {
      setLoading(true);

      const response = await signInWithPopup(auth, provider);
      const user = response.user;

      const name = user.displayName;
      const email = user.email;

      // Backend user creation/login
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
    <div className="w-full min-h-screen overflow-x-hidden flex flex-col bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white select-none">
      <Toast type={toastType} message={toastMsg} onClose={() => setToastMsg("")} />

      {/* Navbar / Logo */}
      <div className="w-full h-[70px] sm:h-[80px] flex items-center px-4 sm:px-8">
        <img
          className="h-[120px] sm:h-[160px] w-auto object-contain cursor-pointer"
          src={Logo}
          alt="Logo"
          draggable={false}
          onClick={() => !loading && navigate("/")}
        />
      </div>

      {/* Page Title */}
      <div className="w-full text-center mt-2 sm:mt-4 px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide">
          Welcome back
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Sign in to Your
          <span className="text-[#4aa4b5] font-semibold"> MishraMart</span>{" "}
          Account and start shopping today!
        </p>
      </div>

      {/* Center Box */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 py-6">
        <div className="w-full max-w-sm sm:max-w-md bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl rounded-2xl p-6 sm:p-8">
          {/* Google Button */}
          <div
            className={`w-full flex items-center justify-center gap-3 bg-[#ffffff1a] border border-white/20 rounded-lg py-3 mb-6 transition 
              ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/20 cursor-pointer"
              }`}
            onClick={!loading ? googlelogin : undefined}
          >
            <img
              src={google}
              alt="Google"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full"
              draggable={false}
            />
            <span className="font-medium text-white text-sm sm:text-base">
              Continue with Google
            </span>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
            <div className="flex-1 h-[1px] bg-white/20"></div>
            <span className="text-xs sm:text-sm">OR</span>
            <div className="flex-1 h-[1px] bg-white/20"></div>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-white/10 border border-white/20 
                focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300 text-sm sm:text-base"
              required
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full h-11 sm:h-12 px-4 pr-10 rounded-lg bg-white/10 border border-white/20 
                  focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-300 text-sm sm:text-base"
                required
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <IoEyeOffOutline size={18} />
                ) : (
                  <IoEyeOutline size={18} />
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right mt-1">
              <span
                className={`text-[#4aa4b5] text-xs sm:text-sm font-semibold ${
                  loading
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:underline"
                }`}
                onClick={() => !loading && navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 sm:h-12 rounded-lg text-white font-semibold mt-4 transition
                ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#4aa4b5] hover:bg-[#3a8c9a]"
                }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Signup Link */}
            <p className="text-center text-gray-300 mt-3 text-xs sm:text-sm">
              Don’t have an account?{" "}
              <span
                className={`text-[#4aa4b5] font-semibold ${
                  loading
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:underline"
                }`}
                onClick={() => !loading && navigate("/signup")}
              >
                Create Account
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
