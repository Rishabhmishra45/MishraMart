import React from "react";
import Hero from "../components/Hero";
import Product from "./Product";
import OurPolicy from "../components/OurPolicy";
import NewLetterBox from "../components/NewLetterBox";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import { useCart } from "../context/CartContext";
import CartNotification from "../components/CartNotification";

const Home = () => {
  const { showCartNotification, notificationProduct, setShowCartNotification } =
    useCart();

  const handleCloseNotification = () => {
    setShowCartNotification(false);
  };

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden pb-[50px]"
      style={{
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* Cart Notification for Home Page */}
      <CartNotification
        product={notificationProduct}
        isVisible={showCartNotification}
        onClose={handleCloseNotification}
      />

      {/* Main Sections */}
      <div className="w-full">
        <Hero />
        <Product />
        <OurPolicy />
        <NewLetterBox />
        <Footer />
        <Chatbot />
      </div>
    </div>
  );
};

export default Home;
