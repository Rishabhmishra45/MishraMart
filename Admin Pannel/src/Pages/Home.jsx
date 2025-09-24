import React from 'react'
import Nav from "../components/Nav"
import Sidebar from '../components/Sidebar'

const Home = () => {
  return (
    <div className='bg-gradient-to-l from-[#141414] to-[#0c2025] text-white min-h-screen'>
      <Nav />
      <Sidebar />
      <div className="lg:ml-72 xl:ml-80 pt-16 lg:pt-20 h-screen overflow-y-auto p-3 sm:p-4 lg:p-6">
        {/* Your Home content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Add your dashboard content here */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home