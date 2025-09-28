import React, { useContext, useEffect } from 'react'
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import Registration from './pages/Registration'
import Home from './pages/Home'
import Login from './pages/Login'
import Nav from './components/Nav'
import { userDataContext } from './context/UserContext'
import About from './pages/About'
import Collections from './pages/Collections'
import Product from './pages/Product'
import Contact from './pages/Contact'

const App = () => {
  const { userData } = useContext(userDataContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userData && window.location.pathname === '/') {
      navigate('/signup')
    }
  }, [userData, navigate])

  return (
    <>
      {userData && <Nav />}

      <Routes>
        <Route
          path='/'
          element={
            userData ? <Home /> : <Navigate to="/signup" replace />
          }
        />

        <Route
          path='/login'
          element={
            userData ? <Navigate to="/" replace /> : <Login />
          }
        />

        <Route
          path='/signup'
          element={
            userData ? <Navigate to="/" replace /> : <Registration />
          }
        />

        <Route path="/about" element={<About />} />
        <Route path="/collection" element={<Collections />} />
        <Route path="/product" element={<Product />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  )
}

export default App