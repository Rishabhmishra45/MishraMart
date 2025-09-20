import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext";
import axios from "axios";

export const userDataContext = createContext();

const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const { serverUrl } = useContext(authDataContext);

  // fetch current user from backend
  const getCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/getcurrentuser`, {
        withCredentials: true, // very important for cookie-based auth
      });

      setUserData(result.data);
      console.log("Current User:", result.data);
    } catch (error) {
      // if 401 or any error, clear user
      setUserData(null);
      console.error(
        "getCurrentUser error:",
        error.response?.data?.message || error.message
      );
    }
  };

  // run once on mount
  useEffect(() => {
    getCurrentUser();
  }, []);

  const value = {
    userData,
    setUserData,
    getCurrentUser,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContextProvider;
