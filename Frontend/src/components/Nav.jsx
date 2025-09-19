// Nav.jsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaSearch, FaUserCircle, FaHome, FaThLarge, FaInfoCircle, FaPhone } from 'react-icons/fa';
import { MdOutlineShoppingCart } from "react-icons/md";
import Logo from "../assets/logo.png";
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Nav = () => {
    const [cartItems, setCartItems] = useState(10);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { userData, setUserData } = useContext(userDataContext);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // ✅ Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchToggle = () => {
        setSearchOpen(!searchOpen);
        if (searchOpen) setSearchQuery('');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log("Searching for:", searchQuery);
            // ✅ Example navigate if needed
            // navigate(`/search?query=${searchQuery}`);
        }
    };

    // ✅ Logout function
    const handleLogout = () => {
        setUserData(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setIsDropdownOpen(false);
        navigate('/signup');
    };

    return (
        <>
            {/* ✅ Top Navbar */}
            <nav className="w-full bg-[#ecfafa] shadow-md fixed top-0 left-0 z-50 h-[60px] flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex items-center justify-between">

                        {/* Left - Logo */}
                        <div className="flex-shrink-0 flex items-center h-[190px]">
                            <img
                                className="max-h-[200px] h-full w-auto object-contain cursor-pointer select-none"
                                src={Logo}
                                alt="Logo"
                                draggable={false}
                                onClick={() => navigate("/")}
                            />
                        </div>

                        {/* ✅ Desktop Nav Links */}
                        <div className="hidden md:flex space-x-8 mx-4">
                            <a href="#home" className="text-gray-700 hover:text-[#00bcd4] font-medium">Home</a>
                            <a href="#collection" className="text-gray-700 hover:text-[#00bcd4] font-medium">Collection</a>
                            <a href="#about" className="text-gray-700 hover:text-[#00bcd4] font-medium">About</a>
                            <a href="#contact" className="text-gray-700 hover:text-[#00bcd4] font-medium">Contact</a>
                        </div>

                        {/* Right - Desktop Icons */}
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

                            {/* User Dropdown */}
                            <div className="relative" ref={dropdownRef}>
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
                                    <div className="absolute right-0 mt-2 w-40 bg-black text-white rounded-md shadow-lg p-2 space-y-2 z-50">
                                        {userData ? (
                                            <>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                                                >
                                                    LogOut
                                                </button>
                                                <a href="#orders" className="block px-3 py-2 rounded hover:bg-gray-700">
                                                    Orders
                                                </a>
                                                <a href="#about" className="block px-3 py-2 rounded hover:bg-gray-700">
                                                    About
                                                </a>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => navigate("/login")}
                                                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700"
                                            >
                                                Login
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Cart */}
                            <div className="relative">
                                <button className="text-gray-700 hover:text-[#00bcd4] p-2 relative">
                                    <MdOutlineShoppingCart className="text-2xl" />
                                    {cartItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#00bcd4] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                            {cartItems}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ✅ Mobile Right (only Search + User) */}
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

                            {/* User Dropdown */}
                            <div className="relative" ref={dropdownRef}>
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
                                    <div className="absolute right-0 mt-2 w-40 bg-black text-white rounded-md shadow-lg p-2 space-y-2 z-50">
                                        {userData ? (
                                            <>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                                                >
                                                    LogOut
                                                </button>
                                                <a href="#orders" className="block px-3 py-2 rounded hover:bg-gray-700">
                                                    Orders
                                                </a>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => navigate("/login")}
                                                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700"
                                            >
                                                Login
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ✅ Bottom Navigation (Mobile only) */}
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
