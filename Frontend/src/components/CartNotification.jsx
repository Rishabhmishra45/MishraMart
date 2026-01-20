import React from "react";
import { FaCheck, FaShoppingCart, FaTimes } from "react-icons/fa";

const CartNotification = ({ product, isVisible, onClose }) => {
  if (!isVisible || !product) return null;

  return (
    <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-50 animate-slide-in-right w-[92vw] max-w-sm">
      <div
        className="rounded-2xl p-4 shadow-2xl border backdrop-blur-md"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,.15), rgba(16,185,129,.10))",
          borderColor: "rgba(34,197,94,.35)",
          color: "var(--text)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-full mt-0.5">
            <FaCheck className="text-green-300 text-lg" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Added to Cart! 🎉</p>
            <p className="text-xs mt-1 truncate" style={{ color: "var(--muted)" }}>
              {product.name}
            </p>
            {product.size && (
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Size: {product.size}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              ₹{product.price} × {product.quantity || 1}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[color:var(--muted)] hover:text-[color:var(--text)] text-lg transition hover:scale-110"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
          <FaShoppingCart className="text-xs" />
          <span>Item successfully added to your cart</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-black/10 rounded-full h-1 overflow-hidden">
          <div
            className="h-1 rounded-full"
            style={{
              width: "100%",
              animation: "progress 3s linear forwards",
              background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
            }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default CartNotification;
