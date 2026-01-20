import React, { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaRegListAlt } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { MdRateReview } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      path: "/add",
      icon: IoMdAddCircleOutline,
      label: "Add Items",
      description: "Add new products",
    },
    {
      path: "/lists",
      icon: FaRegListAlt,
      label: "List Items",
      description: "Manage products",
    },
    {
      path: "/orders",
      icon: SiTicktick,
      label: "View Orders",
      description: "Order management",
    },
    {
      path: "/reviews",
      icon: MdRateReview,
      label: "Manage Reviews",
      description: "Moderate reviews",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => setIsMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (isMobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] bg-gray-950/90 border border-gray-700 p-2.5 rounded-xl text-white shadow-xl backdrop-blur"
        aria-label="Open Sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[55]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 lg:top-20 z-[58]
          w-72 sm:w-80 lg:w-72 xl:w-80
          h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]
          bg-gradient-to-b from-gray-950 to-gray-900
          border-r border-gray-800
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Manage Store</p>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl text-gray-200 hover:bg-white/10 transition"
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 sm:p-4 space-y-2 overflow-y-auto h-[calc(100%-7rem)]">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl
                  transition-all duration-200 border
                  ${active
                    ? "bg-cyan-500/15 border-cyan-500/40 text-white shadow-lg"
                    : "border-transparent text-gray-300 hover:bg-white/5 hover:border-gray-700"}
                `}
              >
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm sm:text-base">{item.label}</div>
                  <div className="text-[11px] sm:text-xs text-gray-400 mt-0.5">{item.description}</div>
                </div>
                {active && <div className="w-2 h-2 bg-cyan-400 rounded-full" />}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-800">
          <div className="text-center text-gray-500 text-xs sm:text-sm">
            MishraMart • Admin Dashboard
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
