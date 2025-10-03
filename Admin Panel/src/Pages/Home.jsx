import React, { useState, useEffect, useContext } from 'react'
import LoginNotification from '../components/LoginNotification'
import { adminDataContext } from '../context/AdminContext'

const Home = () => {
  const [showLoginNotification, setShowLoginNotification] = useState(false)
  const { adminData } = useContext(adminDataContext)

  useEffect(() => {
    // Check if we should show login notification
    const shouldShowNotification = sessionStorage.getItem('showLoginNotification')
    
    if (shouldShowNotification && adminData) {
      setShowLoginNotification(true)
      sessionStorage.removeItem('showLoginNotification')
      
      // Auto hide after 4 seconds
      const timer = setTimeout(() => {
        setShowLoginNotification(false)
      }, 4000)
      
      return () => clearTimeout(timer)
    }
  }, [adminData])

  return (
    <div className="h-screen overflow-y-auto p-3 sm:p-4 lg:p-6">
      {/* Login Notification */}
      <LoginNotification 
        isVisible={showLoginNotification} 
        onClose={() => setShowLoginNotification(false)} 
      />
      
      {/* Your Home content - WITH DARK THEME */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Add your dashboard content here */}
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-2 text-white">Welcome to Admin Panel</h3>
            <p className="text-gray-400">Manage your products and orders from here.</p>
          </div>
          
          {/* Additional cards to match your original design */}
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-2 text-white">Total Products</h3>
            <p className="text-2xl font-bold text-blue-400">0</p>
            <p className="text-gray-400 text-sm mt-2">Manage your products</p>
          </div>
          
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-2 text-white">Pending Orders</h3>
            <p className="text-2xl font-bold text-green-400">0</p>
            <p className="text-gray-400 text-sm mt-2">View and manage orders</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home