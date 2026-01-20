import React from "react";
import { FaSpinner } from "react-icons/fa";

const LoadingSpinner = ({
  message = "Loading...",
  spinnerColor,
  textColor,
  background,
}) => {
  const finalBg = background || "theme-bg";
  const finalSpinner = spinnerColor || "var(--accent)";
  const finalText = textColor || "var(--muted)";

  return (
    <div
      className={`w-full min-h-[100svh] ${finalBg} flex items-center justify-center px-4`}
      style={{ background: "var(--background)" }}
    >
      <div
        className="
          w-full max-w-sm sm:max-w-md
          flex flex-col items-center justify-center gap-4
          rounded-3xl p-6 sm:p-8
          border shadow-xl
          text-center
        "
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
        role="status"
        aria-live="polite"
      >
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl border flex items-center justify-center"
          style={{
            background: "color-mix(in oklab, var(--surface) 85%, transparent)",
            borderColor: "var(--border)",
          }}
        >
          <FaSpinner
            className="text-3xl sm:text-4xl animate-spin"
            style={{ color: finalSpinner }}
          />
        </div>

        <p
          className="text-sm sm:text-base font-semibold leading-relaxed"
          style={{ color: finalText }}
        >
          {message}
        </p>

        {/* subtle skeleton line */}
        <div className="w-full mt-1">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "color-mix(in oklab, var(--border) 55%, transparent)" }}
          >
            <div
              className="h-2 w-2/3 rounded-full animate-pulse"
              style={{
                background:
                  "linear-gradient(90deg, var(--accent), var(--accent-2))",
              }}
            />
          </div>
        </div>

        <p className="text-xs sm:text-sm opacity-70">
          Please wait, fetching latest data...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
