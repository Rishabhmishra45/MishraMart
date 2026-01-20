import React, { createContext } from "react";

export const authDataContext = createContext();

const AuthContext = ({ children }) => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const value = {
    serverUrl,
  };

  return <authDataContext.Provider value={value}>{children}</authDataContext.Provider>;
};

export default AuthContext;
