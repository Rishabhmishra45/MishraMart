import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

const Collections = () => {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="w-screen min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex pt-[60px] overflow-hidden text-white">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-[60px] left-0 h-[calc(100vh-60px)] md:h-auto w-[70vw] md:w-[25vw] lg:w-[20vw] bg-[#0f1b1d]/90 backdrop-blur-md border-r border-gray-600 p-5 transform transition-transform duration-500 ease-in-out z-20
        ${showFilter ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between md:justify-start">
          <h2 className="text-[22px] font-semibold select-none">FILTERS</h2>
          {/* Toggle only on mobile */}
          <span
            onClick={() => setShowFilter((prev) => !prev)}
            className="md:hidden cursor-pointer transition-transform duration-300"
          >
            {showFilter ? (
              <FaChevronDown className="text-[20px]" />
            ) : (
              <FaChevronRight className="text-[20px]" />
            )}
          </span>
        </div>

        {/* Categories */}
        <div className="border border-gray-400 pl-5 py-3 mt-6 rounded-md bg-slate-700/60">
          <p className="text-[18px] text-[#f8fafa] mb-3">CATEGORIES</p>
          <div className="flex flex-col gap-3 select-none">
            {["Men", "Women", "Kids"].map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 text-[16px] font-light cursor-pointer"
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
            {["TopWear", "BottomWear", "WinterWear"].map((sub) => (
              <label
                key={sub}
                className="flex items-center gap-2 text-[16px] font-light cursor-pointer"
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
          className="fixed inset-0 bg-black/40 md:hidden z-10"
          onClick={() => setShowFilter(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 p-6 md:ml-[25vw] lg:ml-[20vw]">
        <h1 className="text-3xl font-bold mb-6">Collections</h1>
        <p className="text-gray-300">
          Here are the products for the selected filters...
        </p>
      </div>
    </div>
  );
};

export default Collections;
