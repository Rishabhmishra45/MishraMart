import React, { createContext } from 'react'

export const authDataContext = createContext()

function AuthContext({ children }) {
  const serverUrl = "http://localhost:8000"
  const value = { serverUrl }

  return (
    <authDataContext.Provider value={value}>
      {children}
    </authDataContext.Provider>
  )
}

export default AuthContext
