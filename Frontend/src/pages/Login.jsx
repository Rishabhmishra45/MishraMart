import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import google from "../assets/google.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/Firebase";
import { userDataContext } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  let { serverUrl } = useContext(authDataContext);
  let { getCurrentUser } = useContext(userDataContext);

  // ✅ Normal login (Firebase verify check + backend login)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");

    try {
      // 1) First Firebase login
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // 2) Refresh user verification status
      await user.reload();

      // 3) Block if NOT verified
      if (!user.emailVerified) {
        setErrMsg("Your email is not verified. Please verify your email first.");
        setLoading(false);
        return;
      }

      // 4) Backend login (cookie/session for your services)
      await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      await getCurrentUser();
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      const firebaseMsg =
        error?.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : error?.message;

      const backendMsg = error?.response?.data?.message;

      setErrMsg(backendMsg || firebaseMsg || "Network error during login");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google login
  const googlelogin = async () => {
    try {
      setLoading(true);
      setErrMsg("");

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
      setErrMsg("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden flex flex-col bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white select-none">
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
          {/* Error */}
          {errMsg && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded text-red-200 text-sm">
              {errMsg}
            </div>
          )}

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

            {/* Submit */}
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
