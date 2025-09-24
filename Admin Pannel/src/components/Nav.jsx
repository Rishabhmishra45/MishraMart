import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import { authDataContext } from '../context/AuthContext';
import { adminDataContext } from '../context/AdminContext';

const Nav = () => {
  const navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);
  const { getAdmin } = useContext(adminDataContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logOut = async () => {
    try {
      setIsLoggingOut(true);
      const result = await axios.get(serverUrl + '/api/auth/logout', {
        withCredentials: true,
      });
      console.log(result.data);
      getAdmin();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="w-full h-16 lg:h-20 bg-white/95 backdrop-blur-sm fixed top-0 left-0 z-50 shadow-lg border-b border-gray-200">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section - Left - Only show logo on mobile */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="Company Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 lg:h-12 lg:w-12 object-contain transition-transform group-hover:scale-105"
            />
          </div>
          
          {/* Brand Name - Hidden on mobile, show from sm breakpoint */}
          <div className="hidden sm:block">
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-600 hidden lg:block">Product Management</p>
          </div>
        </div>

        {/* Mobile Title - Centered - Show only on mobile */}
        <div className="sm:hidden absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">Admin Panel</h1>
        </div>

        {/* Logout Button - Right */}
        <button
          onClick={logOut}
          disabled={isLoggingOut}
          className={`
            relative flex items-center gap-2 
            px-4 sm:px-5 lg:px-6 py-2 
            rounded-xl
            font-medium 
            text-sm lg:text-base
            transition-all duration-300
            transform hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            shadow-md
            ${isLoggingOut 
              ? 'bg-gray-500 text-white' 
              : 'bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white'
            }
          `}
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Logging Out</span>
              <span className="sm:hidden">Logging Out</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Logout</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Nav;