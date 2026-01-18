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

const Registration = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sendingVerify, setSendingVerify] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  let { serverUrl } = useContext(authDataContext);
  let { getCurrentUser } = useContext(userDataContext);

  let [name, setName] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Signup with email verification link
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) return setErrorMsg("Please enter username");
    if (!email.trim()) return setErrorMsg("Please enter email");
    if (!password || password.length < 6)
      return setErrorMsg("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return setErrorMsg("Password and Confirm Password do not match");

    setLoading(true);

    try {
      // 1) Create user in Firebase
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // 2) Send verification email
      setSendingVerify(true);
      await sendEmailVerification(userCred.user);

      // 3) Sync user in backend DB (keep services safe)
      await axios.post(
        `${serverUrl}/api/auth/googlelogin`,
        { name, email },
        { withCredentials: true }
      );

      // 4) Important UX: Sign out so user doesn't stay authenticated before verify
      await signOut(auth);

      setSuccessMsg(
        "✅ Account created! Verification link has been sent to your email.\n\nPlease verify your email FIRST, then login."
      );

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Move to login after some time
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

      setErrorMsg(backendMsg || firebaseMsg || "Signup failed");
    } finally {
      setSendingVerify(false);
      setLoading(false);
    }
  };

  // ✅ Google Signup/Login
  const googleSignup = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const response = await signInWithPopup(auth, provider);
      const user = response.user;

      const name = user.displayName || "MishraMart User";
      const email = user.email;

      await axios.post(
        `${serverUrl}/api/auth/googlelogin`,
        { name, email },
        { withCredentials: true }
      );

      await getCurrentUser();
      navigate("/");
    } catch (error) {
      console.error("Google signup error:", error);
      setErrorMsg("Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ No horizontal scroll
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col select-none">
      {/* Navbar / Logo */}
      <div className="w-full h-[70px] sm:h-[80px] flex items-center justify-start px-4 sm:px-8">
        <img
          className="h-[120px] sm:h-[160px] w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
          src={Logo}
          alt="Logo"
          draggable={false}
          onClick={() => !loading && navigate("/")}
        />
      </div>

      {/* Page Title */}
      <div className="w-full text-center mt-2 sm:mt-4 px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide">
          Create Account
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Join{" "}
          <span className="text-[#4aa4b5] font-semibold">MishraMart</span> and
          start shopping today!
        </p>
      </div>

      {/* Registration Box */}
      <div className="flex flex-1 items-center justify-center px-3 sm:px-4 py-6">
        <div className="w-full max-w-sm sm:max-w-md bg-[#ffffff10] border border-[#ffffff20] backdrop-blur-2xl rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Alerts */}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded text-green-200 text-sm whitespace-pre-line">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded text-red-200 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Google Button */}
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

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
            <div className="flex-1 h-[1px] bg-[#96969635]" />
            <span className="text-xs sm:text-sm">OR</span>
            <div className="flex-1 h-[1px] bg-[#96969635]" />
          </div>

          {/* Form */}
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

            {/* Password */}
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
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
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
                {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            {/* Submit Button */}
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

            {/* Login Link */}
            <p className="text-center text-gray-400 mt-2 text-xs sm:text-sm">
              Already have an account?{" "}
              <span
                className={`text-[#1a1aebcf] font-semibold ${
                  loading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:underline"
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
