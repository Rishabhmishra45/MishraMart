import React, { useContext, useEffect } from 'react'
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import Registration from './pages/Registration'
import Home from './pages/Home'
import Login from './pages/Login'
import Nav from './components/Nav'
import { userDataContext } from './context/UserContext'

const App = () => {
  const { userData } = useContext(userDataContext)
  const navigate = useNavigate()

  // Redirect to registration if not logged in and trying to access protected routes
  useEffect(() => {
    if (!userData && window.location.pathname === '/') {
      navigate('/signup')
    }
  }, [userData, navigate])

  return (
    <>
      {/* Only show Nav if user is logged in */}
      {userData && <Nav />}

      <Routes>
        {/* Protected route - redirect to signup if not authenticated */}
        <Route
          path='/'
          element={
            userData ? <Home /> : <Navigate to="/signup" replace />
          }
        />

        {/* If already logged in, redirect away from auth pages */}
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
      </Routes>
    </>
  )
}

export default App