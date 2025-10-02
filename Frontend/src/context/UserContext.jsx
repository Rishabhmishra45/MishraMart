import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext";
import axios from "axios";

export const userDataContext = createContext();

const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { serverUrl, isAuthenticated, user } = useContext(authDataContext);

  // fetch current user from backend - UPDATED
  const getCurrentUser = async () => {
    try {
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
    }
  };

  useEffect(() => {
    if (user) {
      // If we have user from AuthContext, use it directly
      setUserData(user);
      setLoading(false);
    } else {
      // Otherwise fetch from API
      getCurrentUser();
    }
  }, [user]);

  const value = {
    userData,
    setUserData,
    getCurrentUser,
    loading,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContextProvider;