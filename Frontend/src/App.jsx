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
  const { authChecked } = useContext(authDataContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [appReady, setAppReady] = useState(false);

  // Public routes - accessible without authentication
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password"
  ];

  // Protected routes - require login for checkout and personal pages
  const protectedRoutes = [
    "/place-order",
    "/orders",
    "/profile",
    "/invoice"
  ];

  const isPublicRoute = publicRoutes.includes(location.pathname);
  const isProtectedRoute = protectedRoutes.includes(location.pathname);

  // App initialization - prevent flash
  useEffect(() => {
    const initializeApp = async () => {
      if (authChecked && userChecked && !loading) {
        setTimeout(() => {
          setAppReady(true);
        }, 100);
      }
    };

    initializeApp();
  }, [authChecked, userChecked, loading]);

  // Redirect logic - FIXED: Only redirect if not on public routes
  useEffect(() => {
    if (!appReady) return;

    // If user tries to access protected routes without login
    if (!userData && isProtectedRoute) {
      navigate("/login", { 
        replace: true,
        state: { from: location.pathname }
      });
      return;
    }

    // If logged-in user tries to access public routes (login, signup)
    if (userData && isPublicRoute) {
      navigate("/", { replace: true });
      return;
    }

    // If user is not logged in and tries to access root path, let them see home page
    // No automatic redirect to signup
  }, [userData, appReady, isPublicRoute, isProtectedRoute, navigate, location]);

  // Show loading only when app is not ready
  if (!appReady) {
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
      {/* Show Nav always - for both logged in and guest users */}
      <Nav />

      <Routes>
        {/* Public Routes - Accessible to all */}
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

        {/* Public Pages - Accessible without login */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/product" element={<Product />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Protected Routes - Require login */}
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

        {/* Catch all route */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      {/* Add Chatbot Component - Only show when user is logged in */}
      {userData && <Chatbot />}
    </>
  );
};

export default App;