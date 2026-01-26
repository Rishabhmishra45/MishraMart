import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
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
import AuthAction from "./pages/AuthAction";

// 🤖 Voice Assistant
import VoiceAssistant from "./components/VoiceAssistant";

const App = () => {
  const { userData, userChecked } = useContext(userDataContext);
  const { authChecked } = useContext(authDataContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [appReady, setAppReady] = useState(false);

  const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/action"];
  const protectedRoutes = ["/place-order", "/orders", "/profile", "/invoice"];

  const isPublicRoute = publicRoutes.includes(location.pathname);
  const isProtectedRoute = protectedRoutes.includes(location.pathname);

  // 🔄 wait for auth + user check
  useEffect(() => {
    if (authChecked && userChecked) {
      const t = setTimeout(() => setAppReady(true), 400); // smooth delay
      return () => clearTimeout(t);
    }
  }, [authChecked, userChecked]);

  // 🔐 route protection
  useEffect(() => {
    if (!appReady) return;

    if (!userData && isProtectedRoute) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    if (userData && isPublicRoute && location.pathname !== "/auth/action") {
      navigate("/", { replace: true });
    }
  }, [userData, appReady, isPublicRoute, isProtectedRoute, navigate, location]);

  // ⏳ PREMIUM LOADING SCREEN
  if (!appReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "var(--bg)",
          color: "var(--text)",
        }}
      >
        <div
          className="px-8 py-10 rounded-2xl border shadow-2xl text-center
          backdrop-blur-md animate-fadeIn"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          {/* spinner */}
          <div
            className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "var(--accent)",
              borderTopColor: "transparent",
            }}
          ></div>

          <p
            className="text-base font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Loading MishraMart...
          </p>

          <p
            className="text-xs mt-2"
            style={{ color: "var(--muted)" }}
          >
            Getting everything ready for you ✨
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Nav />

      <Routes>
        <Route path="/login" element={!userData ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!userData ? <Registration /> : <Navigate to="/" replace />} />
        <Route path="/auth/action" element={<AuthAction />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/product" element={<Product />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/place-order" element={userData ? <PlaceOrder /> : <Navigate to="/login" replace />} />
        <Route path="/orders" element={userData ? <Orders /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={userData ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/invoice/:orderId" element={userData ? <Invoice /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 🤖 Voice Assistant */}
      <VoiceAssistant />

      {/* 🤖 Chatbot */}
      {userData && <Chatbot />}
    </>
  );
};

export default App;
