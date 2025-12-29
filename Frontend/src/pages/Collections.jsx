import React, { useState, useEffect, useContext } from "react";
import { FaTimes, FaFilter, FaSearch } from "react-icons/fa";
import { FaArrowRightToBracket } from "react-icons/fa6";
import Tittle from "../components/Tittle";
import { shopDataContext } from "../context/ShopContext";
import Card from "../components/Card";
import { useCart } from "../context/CartContext";
import CartNotification from "../components/CartNotification";

const Collections = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { products, search } = useContext(shopDataContext);
  const { showCartNotification, notificationProduct, setShowCartNotification } = useCart();
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  // Available categories and subcategories from actual products
  const categories = [...new Set(products.map(item => item.category).filter(Boolean))];
  const subcategories = [...new Set(products.map(item => item.subcategory).filter(Boolean))];

  // Initialize products with loading state
  useEffect(() => {
    if (products.length > 0) {
      setFilteredProducts(products);
      setIsLoading(false);
    }
  }, [products]);

  // Apply filters, search and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category)
      );
    }

    // Apply subcategory filters
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSubcategories.includes(item.subcategory)
      );
    }

    // Apply sorting
    switch (sortType) {
      case "low-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "high-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Relevant - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [products, search, selectedCategories, selectedSubcategories, sortType]);

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

  const handleCloseNotification = () => {
    setShowCartNotification(false);
  };

  // Auto-hide loading after data loads
  useEffect(() => {
    if (products.length > 0) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [products]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex pt-[60px] text-white overflow-x-hidden pb-[100px]">
      {/* Cart Notification */}
      <CartNotification
        product={notificationProduct}
        isVisible={showCartNotification}
        onClose={handleCloseNotification}
      />

      {/* ================= Sidebar Filters ================= */}
      <div
        className={`fixed top-[65px] h-[calc(100vh-60px)]
          w-[75vw] sm:w-[60vw] md:w-[280px] lg:w-[300px] bg-gradient-to-b from-[#0f1b1d] to-[#0a1517] border-r border-gray-700/50 p-5 pt-[35px]
          transition-transform duration-300 z-40 overflow-y-auto 
          ${showFilter ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          shadow-2xl shadow-black/30`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <FaFilter className="text-lg" />
            FILTERS
          </h2>
          <div className="flex items-center gap-2">
            {(selectedCategories.length > 0 ||
              selectedSubcategories.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-2 py-1 rounded cursor-pointer transition-colors border border-red-500/30"
                >
                  Clear All
                </button>
              )}
            <button
              className="md:hidden p-1 hover:text-red-400 transition-colors"
              onClick={() => setShowFilter(false)}
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {search && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-900/30 to-cyan-900/20 rounded-xl border border-cyan-700/30 backdrop-blur-sm">
            <p className="text-sm text-cyan-300 flex items-center gap-2">
              <FaSearch className="text-xs" />
              Search: "<span className="font-semibold">{search}</span>"
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
            </p>
          </div>
        )}

        {/* Active Filters */}
        {(selectedCategories.length > 0 || selectedSubcategories.length > 0) && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/10 rounded-xl border border-purple-700/30">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map(cat => (
                <span key={cat} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                  {cat}
                </span>
              ))}
              {selectedSubcategories.map(sub => (
                <span key={sub} className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded border border-pink-500/30">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-700/50 pb-2">CATEGORIES</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 group"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4 accent-cyan-500 rounded border-gray-600"
                  />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{category}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    ({products.filter(p => p.category === category).length})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-700/50 pb-2">SUB-CATEGORIES</h3>
            <div className="space-y-1">
              {subcategories.map((subcategory) => (
                <label
                  key={subcategory}
                  className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 group"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubcategories.includes(subcategory)}
                    onChange={() => handleSubcategoryChange(subcategory)}
                    className="w-4 h-4 accent-cyan-500 rounded border-gray-600"
                  />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{subcategory}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    ({products.filter(p => p.subcategory === subcategory).length})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Sort Options in Sidebar for Mobile */}
        <div className="md:hidden mt-6 pt-2 border-t border-gray-700/50">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">SORT BY</h3>
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="w-full bg-[#0a1517] border border-gray-600 hover:border-cyan-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <option value="relevant">Most Relevant</option>
            <option value="newest">Newest First</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* ================= Mobile Overlay ================= */}
      {showFilter && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setShowFilter(false)}
        />
      )}

      {/* ================= Main Content ================= */}
      <div className="flex-1 relative min-h-[calc(100vh-60px)] overflow-y-auto md:ml-[280px] lg:ml-[300px]">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Mobile Header */}
          <div className="md:hidden mb-4 mt-3 px-4">
            {/* Custom mobile title */}
            <div className="mb-3">
              <h1 className="text-xl font-bold">
                <span className="text-cyan-400">EXPLORE</span>
                <span className="text-white"> COLLECTIONS</span>
              </h1>
              <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mt-1"></div>
            </div>

            {search && (
              <div className="mb-2 bg-gradient-to-r from-cyan-900/15 to-blue-900/10 border border-cyan-700/20 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <FaSearch className="text-cyan-400 text-xs" />
                  <p className="text-cyan-300 text-xs truncate">"{search}"</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between bg-gradient-to-r from-[#0f1b1d] to-[#0a1517] border border-gray-700/30 rounded-lg p-2">
              <p className="text-gray-300 text-xs">
                <span className="text-cyan-400 font-bold">{filteredProducts.length}</span> products found
              </p>
              <div className="text-[10px] text-gray-400">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>

          {/* Mobile Filter Button - Compact for mobile */}
          <div className="md:hidden flex items-center justify-between mb-6 p-3 bg-gradient-to-r from-[#0f1b1d] to-[#0a1517] rounded-xl border border-gray-700/30 shadow-md">
            <button
              onClick={() => setShowFilter(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-400 px-3 py-2 rounded-lg transition-all duration-200 active:scale-95 group"
            >
              <FaFilter className="text-cyan-400 text-sm group-hover:scale-110 transition-transform" />
              <span className="font-medium text-white text-sm">Filters</span>
              <FaArrowRightToBracket className="text-cyan-400 text-xs group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="text-center min-w-[70px]">
              <div className="text-xl font-bold text-cyan-400">{filteredProducts.length}</div>
              <div className="text-[10px] text-gray-400">Items</div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-gradient-to-r from-[#0f1b1d] to-[#0a1517] p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <div className="flex-1">
              <Tittle text1="EXPLORE" text2="COLLECTIONS" />
              {search && (
                <p className="text-cyan-300 text-sm mt-2 flex items-center gap-2">
                  <FaSearch className="text-xs" />
                  Search results for: "<span className="font-semibold">{search}</span>"
                </p>
              )}
              <p className="text-gray-300 text-sm mt-1">
                Discover amazing products tailored for you
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{filteredProducts.length}</div>
                <div className="text-sm text-gray-400">Products Found</div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Sort By</label>
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  className="bg-[#0a1517] border border-gray-600 hover:border-cyan-500 text-white px-4 py-2 rounded-xl transition-colors min-w-[180px]"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="newest">Newest First</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">Loading Products...</h3>
              <p className="text-gray-400">Discovering amazing products for you</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            // Products Grid - Mobile: 2 columns, Desktop: same as before
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map((item, index) => (
                <div key={item._id} className="flex justify-center items-center transform hover:scale-[1.02] transition-transform duration-300">
                  <Card
                    id={item._id}
                    name={item.name}
                    price={item.price}
                    image={item.image1}
                    category={item.category}
                    index={index}
                  />
                </div>
              ))}
            </div>
          ) : (
            // No Products Found State
            <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-[#0f1b1d]/50 to-[#0a1517]/30 rounded-3xl border border-gray-700/30 backdrop-blur-sm">
              <div className="text-7xl mb-6 opacity-60">🔍</div>
              <h3 className="text-2xl font-bold text-gray-300 mb-3">
                {search ? "No matching products found" : "No products available"}
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                {search
                  ? `We couldn't find any products matching "${search}". Try different keywords or browse all categories.`
                  : "Check back later for new arrivals or try adjusting your filters."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-cyan-500/20"
                >
                  {search ? "Clear Search" : "Reset Filters"}
                </button>
                {search && (
                  <button
                    onClick={() => window.location.href = '/collections'}
                    className="border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    View All Products
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collections;