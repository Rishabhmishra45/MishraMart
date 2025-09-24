import React, { useState } from 'react'
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaRegListAlt } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: "/add", icon: IoMdAddCircleOutline, label: "Add Items", description: "Add new products" },
    { path: "/lists", icon: FaRegListAlt, label: "List Items", description: "Manage products" },
    { path: "/orders", icon: SiTicktick, label: "View Orders", description: "Order management" }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-3 rounded-lg text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Fixed Sidebar */}
      <div
        className={`
          fixed left-0 top-16 lg:top-20 z-40
          w-64 lg:w-72 xl:w-80
          h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]
          bg-gradient-to-b from-gray-900 to-gray-800
          border-r border-gray-700
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Product Management</p>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-6rem)]">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl
                  transition-all duration-200
                  hover:bg-blue-500/20 hover:border-blue-500/50
                  border-2
                  ${active
                    ? 'bg-blue-500/30 border-blue-500 text-white'
                    : 'border-transparent text-gray-300'
                  }
                `}
              >
                <IconComponent className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                </div>
                {active && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="text-center text-gray-400 text-sm">Admin Dashboard v1.0</div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
