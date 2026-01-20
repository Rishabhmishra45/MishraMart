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
    <div className={`w-full min-h-screen ${finalBg} flex items-center justify-center`}>
      <div
        className="flex flex-col items-center justify-center space-y-4 rounded-2xl p-8 border shadow-xl"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <FaSpinner className="text-4xl animate-spin" style={{ color: finalSpinner }} />
        <p className="text-sm sm:text-lg font-medium text-center" style={{ color: finalText }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
