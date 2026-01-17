import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import google from "../assets/google.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/Firebase";
import { userDataContext } from "../context/UserContext";

const Registration = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step states
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [otp, setOtp] = useState("");

  let { serverUrl } = useContext(authDataContext);
  let { getCurrentUser } = useContext(userDataContext);

  let [name, setName] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [confirmPassword, setConfirmPassword] = useState("");

  // ✅ STEP 1: Validate email + Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Enter username");
    if (!email.trim()) return alert("Enter email");

    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/start-signup`,
        { name, email },
        { withCredentials: true }
      );

      alert(res?.data?.message || "OTP sent to email");
      setOtpSent(true);
      setOtpVerified(false);
    } catch (error) {
      console.error("Send OTP error:", error);
      alert(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) return alert("Enter 6-digit OTP");

    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/verify-email-otp`,
        { email, otp },
        { withCredentials: true }
      );

      alert(res?.data?.message || "OTP verified");
      setOtpVerified(true);
    } catch (error) {
      console.error("Verify OTP error:", error);
      alert(error?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP 3: Create Account (set password + login)
  const handleCompleteSignup = async (e) => {
    e.preventDefault();

    if (!otpVerified) return alert("Please verify OTP first");

    if (!password || password.length < 6)
      return alert("Password must be at least 6 characters");

    if (password !== confirmPassword)
      return alert("Password and Confirm Password do not match");

    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/complete-signup`,
        { email, password },
        { withCredentials: true }
      );

      alert(res?.data?.message || "Account created successfully");

      await getCurrentUser();
      navigate("/");
    } catch (error) {
      console.error("Complete signup error:", error);
      alert(error?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    if (!email.trim()) return alert("Enter email first");

    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/send-verify-otp`,
        { email },
        { withCredentials: true }
      );

      alert(res?.data?.message || "OTP resent");
      setOtpSent(true);
      setOtpVerified(false);
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert(error?.response?.data?.message || "Resend OTP failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Signup/Login
  const googleSignup = async () => {
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
      console.error("Google signup error:", error);
      alert("Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col overflow-hidden select-none">
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
            <div className="flex-1 h-[1px] bg-[#96969635]"></div>
            <span className="text-xs sm:text-sm">OR</span>
            <div className="flex-1 h-[1px] bg-[#96969635]"></div>
          </div>

          {/* STEP FORM */}
          <form
            onSubmit={
              !otpSent
                ? handleSendOtp
                : !otpVerified
                ? handleVerifyOtp
                : handleCompleteSignup
            }
            className="flex flex-col gap-4"
          >
            {/* Name */}
            <input
              type="text"
              placeholder="Username"
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-[#ffffff15] border border-transparent 
                focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base transition"
              required
              disabled={loading || otpSent}
              onChange={(e) => setName(e.target.value)}
              value={name}
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-[#ffffff15] border border-transparent 
                focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base transition"
              required
              disabled={loading || otpSent}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />

            {/* OTP input (after sending OTP) */}
            {otpSent && !otpVerified && (
              <>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="w-full h-11 sm:h-12 px-4 rounded-lg bg-[#ffffff15] border border-transparent 
                    focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base transition tracking-widest text-center"
                  required
                  disabled={loading}
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />

                <button
                  type="button"
                  disabled={loading}
                  className={`w-full h-11 sm:h-12 rounded-lg font-semibold transition border
                    ${
                      loading
                        ? "opacity-60 cursor-not-allowed border-white/20"
                        : "border-[#4aa4b5] text-[#4aa4b5] hover:bg-[#4aa4b5] hover:text-white"
                    }`}
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </button>
              </>
            )}

            {/* Password input (after OTP verified) */}
            {otpVerified && (
              <>
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                      hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                      hover:text-white transition-colors"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
                  </button>
                </div>
              </>
            )}

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
              {!otpSent
                ? loading
                  ? "Sending OTP..."
                  : "Validate Email"
                : !otpVerified
                ? loading
                  ? "Verifying..."
                  : "Verify OTP"
                : loading
                ? "Creating..."
                : "Create Account"}
            </button>

            {/* Login Link */}
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
