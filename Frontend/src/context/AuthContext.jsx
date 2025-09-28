import React, { createContext } from 'react'

// Context create
export const authDataContext = createContext()

function AuthContext({ children }) {
  // take the URL from env; fallback to localhost if undefined
  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"
  const value = { serverUrl }

  return (
    <authDataContext.Provider value={value}>
      {children}
    </authDataContext.Provider>
  )
}

export default AuthContext