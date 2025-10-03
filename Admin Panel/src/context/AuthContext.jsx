import React, { createContext } from 'react'

export const authDataContext = createContext()

const AuthContext = ({ children }) => {

    let serverUrl = import.meta.env.VITE_SERVER_URL

    let value = {
        serverUrl
    }

    return (
        <authDataContext.Provider value={value}>
            {children}
        </authDataContext.Provider>
    )
}

export default AuthContext