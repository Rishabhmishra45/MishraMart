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
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[color:var(--border)]
        bg-[color:var(--surface)] text-[color:var(--text)]
        hover:bg-[color:var(--surface-2)] transition text-xs sm:text-sm"
        title={`Theme: ${mode} (${theme})`}
      >
        <span className="text-base">{icon()}</span>
        {/* ✅ show on mobile also but smaller */}
        <span className="block font-medium text-[11px] sm:text-sm">{label()}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl border border-[color:var(--border)]
          bg-[color:var(--surface)] text-[color:var(--text)] shadow-xl overflow-hidden z-[999]"
        >
          <button
            type="button"
            onClick={() => {
              setMode("system");
              setOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-[color:var(--surface-2)] transition ${
              mode === "system" ? "text-cyan-400 font-semibold" : ""
            }`}
          >
            <FaDesktop />
            System (Default)
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("light");
              setOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-[color:var(--surface-2)] transition ${
              mode === "light" ? "text-cyan-400 font-semibold" : ""
            }`}
          >
            <FaSun />
            Light
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("dark");
              setOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-[color:var(--surface-2)] transition ${
              mode === "dark" ? "text-cyan-400 font-semibold" : ""
            }`}
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
