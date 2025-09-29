import React, { useContext, useEffect } from "react";
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

const App = () => {
  const { userData, loading } = useContext(userDataContext); // loading added
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !userData && window.location.pathname === "/") {
      navigate("/signup");
    }
  }, [userData, navigate, loading]);

  if (loading) {
    return <div className="text-white p-10">Checking login...</div>;
  }

  return (
    <>
      {userData && <Nav />}

      <Routes>
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/signup" replace />}
        />
        <Route
          path="/login"
          element={userData ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={userData ? <Navigate to="/" replace /> : <Registration />}
        />
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
