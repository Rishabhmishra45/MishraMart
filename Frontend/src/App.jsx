import React, { useContext, useEffect, useState } from "react";
import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Registration from "./pages/Registration";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Nav from "./components/Nav";
import { userDataContext } from "./context/UserContext";
import About from "./pages/About";
import Collections from "./pages/Collections";
import Product from "./pages/Product";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Invoice from "./pages/Invoice";
import Chatbot from "./components/Chatbot";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Wishlist from './pages/Wishlist';
import { authDataContext } from "./context/AuthContext";

const App = () => {
  const { userData, loading, userChecked } = useContext(userDataContext);
  const { authChecked } = useContext(authDataContext); // ✅ Get authChecked from AuthContext
  const navigate = useNavigate();
  const location = useLocation();

  // Public routes - accessible without authentication
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password"
  ];

  const isPublicRoute = publicRoutes.includes(location.pathname);

  // ✅ IMPROVED: Only redirect when all checks are complete
  useEffect(() => {
    // Don't do anything if still checking authentication
    if (!authChecked || !userChecked || loading) {
      return;
    }

    // If user is not logged in and not on a public route, redirect to signup
    if (!userData && !isPublicRoute) {
      navigate("/signup", { replace: true });
    }

    // ✅ FIX: If user is logged in and on a public route, redirect to home
    if (userData && isPublicRoute) {
      navigate("/", { replace: true });
    }
  }, [userData, loading, isPublicRoute, navigate, authChecked, userChecked]);

  // ✅ IMPROVED: Show loading only when actually checking auth
  // Show loading if either auth check or user check is in progress
  if (loading || !authChecked || !userChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Show Nav only when user is logged in AND not on public routes */}
      {userData && !isPublicRoute && <Nav />}

      <Routes>
        {/* Public Routes - Only accessible when NOT logged in */}
        <Route
          path="/login"
          element={!userData ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!userData ? <Registration /> : <Navigate to="/" replace />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to="/" replace />}
        />
        <Route
          path="/reset-password"
          element={!userData ? <ResetPassword /> : <Navigate to="/" replace />}
        />

        {/* Protected Routes - Only accessible when logged in */}
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/signup" replace />}
        />
        <Route
          path="/about"
          element={
            userData ? <About /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/collections"
          element={
            userData ? <Collections /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/product"
          element={
            userData ? <Product /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/contact"
          element={
            userData ? <Contact /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/wishlist"
          element={
            userData ? <Wishlist /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/product/:id"
          element={
            userData ? <ProductDetail /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/cart"
          element={
            userData ? <Cart /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/place-order"
          element={
            userData ? <PlaceOrder /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/orders"
          element={
            userData ? <Orders /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/profile"
          element={
            userData ? <Profile /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/invoice/:orderId"
          element={
            userData ? <Invoice /> : <Navigate to="/login" replace />
          }
        />

        {/* Catch all route - redirect to appropriate page */}
        <Route
          path="*"
          element={
            userData ?
              <Navigate to="/" replace /> :
              <Navigate to="/signup" replace />
          }
        />
      </Routes>

      {/* Add Chatbot Component - Only show when user is logged in */}
      {userData && !isPublicRoute && <Chatbot />}
    </>
  );
};

export default App;