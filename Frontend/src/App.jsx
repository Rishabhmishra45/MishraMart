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
import Wishlist from "./pages/Wishlist";
import { authDataContext } from "./context/AuthContext";

const App = () => {
  const { userData, userChecked } = useContext(userDataContext);
  const { authChecked } = useContext(authDataContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [appReady, setAppReady] = useState(false);

  // Public routes
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  const protectedRoutes = [
    "/place-order",
    "/orders",
    "/profile",
    "/invoice",
  ];

  const isPublicRoute =
    publicRoutes.includes(location.pathname);

  const isProtectedRoute =
    protectedRoutes.includes(location.pathname);

  useEffect(() => {
    if (authChecked && userChecked) {
      setTimeout(() => setAppReady(true), 50);
    }
  }, [authChecked, userChecked]);

  useEffect(() => {
    if (!appReady) return;

    // 🔒 Not logged in → trying protected route
    if (!userData && isProtectedRoute) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    // 🔓 Logged in → trying auth pages
    if (
      userData &&
      isPublicRoute &&
      location.pathname !== "/reset-password"
    ) {
      navigate("/", { replace: true });
    }
  }, [userData, appReady, isPublicRoute, isProtectedRoute, navigate, location]);

  if (!appReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-cyan-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Nav />

      <Routes>
        {/* Auth Routes */}
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
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/product" element={<Product />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Protected Pages */}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {userData && <Chatbot />}
    </>
  );
};

export default App;
