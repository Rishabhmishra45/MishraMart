import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Add from './Pages/Add'
import Lists from './Pages/Lists'
import Login from './Pages/Login'
import Orders from './Pages/Orders'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/add' element={<Add />} />
        <Route path='/lists' element={<Lists />} />
        <Route path='/login' element={<Login />} />
        <Route path='/orders' element={<Orders />} />
      </Routes>
    </>
  )
}

export default App
