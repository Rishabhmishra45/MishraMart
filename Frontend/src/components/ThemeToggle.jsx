import React, { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { FaMoon, FaSun, FaDesktop } from "react-icons/fa";

const ThemeToggle = () => {
  const { mode, setMode, theme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const icon = () => {
    if (mode === "dark") return <FaMoon />;
    if (mode === "light") return <FaSun />;
    return <FaDesktop />;
  };

  const label = () => {
    if (mode === "system") return "System";
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Main Button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          backgroundColor: mode === 'dark' ? '#162327' : '#ffffff',
          color: mode === 'dark' ? '#ffffff' : '#000000',
          borderColor: mode === 'dark' ? '#374151' : '#e5e7eb',
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border
        hover:bg-gray-100 dark:hover:bg-gray-800 transition text-xs sm:text-sm"
        title={`Theme: ${mode} (${theme})`}
      >
        <span className="text-base">{icon()}</span>
        {/* ✅ show on mobile also but smaller */}
        <span className="block font-medium text-[11px] sm:text-sm">{label()}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-[9999]"
          style={{
            backgroundColor: mode === 'dark' ? '#162327' : '#ffffff',
            color: mode === 'dark' ? '#ffffff' : '#000000',
            border: `1px solid ${mode === 'dark' ? '#374151' : '#e5e7eb'}`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          {/* System Option - NO selected state, only hover */}
          <button
            type="button"
            onClick={() => {
              setMode("system");
              setOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-sm transition"
            style={{
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = mode === 'dark' ? '#374151' : '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FaDesktop />
            System (Default)
          </button>

          {/* Light Option - NO selected state, only hover */}
          <button
            type="button"
            onClick={() => {
              setMode("light");
              setOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-sm transition"
            style={{
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = mode === 'dark' ? '#374151' : '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FaSun />
            Light
          </button>

          {/* Dark Option - NO selected state, only hover */}
          <button
            type="button"
            onClick={() => {
              setMode("dark");
              setOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-sm transition"
            style={{
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = mode === 'dark' ? '#374151' : '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FaMoon />
            Dark
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;