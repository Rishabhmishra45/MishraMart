import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext";

export const adminDataContext = createContext();

const AdminContext = ({ children }) => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { serverUrl } = useContext(authDataContext);

  const getAdmin = async () => {
    try {
      setLoading(true);

      if (!serverUrl) {
        console.warn("⚠️ VITE_SERVER_URL missing in admin panel env");
        setAdminData(null);
        return;
      }

      const result = await axios.get(`${serverUrl}/api/user/getadmin`, {
        withCredentials: true,
      });

      setAdminData(result.data);
      // console.log("Admin data:", result.data);
    } catch (error) {
      setAdminData(null);
      console.log("Admin error:", error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAdmin = () => {
    setAdminData(null);
    setLoading(false);
  };

  useEffect(() => {
    getAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl]);

  const isAdminLoggedIn = adminData && adminData.success && adminData.email;

  const value = {
    adminData,
    setAdminData,
    getAdmin,
    clearAdmin,
    isAdminLoggedIn,
    loading,
  };

  return <adminDataContext.Provider value={value}>{children}</adminDataContext.Provider>;
};

export default AdminContext;
