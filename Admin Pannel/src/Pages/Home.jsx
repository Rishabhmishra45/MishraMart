import React from 'react'

const Home = () => {
  return (
    <div className="h-screen overflow-y-auto p-3 sm:p-4 lg:p-6">
      {/* Your Home content */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Add your dashboard content here */}
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-2">Welcome to Admin Panel</h3>
            <p className="text-gray-400">Manage your products and orders from here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home