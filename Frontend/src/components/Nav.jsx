import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaSearch, FaUserCircle, FaHome, FaThLarge, FaInfoCircle, FaPhone } from 'react-icons/fa';
import { MdOutlineShoppingCart } from "react-icons/md";
import Logo from "../assets/logo.png";
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from "react-router-dom";
import { authDataContext } from '../context/AuthContext';

const Nav = () => {
  const [cartItems, setCartItems] = useState(10);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { userData, setUserData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  //  Separate refs for Desktop & Mobile dropdowns
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  //  Close dropdown when clicked outside (fix for desktop issue)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // agar click desktop ya mobile dropdown ke andar hai → ignore
      if (
        (desktopDropdownRef.current && desktopDropdownRef.current.contains(event.target)) ||
        (mobileDropdownRef.current && mobileDropdownRef.current.contains(event.target))
      ) {
        return;
      }
      // otherwise dropdown band ho jaye
      setIsDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //  Toggle search box open/close
  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) setSearchQuery('');
  };

  //  Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // navigate(`/search?query=${searchQuery}`);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      setUserData(null);
      setIsDropdownOpen(false);
      navigate('/signup');
    }
  };

  // Handle dropdown actions
  const handleDropdownAction = (action) => {
    if (action === 'logout') {
      handleLogout();
    } else if (action === 'orders') {
      navigate('/orders');
      setIsDropdownOpen(false);
    } else if (action === 'profile') {
      navigate('/profile');
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="w-full bg-[#ecfafa] shadow-md fixed top-0 left-0 z-50 h-[60px] flex items-center select-none pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between">

            {/* Left - Logo */}
            <div className="flex-shrink-0 flex items-center h-[150px]">
              <img
                className="max-h-[180px] h-full w-auto object-contain cursor-pointer select-none"
                src={Logo}
                alt="Logo"
                draggable={false}
                onClick={() => navigate("/")}
              />
            </div>


            {/* Desktop Nav Links */}
            <div className="hidden md:flex space-x-8 mx-4">
              <Link to="/" className="text-gray-700 hover:text-[#00bcd4] font-medium">Home</Link>
              <Link to="/collection" className="text-gray-700 hover:text-[#00bcd4] font-medium">Collection</Link>
              <Link to="/about" className="text-gray-700 hover:text-[#00bcd4] font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-[#00bcd4] font-medium">Contact</Link>
            </div>


            {/* Right Side (Desktop) */}
            <div className="hidden md:flex items-center space-x-6">

              {/* Search */}
              <div className="flex items-center">
                {searchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full shadow-sm">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="py-1 px-3 w-40 outline-none text-sm"
                      autoFocus
                    />
                    <button type="submit" className="p-2 text-gray-700 hover:text-[#00bcd4]">
                      <FaSearch />
                    </button>
                    <button
                      type="button"
                      className="pr-2 text-gray-500 hover:text-gray-700"
                      onClick={handleSearchToggle}
                    >
                      &times;
                    </button>
                  </form>
                ) : (
                  <button onClick={handleSearchToggle} className="text-gray-700 hover:text-[#00bcd4] p-2">
                    <FaSearch className="text-2xl" />
                  </button>
                )}
              </div>

              {/* User Dropdown (Desktop) */}
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-700 hover:text-[#00bcd4] p-2"
                >
                  {!userData ? (
                    <FaUserCircle className="text-2xl cursor-pointer" />
                  ) : (
                    <div className="w-[30px] h-[30px] bg-[#080808] text-white rounded-full flex items-center justify-center cursor-pointer">
                      {userData?.name?.slice(0, 1) || 'U'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black text-white rounded-md shadow-lg p-2 space-y-2 z-50">
                    {userData ? (
                      <>
                        <div className="px-3 py-2 text-sm border-b border-gray-700">
                          Hello, {userData.name}
                        </div>
                        <button
                          onClick={() => handleDropdownAction('orders')}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                          Orders
                        </button>
                        <button
                          onClick={() => handleDropdownAction('profile')}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleDropdownAction('logout')}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
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
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            navigate("/signup");
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
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
                  className="text-gray-700 hover:text-[#00bcd4] p-2 relative"
                  onClick={() => navigate("/cart")}
                >
                  <MdOutlineShoppingCart className="text-2xl" />
                  {cartItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#00bcd4] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cartItems}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/*  Mobile Right (Search + User) */}
            <div className="flex md:hidden items-center space-x-4">

              {/* Search */}
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full shadow-sm">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="py-1 px-3 w-32 outline-none text-sm"
                    autoFocus
                  />
                  <button type="submit" className="p-2 text-gray-700 hover:text-[#00bcd4]">
                    <FaSearch />
                  </button>
                  <button
                    type="button"
                    className="pr-2 text-gray-500 hover:text-gray-700"
                    onClick={handleSearchToggle}
                  >
                    &times;
                  </button>
                </form>
              ) : (
                <button onClick={handleSearchToggle} className="text-gray-700 hover:text-[#00bcd4] p-2">
                  <FaSearch className="text-2xl" />
                </button>
              )}

              {/*  User Dropdown (Mobile) */}
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-700 hover:text-[#00bcd4] p-2"
                >
                  {!userData ? (
                    <FaUserCircle className="text-2xl cursor-pointer" />
                  ) : (
                    <div className="w-[30px] h-[30px] bg-[#080808] text-white rounded-full flex items-center justify-center cursor-pointer">
                      {userData?.name?.slice(0, 1) || 'U'}
                    </div>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black text-white rounded-md shadow-lg p-2 space-y-2 z-50">
                    {userData ? (
                      <>
                        <div className="px-3 py-2 text-sm border-b border-gray-700">
                          Hello, {userData.name}
                        </div>
                        <button
                          onClick={() => handleDropdownAction('orders')}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                          Orders
                        </button>
                        <button
                          onClick={() => handleDropdownAction('profile')}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleDropdownAction('logout')}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
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
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            navigate("/signup");
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
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

      {/*  Bottom Navigation (Mobile only) */}
      <div className="fixed bottom-0 left-0 w-full bg-[#ecfafa] shadow-md z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          <button onClick={() => navigate("/")} className="flex flex-col items-center text-gray-700 hover:text-[#00bcd4]">
            <FaHome className="text-xl" />
            <span className="text-xs">Home</span>
          </button>
          <a href="#collection" className="flex flex-col items-center text-gray-700 hover:text-[#00bcd4]">
            <FaThLarge className="text-xl" />
            <span className="text-xs">Collection</span>
          </a>
          <a href="#about" className="flex flex-col items-center text-gray-700 hover:text-[#00bcd4]">
            <FaInfoCircle className="text-xl" />
            <span className="text-xs">About</span>
          </a>
          <a href="#contact" className="flex flex-col items-center text-gray-700 hover:text-[#00bcd4]">
            <FaPhone className="text-xl" />
            <span className="text-xs">Contact</span>
          </a>
          <button onClick={() => navigate("/cart")} className="relative flex flex-col items-center text-gray-700 hover:text-[#00bcd4]">
            <MdOutlineShoppingCart className="text-xl" />
            <span className="text-xs">Cart</span>
            {cartItems > 0 && (
              <span className="absolute -top-1 right-2 bg-[#00bcd4] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                {cartItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Nav;
