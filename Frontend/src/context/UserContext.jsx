import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext";
import axios from "axios";

export const userDataContext = createContext();

const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userChecked, setUserChecked] = useState(false); // ✅ NEW: Track if user check completed
  const { serverUrl, isAuthenticated, user, authChecked } = useContext(authDataContext);

  // fetch current user from backend - UPDATED
  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const result = await axios.get(`${serverUrl}/api/user/getcurrentuser`, {
        withCredentials: true,
      });

      console.log("User API Response:", result.data);

      if (result.data.success) {
        setUserData(result.data.user);
        console.log("Current User:", result.data.user);
      } else {
        setUserData(null);
        console.error("getCurrentUser error:", result.data.message);
      }
    } catch (error) {
      setUserData(null);
      console.error(
        "getCurrentUser error:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
      setUserChecked(true); // ✅ Mark user check as completed
    }
  };

  useEffect(() => {
    // ✅ Wait for auth check to complete first
    if (!authChecked) return;

    if (user) {
      // If we have user from AuthContext, use it directly
      setUserData(user);
      setLoading(false);
      setUserChecked(true);
    } else {
      // Otherwise fetch from API
      getCurrentUser();
    }
  }, [user, authChecked]); // ✅ Add authChecked as dependency

  const value = {
    userData,
    setUserData,
    getCurrentUser,
    loading,
    userChecked, // ✅ NEW: Export userChecked
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContextProvider;