import React from "react";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import { useCart } from "../context/CartContext";
import CartNotification from "../components/CartNotification";

const Product = () => {
  const { showCartNotification, notificationProduct, setShowCartNotification } = useCart();

  const handleCloseNotification = () => {
    setShowCartNotification(false);
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Cart Notification for Product Page */}
      <CartNotification
        product={notificationProduct}
        isVisible={showCartNotification}
        onClose={handleCloseNotification}
      />
      
      <div className="pt-[70px]">
        <LatestCollection />
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <BestSeller />
        </div>
      </div>
    </div>
  );
};

export default Product;