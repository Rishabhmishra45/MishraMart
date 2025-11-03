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
    <div className="w-full max-w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col items-center justify-start py-10 overflow-x-hidden">
      {/* Cart Notification for Product Page */}
      <CartNotification
        product={notificationProduct}
        isVisible={showCartNotification}
        onClose={handleCloseNotification}
      />
      
      <div className="w-[100%] min-h-[70px] flex items-center justify-start gap-[10px] flex-col">
        <LatestCollection />
      </div>

      <div className="w-[100%] min-h-[70px] flex items-center justify-start gap-[10px] flex-col">
        <BestSeller />
      </div>
    </div>
  );
};

export default Product;