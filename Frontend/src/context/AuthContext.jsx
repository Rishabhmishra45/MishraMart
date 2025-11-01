import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const authDataContext = createContext();

function AuthContext({ children }) {
  // Environment variables se URL lo
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  
  console.log("Server URL:", serverUrl); 

  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // ✅ NEW: Track if auth check completed

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setAuthChecked(false); // ✅ Reset before checking
      
      if (!serverUrl) {
        console.error('Server URL not configured');
        setIsLoading(false);
        setAuthChecked(true);
        return;
      }

      const response = await axios.get(`${serverUrl}/api/user/getcurrentuser`, {
        withCredentials: true,
        timeout: 10000 // Reduced timeout for better UX
      });
      
      console.log("Auth check response:", response.data);
      
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('Auth check failed:', error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      setAuthChecked(true); // ✅ Mark auth check as completed
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // ✅ IMPROVED: Logout function
  const logout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/logout`, {}, {
        withCredentials: true,
        timeout: 5000
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ✅ IMPORTANT: Sabhi states clear karein
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true); // ✅ Ensure auth checked is true after logout
      
      // ✅ Additional: LocalStorage clear karein
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const value = { 
    serverUrl, 
    user,
    setUser,
    isAuthenticated, 
    setIsAuthenticated,
    isLoading,
    authChecked, // ✅ NEW: Export authChecked
    checkAuthStatus,
    login,
    logout
  };

  return (
    <authDataContext.Provider value={value}>
      {children}
    </authDataContext.Provider>
  );
}

export default AuthContext;