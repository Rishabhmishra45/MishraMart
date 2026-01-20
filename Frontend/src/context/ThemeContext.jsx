import React, { createContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext();

const STORAGE_KEY = "mm_theme_mode"; // "system" | "light" | "dark"

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme) => {
  // ✅ We use data-theme so Tailwind config not required
  // CSS variables will handle colors
  document.documentElement.setAttribute("data-theme", theme);
};

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("system"); // default

  const resolvedTheme = useMemo(() => {
    return mode === "system" ? getSystemTheme() : mode;
  }, [mode]);

  // load saved
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      setMode(saved);
    }
  }, []);

  // apply
  useEffect(() => {
    applyTheme(resolvedTheme);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode, resolvedTheme]);

  // system theme listener
  useEffect(() => {
    if (mode !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(getSystemTheme());

    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [mode]);

  return (
    <ThemeContext.Provider
      value={{
        mode, // system|light|dark
        setMode,
        theme: resolvedTheme, // light|dark
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
