import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const authDataContext = createContext();

function AuthContext({ children }) {
  // Environment variables se URL lo
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  
  console.log("Server URL:", serverUrl); // Debugging ke liye

  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      if (!serverUrl) {
        console.error('Server URL not configured');
        return;
      }

      const response = await axios.get(`${serverUrl}/api/user/getcurrentuser`, {
        withCredentials: true,
        timeout: 15000 // Production ke liye thoda zyada timeout
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
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/logout`, {}, {
        withCredentials: true,
        timeout: 10000
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = { 
    serverUrl, 
    user,
    setUser,
    isAuthenticated, 
    setIsAuthenticated,
    isLoading,
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