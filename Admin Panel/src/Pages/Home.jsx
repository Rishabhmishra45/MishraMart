import React, { useState, useEffect, useContext } from "react";
import LoginNotification from "../components/LoginNotification";
import { adminDataContext } from "../context/AdminContext";
import { FaBoxOpen, FaShoppingCart, FaUsers, FaChartLine } from "react-icons/fa";

const Home = () => {
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const { adminData } = useContext(adminDataContext);

  useEffect(() => {
    const shouldShowNotification = sessionStorage.getItem("showLoginNotification");

    if (shouldShowNotification && adminData) {
      setShowLoginNotification(true);
      sessionStorage.removeItem("showLoginNotification");

      const timer = setTimeout(() => setShowLoginNotification(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [adminData]);

  const stats = [
    { title: "Total Products", value: "0", icon: <FaBoxOpen />, color: "text-cyan-400" },
    { title: "Pending Orders", value: "0", icon: <FaShoppingCart />, color: "text-green-400" },
    { title: "Users", value: "0", icon: <FaUsers />, color: "text-purple-400" },
    { title: "Revenue", value: "₹0", icon: <FaChartLine />, color: "text-yellow-400" },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto p-3 sm:p-4 lg:p-6">
      {/* Login Notification */}
      <LoginNotification isVisible={showLoginNotification} onClose={() => setShowLoginNotification(false)} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:gap-2 mb-6">
          <h1 className="text-xl sm:text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Welcome back! Manage products, orders and users from one place.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((s) => (
            <div
              key={s.title}
              className="bg-gray-900/50 rounded-2xl border border-gray-800 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition"
            >
              <div className="flex items-center justify-between">
                <div className={`text-lg sm:text-2xl ${s.color}`}>{s.icon}</div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/5 border border-gray-800" />
              </div>
              <div className="mt-3">
                <p className="text-[11px] sm:text-sm text-gray-400">{s.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Welcome Card */}
        <div className="mt-6 sm:mt-10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl border border-cyan-500/20 p-5 sm:p-8 shadow-2xl">
          <h2 className="text-base sm:text-2xl font-bold text-white mb-2">
            Welcome to MishraMart Admin 🚀
          </h2>
          <p className="text-gray-300 text-xs sm:text-base leading-relaxed">
            Use the sidebar to add products, manage inventory, process orders and soon you can control customer reviews too.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-gray-950/40 border border-gray-800 p-4">
              <p className="text-white font-semibold text-sm">Quick Tip</p>
              <p className="text-gray-400 text-xs mt-1">Keep product images optimized for faster load.</p>
            </div>
            <div className="rounded-2xl bg-gray-950/40 border border-gray-800 p-4">
              <p className="text-white font-semibold text-sm">Security</p>
              <p className="text-gray-400 text-xs mt-1">Logout after work to keep admin safe.</p>
            </div>
            <div className="rounded-2xl bg-gray-950/40 border border-gray-800 p-4">
              <p className="text-white font-semibold text-sm">Next Feature</p>
              <p className="text-gray-400 text-xs mt-1">Review moderation & analytics coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
