import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import { createContext } from 'react'
import { authDataContext } from './AuthContext'

export const adminDataContext = createContext()
const AdminContext = ({ children }) => {
    let [adminData, setAdminData] = useState(null)
    let [loading, setLoading] = useState(true) // Add loading state
    let { serverUrl } = useContext(authDataContext)

    const getAdmin = async () => {
        try {
            setLoading(true)
            let result = await axios.get(serverUrl + "/api/user/getadmin",
                { withCredentials: true })

            setAdminData(result.data)
            console.log("Admin data:", result.data)
        } catch (error) {
            setAdminData(null)
            console.log("Admin error:", error)
        } finally {
            setLoading(false)
        }
    }

    const clearAdmin = () => {
        setAdminData(null)
        setLoading(false)
    }

    useEffect(() => {
        getAdmin()
    }, [])

    // Check if admin is actually logged in
    const isAdminLoggedIn = adminData && adminData.success && adminData.email

    let value = {
        adminData, 
        setAdminData, 
        getAdmin,
        clearAdmin,
        isAdminLoggedIn,
        loading
    }

    return (
        <div>
            <adminDataContext.Provider value={value}>
                {children}
            </adminDataContext.Provider>
        </div>
    )
}

export default AdminContext