import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Add from './Pages/Add'
import Lists from './Pages/Lists'
import Login from './Pages/Login'
import Orders from './Pages/Orders'
import { useContext } from 'react'
import { adminDataContext } from './context/AdminContext'
import Nav from './components/Nav'
import Sidebar from './components/Sidebar'

const App = () => {
  let { adminData } = useContext(adminDataContext)
  
  return (
    <>
      {!adminData ? <Login /> : 
        <div className='bg-gradient-to-l from-[#141414] to-[#0c2025] text-white min-h-screen'>
          <Nav />
          <Sidebar />
          <div className="lg:ml-72 xl:ml-80 pt-16 lg:pt-20 min-h-screen overflow-y-auto">
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/add' element={<Add />} />
              <Route path='/lists' element={<Lists />} />
              <Route path='/login' element={<Login />} />
              <Route path='/orders' element={<Orders />} />
            </Routes>
          </div>
        </div>
      }
    </>
  )
}

export default App