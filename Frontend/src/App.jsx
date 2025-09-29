import React, { useContext, useEffect } from "react";
import {Route,Routes,Navigate,useNavigate,useLocation,} from "react-router-dom";
import Registration from "./pages/Registration";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Nav from "./components/Nav";
import { userDataContext } from "./context/UserContext";
import About from "./pages/About";
import Collections from "./pages/Collections";
import Product from "./pages/Product";
import Contact from "./pages/Contact";

const App = () => {
  const { userData } = useContext(userDataContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // agar userData nahi hai aur root route hai to signup par bhejo
    if (!userData && window.location.pathname === "/") {
      navigate("/signup");
    }
  }, [userData, navigate]);

  return (
    <>
      {/* Nav sirf tab dikhe jab user logged in hai */}
      {userData && <Nav />}

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/signup" replace />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={userData ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={userData ? <Navigate to="/" replace /> : <Registration />}
        />

        {/* About */}
        <Route
          path="/about"
          element={
            userData ? (
              <About />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} />
            )
          }
        />

        <Route
          path="/collections"
          element={
            userData ? (
              <Collections />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} />
            )
          }
        />

        {/* Product */}
        <Route
          path="/product"
          element={
            userData ? (
              <Product />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} />
            )
          }
        />

        {/* Contact */}
        <Route
          path="/contact"
          element={
            userData ? (
              <Contact />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} />
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;
