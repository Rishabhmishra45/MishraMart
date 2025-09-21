import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Add from './Pages/Add'
import Lists from './Pages/Lists'
import Login from './Pages/Login'
import Orders from './Pages/Orders'
import { useContext } from 'react'
import { adminDataContext } from './context/AdminContext'

const App = () => {
  let { adminData } = useContext(adminDataContext)
  return (
    <>
      {!adminData ? <Login /> : <>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/add' element={<Add />} />
          <Route path='/lists' element={<Lists />} />
          <Route path='/login' element={<Login />} />
          <Route path='/orders' element={<Orders />} />
        </Routes>
      </>
      }
    </>
  )
}

export default App
