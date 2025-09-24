import React from 'react'
import Nav from "../components/Nav"
import Sidebar from '../components/Sidebar'

const Home = () => {
  return (
    <div className='bg-gradient-to-l from-[#141414] to-[#0c2025] text-white min-h-screen'>
      <Nav />
      <Sidebar />
      <div className="ml-64 lg:ml-72 xl:ml-80 pt-20 h-[calc(100vh-5rem)] overflow-y-auto p-4">
        {/* your Home content */}
      </div>
    </div>
  )
}

export default Home
