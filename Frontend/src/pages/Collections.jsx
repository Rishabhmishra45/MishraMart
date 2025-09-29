import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";

const Collections = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const categories = ["Men", "Women", "Kids"];
  const subcategories = ["TopWear", "BottomWear", "WinterWear"];

  if (isLoading) {
    return (
      <LoadingSpinner
        message="Loading Collection page..."
        spinnerColor="#aaf5fa"
        textColor="#aaf5fa"
      />
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex pt-[60px] text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-[60px] left-0 h-[calc(100vh-60px)] md:h-auto w-[70vw] md:w-[25vw] lg:w-[20vw] bg-[#0f1b1d]/95 backdrop-blur-md border-r border-gray-600 p-5 transform transition-transform duration-500 ease-in-out z-30 ${
          showFilter ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        onClick={(e) => e.stopPropagation()} // prevent overlay click propagate
      >
        {/* Close icon for mobile */}
        <div className="flex items-center justify-between mb-4 md:justify-start">
          <h2 className="text-[22px] font-semibold select-none">FILTERS</h2>
          <button
            className="md:hidden text-[20px] p-1 hover:text-red-400"
            onClick={() => setShowFilter(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* Categories */}
        <div className="border border-gray-400 pl-5 py-3 mt-2 rounded-md bg-slate-700/60">
          <p className="text-[18px] text-[#f8fafa] mb-3">CATEGORIES</p>
          <div className="flex flex-col gap-3 select-none">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 text-[16px] font-light cursor-pointer hover:text-blue-400 transition-colors duration-300"
              >
                <input type="checkbox" value={cat} className="w-4 h-4" />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Subcategories */}
        <div className="border border-gray-400 pl-5 py-3 mt-6 rounded-md bg-slate-700/60">
          <p className="text-[18px] text-[#f8fafa] mb-3">SUBCATEGORIES</p>
          <div className="flex flex-col gap-3 select-none">
            {subcategories.map((sub) => (
              <label
                key={sub}
                className="flex items-center gap-2 text-[16px] font-light cursor-pointer hover:text-blue-400 transition-colors duration-300"
              >
                <input type="checkbox" value={sub} className="w-4 h-4" />
                {sub}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {showFilter && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setShowFilter(false)}
        ></div>
      )}

      {/* Main content */}
      <div
        className="flex-1 p-6 md:ml-[25vw] lg:ml-[20vw] relative z-0"
        onClick={() => showFilter && setShowFilter(false)} // close sidebar on content click
      >
        {/* Mobile toggle button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 bg-[#0f1b1d]/80 p-2 rounded-md border border-gray-600 hover:bg-[#0f1b1d]/100 transition-colors duration-300 relative z-10"
          >
            <span>Filters</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Placeholder for main content */}
        <div className="text-white">
          {/* Items or any dynamic content goes here */}
        </div>
      </div>
    </div>
  );
};

export default Collections;
