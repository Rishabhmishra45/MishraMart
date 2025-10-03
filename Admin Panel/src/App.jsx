import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { adminDataContext } from './context/AdminContext'
import Nav from './components/Nav'
import Sidebar from './components/Sidebar'
import Home from './Pages/Home'
import Add from './Pages/Add'
import Lists from './Pages/Lists'
import Orders from './Pages/Orders'
import Login from './Pages/Login'

const App = () => {
  const { adminData, isAdminLoggedIn, loading } = useContext(adminDataContext)

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {isAdminLoggedIn ? (
        // Show layout with Nav and Sidebar only when admin is logged in - WITH DARK THEME
        <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
          <Nav />
          <Sidebar />
          <main className="flex-1 lg:ml-72 xl:ml-80 mt-16 lg:mt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<Add />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      ) : (
        // Show only login page when no admin is logged in
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  )
}

export default App