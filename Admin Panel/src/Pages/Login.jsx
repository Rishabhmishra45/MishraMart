import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
import { adminDataContext } from "../context/AdminContext";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { serverUrl } = useContext(authDataContext);
  const { getAdmin } = useContext(adminDataContext);

  const AdminLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/adminlogin`,
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Login successful:", result.data);
      
      // Set flag to show notification
      sessionStorage.setItem('showLoginNotification', 'true');
      
      // Refresh admin data - this will trigger re-render in App.jsx
      if (getAdmin) {
        await getAdmin();
      }
      
      // Navigation will happen automatically via App.jsx re-render
      
    } catch (error) {
      console.log("Login error:", error);
      let errorMessage = "Login failed. Please check credentials.";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = "Network error. Please try again.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex flex-col select-none">
      {/* Navbar / Logo */}
      <div className="w-full h-[70px] sm:h-[80px] flex items-center justify-start px-4 sm:px-8">
        <img
          className="h-[120px] sm:h-[160px] w-auto object-contain"
          src={Logo}
          alt="Logo"
        />
      </div>

      {/* Page Title */}
      <div className="w-full text-center mt-10 sm:mt-5 px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide">
          Admin Login
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Secure access to your{" "}
          <span className="text-[#4aa4b5]">MishraMart</span> panel
        </p>
      </div>

      {/* Login Box */}
      <div className="flex flex-1 items-start sm:items-center justify-center px-3 sm:px-4 py-6 sm:py-10 mt-10 sm:mt-0 sm:mb-8">
        <div className="w-full max-w-sm sm:max-w-md bg-[#ffffff10] border border-[#ffffff20] backdrop-blur-2xl rounded-2xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6">
            Welcome Back
          </h2>

          {/* Input Fields */}
          <form className="flex flex-col gap-4" onSubmit={AdminLogin}>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-[#ffffff15] border border-transparent 
                focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base transition"
              required
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full h-11 sm:h-12 px-4 pr-10 rounded-lg bg-[#ffffff15] border border-transparent 
                  focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base transition"
                required
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 sm:h-12 rounded-lg text-white font-semibold mt-4 transition
                ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#4aa4b5] hover:bg-[#3a8c9a] hover:shadow-lg"
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-gray-400 text-xs text-center mt-6">
            Protected & Secured • MishraMart © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;