import React from "react";
import { FaSpinner } from "react-icons/fa";

const LoadingSpinner = ({ 
  message = "Loading...", 
  spinnerColor = "#aaf5fa",
  textColor = "#aaf5fa",
  background = "bg-gradient-to-l from-[#141414] to-[#0c2025]"
}) => {
  return (
    <div className={`w-full min-h-screen ${background} flex items-center justify-center`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <FaSpinner 
          className="text-4xl animate-spin" 
          style={{ color: spinnerColor }} 
        />
        <p 
          className="text-lg font-light"
          style={{ color: textColor }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;