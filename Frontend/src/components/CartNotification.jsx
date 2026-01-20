import React, { useEffect, useRef } from "react";
import { FaCheck, FaShoppingCart, FaTimes } from "react-icons/fa";

const CartNotification = ({ product, isVisible, onClose }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    // auto close after 3s (keeps UX clean)
    timerRef.current = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [isVisible, onClose]);

  if (!isVisible || !product) return null;

  return (
    <div className="fixed top-[76px] sm:top-[88px] right-3 sm:right-6 z-50 animate-slide-in-right w-[92vw] max-w-sm">
      <div
        className="
          rounded-3xl p-4 sm:p-5
          shadow-2xl border backdrop-blur-md
          transition-all
        "
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, rgb(34 197 94) 18%, transparent), color-mix(in oklab, rgb(16 185 129) 10%, transparent))",
          borderColor: "color-mix(in oklab, rgb(34 197 94) 35%, transparent)",
          color: "var(--text)",
        }}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="shrink-0 w-11 h-11 rounded-2xl border flex items-center justify-center"
            style={{
              background:
                "color-mix(in oklab, var(--surface) 45%, transparent)",
              borderColor:
                "color-mix(in oklab, var(--border) 55%, transparent)",
            }}
          >
            <FaCheck className="text-green-500 text-lg" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm sm:text-base leading-tight">
              Added to Cart 🎉
            </p>

            <p
              className="text-xs sm:text-sm mt-1 truncate"
              style={{ color: "var(--muted)" }}
              title={product.name}
            >
              {product.name}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs">
              {product.size && (
                <span
                  className="px-2 py-1 rounded-full border"
                  style={{
                    background:
                      "color-mix(in oklab, var(--surface) 80%, transparent)",
                    borderColor: "var(--border)",
                    color: "var(--muted)",
                  }}
                >
                  Size: <span style={{ color: "var(--text)" }}>{product.size}</span>
                </span>
              )}

              <span style={{ color: "var(--muted)" }}>
                ₹{product.price} × {product.quantity || 1}
              </span>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="
              shrink-0 min-h-[44px] min-w-[44px]
              grid place-items-center rounded-2xl
              border transition
              hover:scale-105 active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-cyan-500/40
            "
            style={{
              background:
                "color-mix(in oklab, var(--surface) 85%, transparent)",
              borderColor: "var(--border)",
              color: "var(--muted)",
            }}
            aria-label="Close notification"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        <div
          className="mt-3 flex items-center gap-2 text-xs sm:text-sm"
          style={{ color: "var(--muted)" }}
        >
          <FaShoppingCart className="text-sm" />
          <span>Item successfully added to your cart</span>
        </div>

        {/* Progress Bar */}
        <div
          className="mt-3 w-full rounded-full h-1 overflow-hidden"
          style={{ background: "color-mix(in oklab, var(--border) 55%, transparent)" }}
        >
          <div
            className="h-1 rounded-full"
            style={{
              width: "100%",
              animation: "progress 3s linear forwards",
              background:
                "linear-gradient(90deg, var(--accent), var(--accent-2))",
            }}
          />
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
