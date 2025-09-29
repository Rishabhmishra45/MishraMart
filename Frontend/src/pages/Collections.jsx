import React, { useState, useEffect, useContext } from "react";
import { FaTimes } from "react-icons/fa";
import { FaArrowRightToBracket } from "react-icons/fa6";
import LoadingSpinner from "../components/LoadingSpinner";
import Tittle from "../components/Tittle";
import { shopDataContext } from "../context/ShopContext";
import Card from "../components/Card";

const Collections = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { products } = useContext(shopDataContext);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  // Available categories and subcategories
  const categories = ["Men", "Women", "Kids"];
  const subcategories = ["TopWear", "BottomWear", "WinterWear"];

  // Initialize products
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category)
      );
    }

    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSubcategories.includes(item.subcategory)
      );
    }

    switch (sortType) {
      case "low-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "high-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategories, selectedSubcategories, sortType]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((sub) => sub !== subcategory)
        : [...prev, subcategory]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSortType("relevant");
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex pt-[60px] text-white overflow-x-hidden">
      {/* ================= Sidebar Filters ================= */}
      <div
        className={`fixed md:fixed top-[60px] h-[calc(100vh-60px)]
          w-[65vw] sm:w-[60vw] md:w-[25vw] lg:w-[18vw] bg-[#0f1b1d] border-r border-gray-600 p-5 pt-[35px]
          transition-transform duration-300 z-40 overflow-y-auto 
          ${showFilter ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">FILTERS</h2>
          <div className="flex items-center gap-2">
            {(selectedCategories.length > 0 ||
              selectedSubcategories.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Clear All
              </button>
            )}
            <button
              className="md:hidden p-1 hover:text-red-400"
              onClick={() => setShowFilter(false)}
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">CATEGORIES</h3>
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-3 text-sm cursor-pointer hover:text-blue-400 p-2 rounded hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 accent-blue-500"
              />
              <span>{category}</span>
            </label>
          ))}
        </div>

        {/* Subcategories */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">SUB-CATEGORIES</h3>
          {subcategories.map((subcategory) => (
            <label
              key={subcategory}
              className="flex items-center gap-3 text-sm cursor-pointer hover:text-blue-400 p-2 rounded hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={selectedSubcategories.includes(subcategory)}
                onChange={() => handleSubcategoryChange(subcategory)}
                className="w-4 h-4 accent-blue-500"
              />
              <span>{subcategory}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ================= Mobile Overlay ================= */}
      {showFilter && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setShowFilter(false)}
        />
      )}

      {/* ================= Main Content ================= */}
      <div className="flex-1 relative min-h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden md:ml-[25vw] lg:ml-[20vw]">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Mobile Header */}
          <div className="md:hidden mb-6 mt-4">
            <Tittle text1="ALL" text2="COLLECTIONS" />
            <p className="text-gray-300 text-sm mt-2">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"} found
            </p>
          </div>

          {/* Mobile Filter Button */}
          <div className="md:hidden flex items-center justify-between mb-8">
            <button
              onClick={() => setShowFilter(true)}
              className="flex items-center gap-2 bg-[#0f1b1d] border border-gray-600 hover:border-blue-400 px-4 py-2 rounded-lg"
            >
              <span className="font-medium">Filters</span>
              <FaArrowRightToBracket className="text-lg" />
            </button>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="bg-[#0f1b1d] border border-gray-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              <option value="relevant">Relevant</option>
              <option value="low-high">Low to High</option>
              <option value="high-low">High to Low</option>
            </select>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <Tittle text1="ALL" text2="COLLECTIONS" />
            <div className="flex items-center gap-4">
              <p className="text-gray-300 text-sm">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"} found
              </p>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="bg-[#0f1b1d] border border-gray-600 hover:border-blue-400 px-3 py-2 rounded-lg"
              >
                <option value="relevant">Relevant</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 place-items-center overflow-x-hidden overflow-y-hidden">
              {filteredProducts.map((item, index) => (
                <div
                  key={item._id}
                  className="w-full max-w-[460px] sm:max-w-[300px] sm:max-h-[200px]"
                >
                  <Card
                    id={item._id}
                    name={item.name}
                    price={item.price}
                    image={item.image1}
                    index={index}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4 opacity-50">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No products found
              </h3>
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collections;
