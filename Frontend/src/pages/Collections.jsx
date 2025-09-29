import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { FaArrowRightToBracket } from "react-icons/fa6";
import LoadingSpinner from "../components/LoadingSpinner";
import Tittle from "../components/Tittle";

const Collections = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterButton, setShowFilterButton] = useState(true); // track mobile button visibility

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

  // Handle opening sidebar
  const handleOpenSidebar = () => {
    setShowFilter(true);
    setShowFilterButton(false); // hide button immediately
  };

  // Handle closing sidebar
  const handleCloseSidebar = () => {
    setShowFilter(false);
    // Show button only after sidebar fully slides out (500ms)
    setTimeout(() => setShowFilterButton(true), 300);
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col md:flex-row pt-[60px] text-white overflow-hidden">
      
      {/* ================= Sidebar ================= */}
      <div
        className={`fixed md:static top-[60px] left-0 h-[calc(100vh-60px)] 
          w-[65vw] sm:w-[70vw] md:w-[25vw] lg:w-[18vw] max-w-[300px] bg-[#0f1b1d]/95 backdrop-blur-md 
          border-r border-gray-600 p-5 transform transition-transform duration-500 ease-in-out z-30 
          ${showFilter ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close icon for mobile */}
        <div className="flex items-center justify-between mb-4 md:justify-start">
          <h2 className="text-[22px] font-semibold select-none">FILTERS</h2>
          <button
            className="md:hidden text-[20px] p-1 hover:text-red-400"
            onClick={handleCloseSidebar} // updated
          >
            <FaTimes className="text-[25px] cursor-pointer" />
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

      {/* ================= Mobile overlay ================= */}
      {showFilter && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={handleCloseSidebar} // updated
        ></div>
      )}

      {/* ================= Mobile Filter Button ================= */}
      {showFilterButton && (
        <div className="md:hidden fixed top-[90px] ml-[5px] left-4 z-40">
          <button
            onClick={handleOpenSidebar} // updated
            className="flex items-center gap-2 bg-[#0f1b1d]/80 p-2 rounded-md border border-gray-600 hover:bg-[#0f1b1d]/100 transition-colors duration-300"
          >
            <span>Filters</span>
            <FaArrowRightToBracket className="text-[20px]" />
          </button>
        </div>
      )}

      {/* ================= Main Content ================= */}
      <div
        className="flex-1 ml-[5px] lg:ml-[20px] md:ml-[15px] mt-[60px] md:mt-[25px] lg:mt-[25px] max-w-full relative z-0 h-[calc(100vh-60px)] overflow-y-auto p-4 sm:p-6"
        onClick={showFilter ? handleCloseSidebar : undefined} // updated
      >
        {/* Page Title */}
        <div className="flex items-center justify-between flex-wrap mt-2 md:mt-0">
          <Tittle text1={"ALL"} text2={"COLLECTIONS"} />
        </div>

        {/* Products grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Render product cards here */}
        </div>
      </div>
    </div>
  );
};

export default Collections;
