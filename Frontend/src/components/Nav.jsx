import React, { useContext, useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaUserCircle,
  FaHome,
  FaThLarge,
  FaInfoCircle,
  FaPhone,
} from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";
import Logo from "../assets/newLogo.png";
import { userDataContext } from "../context/UserContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { shopDataContext } from "../context/ShopContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

// ✅ NEW
import ThemeToggle from "./ThemeToggle";

const Nav = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { search, setSearch } = useContext(shopDataContext);
  const { userData, setUserData } = useContext(userDataContext);
  const { serverUrl, logout } = useAuth();

  const { getCartItemsCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartItemsCount = getCartItemsCount();
  const wishlistCount = getWishlistCount(); // (if you want show badge later)

  const navigate = useNavigate();
  const location = useLocation();

  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (userData) {
      const savedImage = localStorage.getItem(`userProfileImage_${userData.id}`);
      if (savedImage) setProfileImage(savedImage);
    }
  }, [userData]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (userData) {
        const savedImage = localStorage.getItem(
          `userProfileImage_${userData.id}`
        );
        setProfileImage(savedImage);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inDesktop =
        desktopDropdownRef.current &&
        desktopDropdownRef.current.contains(event.target);
      const inMobile =
        mobileDropdownRef.current &&
        mobileDropdownRef.current.contains(event.target);

      if (inDesktop || inMobile) return;
      setIsDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);

    if (!searchOpen && location.pathname !== "/collections") {
      navigate("/collections");
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) searchInput.focus();
      }, 100);
    }

    if (searchOpen) {
      setSearchQuery("");
      setSearch("");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearch(searchQuery);
      if (location.pathname !== "/collections") navigate("/collections");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearch(value);

    if (value.trim() && location.pathname !== "/collections") {
      navigate("/collections");
    }
  };

  const handleSearchInputClick = () => {
    if (location.pathname !== "/collections") navigate("/collections");
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${serverUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      setUserData(null);
      setIsDropdownOpen(false);
      logout();
      if (userData) localStorage.removeItem(`userProfileImage_${userData.id}`);
      localStorage.removeItem("cart");
      setProfileImage(null);
      navigate("/");
    }
  };

  const handleDropdownAction = (action) => {
    switch (action) {
      case "logout":
        handleLogout();
        break;
      case "orders":
        navigate("/orders");
        setIsDropdownOpen(false);
        break;
      case "profile":
        navigate("/profile");
        setIsDropdownOpen(false);
        break;
      case "wishlist":
        navigate("/wishlist");
        setIsDropdownOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <nav
        className="w-full fixed top-0 left-0 z-50 h-[60px] flex items-center select-none pointer-events-auto
        border-b border-[color:var(--border)] shadow-md isolation-isolate"
        style={{
          background: "var(--nav-bg)", // ensures navbar never looks transparent
          color: "var(--text)",
        }}
      >
        {/* subtle overlay for stronger contrast */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklab, var(--nav-bg) 92%, transparent), var(--nav-bg))",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <div className="flex-shrink-0 flex items-center h-[60px] w-[120px] sm:w-[140px] lg:w-[170px] overflow-hidden">
              <img
                className="h-full w-auto object-contain cursor-pointer select-none
               scale-[2.2] sm:scale-[2.5] lg:scale-[2.8] origin-left
               transition-transform duration-300 hover:scale-[2.4] sm:hover:scale-[2.7] lg:hover:scale-[3]"
                src={Logo}
                alt="Logo"
                draggable={false}
                onClick={() => navigate("/")}
              />
            </div>


            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 mx-4">
              <Link
                to="/"
                className="font-semibold text-sm lg:text-base hover:text-cyan-500 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/collections"
                className="font-semibold text-sm lg:text-base hover:text-cyan-500 transition-colors"
              >
                Collection
              </Link>
              <Link
                to="/about"
                className="font-semibold text-sm lg:text-base hover:text-cyan-500 transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="font-semibold text-sm lg:text-base hover:text-cyan-500 transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Right Side (Desktop) */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Search */}
              <div className="flex items-center">
                {searchOpen ? (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center rounded-full border border-[color:var(--border)]
                    bg-[color:var(--surface)] shadow-sm"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onClick={handleSearchInputClick}
                      placeholder="Search products..."
                      className="py-2 px-3 w-44 lg:w-56 outline-none text-sm rounded-l-full
                      bg-transparent text-[color:var(--text)] placeholder:text-[color:var(--muted)]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="min-h-[40px] px-2 hover:text-cyan-500 transition-colors"
                      title="Search"
                    >
                      <FaSearch />
                    </button>
                    <button
                      type="button"
                      className="min-h-[40px] pr-3 text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
                      onClick={handleSearchToggle}
                      aria-label="Close search"
                    >
                      &times;
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={handleSearchToggle}
                    className="min-h-[44px] min-w-[44px] grid place-items-center rounded-xl hover:bg-[color:var(--surface-2)] transition"
                    title="Search"
                    type="button"
                  >
                    <FaSearch className="text-xl" />
                  </button>
                )}
              </div>

              {/* User Dropdown (Desktop) */}
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="min-h-[44px] px-2 rounded-xl hover:bg-[color:var(--surface-2)] transition flex items-center gap-2"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                >
                  {!userData ? (
                    <div
                      className="group border rounded-xl px-3 py-2 flex items-center gap-2 transition-all duration-300 cursor-pointer
                      border-[color:var(--border)] bg-[color:var(--surface)]
                      hover:bg-[color:var(--surface-2)]"
                    >
                      <FaUserCircle className="text-xl text-[color:var(--muted)] group-hover:text-cyan-500" />
                      <span className="text-sm font-semibold">Login</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-[36px] h-[36px] rounded-full flex items-center justify-center cursor-pointer overflow-hidden
                        border border-[color:var(--border)] bg-[color:var(--surface)]"
                      >
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {userData?.name?.slice(0, 1)?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-semibold hidden lg:block max-w-[120px] truncate">
                        {userData?.name?.split(" ")[0]}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl p-2 space-y-1 z-[9999] bg-white dark:bg-[#162327] text-gray-900 dark:text-white"
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    role="menu"
                  >
                    {userData ? (
                      <>
                        <div className="px-3 py-2 text-sm border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-500 dark:text-gray-400">
                            Hello,
                          </span>{" "}
                          <span className="font-semibold truncate inline-block max-w-[160px] align-bottom">
                            {userData.name}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDropdownAction("orders")}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          My Orders
                        </button>

                        <button
                          onClick={() => handleDropdownAction("wishlist")}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          My Wishlist{" "}
                          {wishlistCount > 0 && (
                            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">
                              {wishlistCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => handleDropdownAction("profile")}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          My Profile
                        </button>

                        <button
                          onClick={() => handleDropdownAction("logout")}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                          type="button"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigate("/login");
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            navigate("/signup");
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          Sign Up
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <div className="relative">
                <button
                  className="min-h-[44px] min-w-[44px] grid place-items-center rounded-xl hover:bg-[color:var(--surface-2)] transition relative"
                  onClick={() => navigate("/cart")}
                  title="Cart"
                  type="button"
                >
                  <MdOutlineShoppingCart className="text-2xl" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-cyan-500 text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs font-extrabold">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Right */}
            <div className="flex md:hidden items-center gap-2">
              {/* Theme */}
              <ThemeToggle />

              {/* Search */}
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center rounded-full border border-[color:var(--border)]
                  bg-[color:var(--surface)] shadow-sm"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClick={handleSearchInputClick}
                    placeholder="Search..."
                    className="py-2 px-3 w-28 outline-none text-sm rounded-l-full
                    bg-transparent text-[color:var(--text)] placeholder:text-[color:var(--muted)]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="min-h-[40px] px-2 hover:text-cyan-500 transition-colors"
                    aria-label="Search"
                  >
                    <FaSearch />
                  </button>
                  <button
                    type="button"
                    className="min-h-[40px] pr-2 text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
                    onClick={handleSearchToggle}
                    aria-label="Close search"
                  >
                    &times;
                  </button>
                </form>
              ) : (
                <button
                  onClick={handleSearchToggle}
                  className="min-h-[44px] min-w-[44px] grid place-items-center rounded-xl hover:bg-[color:var(--surface-2)] transition"
                  type="button"
                  aria-label="Open search"
                >
                  <FaSearch className="text-xl" />
                </button>
              )}

              {/* User Dropdown */}
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="min-h-[44px] min-w-[44px] grid place-items-center rounded-xl hover:bg-[color:var(--surface-2)] transition"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                >
                  {!userData ? (
                    <FaUserCircle className="text-2xl cursor-pointer" />
                  ) : (
                    <div className="w-[34px] h-[34px] rounded-full overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)]">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {userData?.name?.slice(0, 1)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  )}
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl p-2 space-y-1 z-[9999] bg-white dark:bg-[#162327] text-gray-900 dark:text-white"
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    role="menu"
                  >
                    {userData ? (
                      <>
                        <div className="px-3 py-2 text-sm border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-500 dark:text-gray-400">
                            Hello,
                          </span>{" "}
                          <span className="font-semibold truncate inline-block max-w-[160px] align-bottom">
                            {userData.name}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDropdownAction("orders")}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          My Orders
                        </button>

                        <button
                          onClick={() => handleDropdownAction("wishlist")}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          My Wishlist{" "}
                          {wishlistCount > 0 && (
                            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">
                              {wishlistCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => handleDropdownAction("profile")}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          My Profile
                        </button>

                        <button
                          onClick={() => handleDropdownAction("logout")}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                          type="button"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigate("/login");
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          Login
                        </button>

                        <button
                          onClick={() => {
                            navigate("/signup");
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                          type="button"
                        >
                          Sign Up
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile only) */}
      <div
        className="fixed bottom-0 left-0 w-full z-50 md:hidden border-t border-[color:var(--border)] shadow-[0_-6px_30px_rgba(0,0,0,0.08)]"
        style={{
          background: "var(--nav-bg)",
          color: "var(--text)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => navigate("/")}
            className="min-w-[68px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl hover:text-cyan-500 transition"
            type="button"
          >
            <FaHome className="text-xl" />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          <Link
            to="/collections"
            className="min-w-[68px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl hover:text-cyan-500 transition"
          >
            <FaThLarge className="text-xl" />
            <span className="text-[11px] font-medium">Collection</span>
          </Link>

          <Link
            to="/about"
            className="min-w-[68px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl hover:text-cyan-500 transition"
          >
            <FaInfoCircle className="text-xl" />
            <span className="text-[11px] font-medium">About</span>
          </Link>

          <Link
            to="/contact"
            className="min-w-[68px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl hover:text-cyan-500 transition"
          >
            <FaPhone className="text-xl" />
            <span className="text-[11px] font-medium">Contact</span>
          </Link>

          <button
            onClick={() => navigate("/cart")}
            className="relative min-w-[68px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl hover:text-cyan-500 transition"
            type="button"
          >
            <MdOutlineShoppingCart className="text-xl" />
            <span className="text-[11px] font-medium">Cart</span>
            {cartItemsCount > 0 && (
              <span className="absolute top-1 right-5 bg-cyan-500 text-white rounded-full min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-extrabold">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Nav;