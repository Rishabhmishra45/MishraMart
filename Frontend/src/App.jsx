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

  const isPublicRoute = publicRoutes.includes(location.pathname);

  // App initialization - prevent flash
  useEffect(() => {
    const initializeApp = async () => {
      // Wait for all auth and user checks to complete
      if (authChecked && userChecked && !loading) {
        setTimeout(() => {
          setAppReady(true);
        }, 100);
      }
    };

    initializeApp();
  }, [authChecked, userChecked, loading]);

  // Redirect logic
  useEffect(() => {
    if (!appReady) return;

    if (!userData && !isPublicRoute) {
      navigate("/signup", { replace: true });
    }

    if (userData && isPublicRoute) {
      navigate("/", { replace: true });
    }
  }, [userData, appReady, isPublicRoute, navigate]);

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