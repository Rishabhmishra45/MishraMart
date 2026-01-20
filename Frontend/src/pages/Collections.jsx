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
  const {
    showCartNotification,
    notificationProduct,
    setShowCartNotification,
  } = useCart();
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  // Available categories and subcategories from actual products
  const categories = [
    ...new Set(products.map((item) => item.category).filter(Boolean)),
  ];
  const subcategories = [
    ...new Set(products.map((item) => item.subcategory).filter(Boolean)),
  ];

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

  const activeFiltersCount =
    selectedCategories.length + selectedSubcategories.length;

  return (
    <div
      className="w-full min-h-screen flex pt-[60px] overflow-x-hidden pb-[92px]"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Cart Notification */}
      <CartNotification
        product={notificationProduct}
        isVisible={showCartNotification}
        onClose={handleCloseNotification}
      />

      {/* ================= Sidebar Filters ================= */}
      <div
        className={`fixed top-[65px] h-[calc(100vh-60px)]
          w-[82vw] sm:w-[62vw] md:w-[280px] lg:w-[300px]
          border-r p-5 pt-[28px]
          transition-transform duration-300 z-40 overflow-y-auto
          ${showFilter ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          shadow-2xl`}
        style={{
          background: "var(--bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <FaFilter className="text-sm opacity-90" />
              </span>
              <span className="truncate">Filters</span>
            </h2>
            <p className="text-xs sm:text-sm opacity-70 mt-1">
              Refine your results quickly
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs px-3 py-2 rounded-xl border transition active:scale-[0.98]"
                style={{
                  background: "color-mix(in oklab, var(--card) 80%, transparent)",
                  borderColor: "var(--border)",
                }}
              >
                Clear
              </button>
            )}
            <button
              className="md:hidden h-10 w-10 grid place-items-center rounded-xl border transition active:scale-[0.98]"
              onClick={() => setShowFilter(false)}
              style={{
                background:
                  "color-mix(in oklab, var(--card) 75%, transparent)",
                borderColor: "var(--border)",
              }}
              aria-label="Close filters"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {search && (
          <div
            className="mb-4 p-3 rounded-2xl border"
            style={{
              background:
                "color-mix(in oklab, var(--card) 78%, transparent)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-sm font-medium flex items-center gap-2">
              <FaSearch className="text-xs opacity-80" />
              <span className="truncate">
                Search: <span className="font-semibold">"{search}"</span>
              </span>
            </p>
            <p className="text-xs opacity-70 mt-1">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"} found
            </p>
          </div>
        )}

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div
            className="mb-4 p-3 rounded-2xl border"
            style={{
              background:
                "color-mix(in oklab, var(--card) 70%, transparent)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold">Active filters</h4>
              <span className="text-xs opacity-70">
                {activeFiltersCount} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCategories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{
                    background:
                      "color-mix(in oklab, var(--card) 85%, transparent)",
                    borderColor: "var(--border)",
                  }}
                >
                  {cat}
                </span>
              ))}
              {selectedSubcategories.map((sub) => (
                <span
                  key={sub}
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{
                    background:
                      "color-mix(in oklab, var(--card) 85%, transparent)",
                    borderColor: "var(--border)",
                  }}
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-4">
            <h3
              className="text-sm sm:text-base font-semibold mb-3 pb-2 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              Categories
            </h3>

            <div className="space-y-1.5">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-xl transition active:scale-[0.99]"
                  style={{
                    background: selectedCategories.includes(category)
                      ? "color-mix(in oklab, var(--card) 85%, transparent)"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                  <span className="truncate">{category}</span>
                  <span className="text-xs opacity-60 ml-auto">
                    ({products.filter((p) => p.category === category).length})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-4">
            <h3
              className="text-sm sm:text-base font-semibold mb-3 pb-2 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              Sub-categories
            </h3>

            <div className="space-y-1.5">
              {subcategories.map((subcategory) => (
                <label
                  key={subcategory}
                  className="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-xl transition active:scale-[0.99]"
                  style={{
                    background: selectedSubcategories.includes(subcategory)
                      ? "color-mix(in oklab, var(--card) 85%, transparent)"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSubcategories.includes(subcategory)}
                    onChange={() => handleSubcategoryChange(subcategory)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                  <span className="truncate">{subcategory}</span>
                  <span className="text-xs opacity-60 ml-auto">
                    (
                    {products.filter((p) => p.subcategory === subcategory)
                      .length}
                    )
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Sort Options in Sidebar for Mobile */}
        <div
          className="md:hidden mt-6 pt-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <h3 className="text-sm sm:text-base font-semibold mb-3">Sort by</h3>
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
            style={{
              background:
                "color-mix(in oklab, var(--card) 88%, transparent)",
              borderColor: "var(--border)",
            }}
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
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-30 md:hidden transition-opacity duration-300"
          onClick={() => setShowFilter(false)}
        />
      )}

      {/* ================= Main Content ================= */}
      <div className="flex-1 relative min-h-[calc(100vh-60px)] overflow-y-auto md:ml-[280px] lg:ml-[300px]">
        <div className="p-3 sm:p-6 lg:p-8">
          {/* Mobile Header */}
          <div className="md:hidden mb-4 mt-1 px-1">
            <div className="mb-3">
              <h1 className="text-lg sm:text-xl font-bold leading-tight">
                <span className="opacity-80">Explore</span>{" "}
                <span className="font-extrabold">Collections</span>
              </h1>
              <div
                className="h-1 w-10 rounded-full mt-2"
                style={{ background: "var(--accent)" }}
              />
            </div>

            {search && (
              <div
                className="mb-2 border rounded-xl p-2"
                style={{
                  background:
                    "color-mix(in oklab, var(--card) 78%, transparent)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FaSearch className="opacity-70 text-xs" />
                  <p className="text-xs truncate opacity-80">"{search}"</p>
                </div>
              </div>
            )}

            <div
              className="flex items-center justify-between border rounded-xl p-2"
              style={{
                background:
                  "color-mix(in oklab, var(--card) 78%, transparent)",
                borderColor: "var(--border)",
              }}
            >
              <p className="text-xs opacity-80">
                <span className="font-bold">{filteredProducts.length}</span>{" "}
                products
              </p>
              <div className="text-[10px] opacity-60">
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div
            className="md:hidden flex items-center justify-between mb-6 p-3 rounded-2xl border shadow-sm"
            style={{
              background:
                "color-mix(in oklab, var(--card) 80%, transparent)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setShowFilter(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl border transition active:scale-[0.98] flex items-center gap-2"
              style={{
                background:
                  "color-mix(in oklab, var(--card) 88%, transparent)",
                borderColor: "var(--border)",
              }}
            >
              <FaFilter className="text-sm opacity-80" />
              <span className="font-semibold text-sm">Filters</span>
              <FaArrowRightToBracket className="text-xs opacity-70" />
              {activeFiltersCount > 0 && (
                <span
                  className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    background:
                      "color-mix(in oklab, var(--card) 95%, transparent)",
                    borderColor: "var(--border)",
                  }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="text-center min-w-[70px]">
              <div className="text-lg font-extrabold">
                {filteredProducts.length}
              </div>
              <div className="text-[10px] opacity-60">Items</div>
            </div>
          </div>

          {/* Desktop Header */}
          <div
            className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 rounded-3xl border p-6 shadow-sm"
            style={{
              background:
                "color-mix(in oklab, var(--card) 85%, transparent)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex-1 min-w-0">
              <Tittle text1="EXPLORE" text2="COLLECTIONS" />
              {search && (
                <p className="opacity-80 text-sm mt-2 flex items-center gap-2 min-w-0">
                  <FaSearch className="text-xs opacity-70" />
                  <span className="truncate">
                    Search results for:{" "}
                    <span className="font-semibold">"{search}"</span>
                  </span>
                </p>
              )}
              <p className="opacity-70 text-sm mt-1">
                Discover amazing products tailored for you
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-extrabold">
                  {filteredProducts.length}
                </div>
                <div className="text-sm opacity-60">Products Found</div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm opacity-70">Sort by</label>
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  className="h-11 px-4 rounded-xl border transition focus:outline-none focus:ring-2 min-w-[190px]"
                  style={{
                    background:
                      "color-mix(in oklab, var(--bg) 92%, transparent)",
                    borderColor: "var(--border)",
                  }}
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
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-2 border-current border-t-transparent mb-4 opacity-80" />
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                Loading products...
              </h3>
              <p className="text-sm opacity-70">
                Finding the best picks for you
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-7">
              {filteredProducts.map((item, index) => (
                <div
                  key={item._id}
                  className="flex justify-center items-center transition-transform duration-200 hover:scale-[1.02]"
                >
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
            <div
              className="flex flex-col items-center justify-center py-16 sm:py-20 text-center rounded-3xl border"
              style={{
                background:
                  "color-mix(in oklab, var(--card) 78%, transparent)",
                borderColor: "var(--border)",
              }}
            >
              <div className="text-6xl sm:text-7xl mb-5 opacity-60">🔍</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                {search ? "No matching products found" : "No products available"}
              </h3>
              <p className="text-sm sm:text-base opacity-70 mb-6 max-w-md px-3">
                {search
                  ? `We couldn't find any products matching "${search}". Try different keywords or browse all categories.`
                  : "Check back later for new arrivals or try adjusting your filters."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={clearAllFilters}
                  className="min-h-[44px] px-7 py-3 rounded-2xl font-semibold transition active:scale-[0.98] border"
                  style={{
                    background:
                      "color-mix(in oklab, var(--card) 92%, transparent)",
                    borderColor: "var(--border)",
                  }}
                >
                  {search ? "Clear Search" : "Reset Filters"}
                </button>

                {search && (
                  <button
                    onClick={() => (window.location.href = "/collections")}
                    className="min-h-[44px] px-7 py-3 rounded-2xl font-semibold transition active:scale-[0.98] border opacity-90 hover:opacity-100"
                    style={{
                      background: "transparent",
                      borderColor: "var(--border)",
                    }}
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