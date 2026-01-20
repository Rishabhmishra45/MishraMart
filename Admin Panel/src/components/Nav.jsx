import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import { authDataContext } from "../context/AuthContext";
import { adminDataContext } from "../context/AdminContext";

const Nav = () => {
  const navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);
  const { clearAdmin } = useContext(adminDataContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logOut = async () => {
    try {
      setIsLoggingOut(true);

      // Clear admin data immediately
      if (clearAdmin) clearAdmin();

      // Logout API call
      await axios.post(
        serverUrl + "/api/auth/logout",
        {},
        { withCredentials: true }
      );

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      if (clearAdmin) clearAdmin();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav
      className="
        w-full h-16 lg:h-20 fixed top-0 left-0 z-50
        border-b border-gray-800 shadow-2xl
        isolation-isolate
        bg-gradient-to-r from-gray-950 to-gray-900
        backdrop-blur-none
      "
      style={{
        // ensures completely opaque background (no see-through)
        backgroundColor: "#030712", // gray-950
      }}
    >
      {/* Optional: subtle overlay to make text crisper */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="relative h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div
          className="flex items-center gap-3 cursor-pointer group select-none"
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="Company Logo"
            className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain transition-transform group-hover:scale-105"
            draggable={false}
          />

          <div className="hidden sm:block">
            <h1 className="text-lg lg:text-xl font-extrabold text-white tracking-wide">
              MishraMart Admin
            </h1>
            <p className="text-xs lg:text-sm text-gray-400 hidden lg:block">
              Product & Review Management
            </p>
          </div>
        </div>

        {/* Mobile Title */}
        <div className="sm:hidden absolute left-1/2 -translate-x-1/2">
          <h1 className="text-base font-bold text-white whitespace-nowrap">
            Admin Panel
          </h1>
        </div>

        {/* Logout Button */}
        <button
          onClick={logOut}
          disabled={isLoggingOut}
          className={`
            relative flex items-center gap-2
            min-h-[44px]
            px-4 sm:px-5 lg:px-6 py-2
            rounded-xl font-semibold
            text-sm lg:text-base
            transition-all duration-300
            transform hover:scale-105 active:scale-95
            disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
            border border-white/10
            focus:outline-none focus:ring-2 focus:ring-cyan-500/40
            ${
              isLoggingOut
                ? "bg-gray-600 text-white"
                : "bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white"
            }
          `}
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Logging Out</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Nav;
