import React from "react";
import Background from "./Background";
import { FaShoppingBag, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative w-full min-h-[92vh] flex items-center pt-[70px]"
      style={{
        background: "linear-gradient(135deg, var(--bg), var(--surface))",
        color: "var(--text)",
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                Elevate Your{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Style
                </span>
              </h1>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-semibold" style={{ color: "var(--muted)" }}>
                With Premium Fashion
              </h2>
            </div>

            <p className="text-sm sm:text-lg max-w-xl leading-relaxed" style={{ color: "var(--muted)" }}>
              Discover curated collections that blend quality, comfort, and style for the modern you.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Free Shipping Over ₹1999</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Secure Payment</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto">
              <button
                onClick={() => navigate("/collections")}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600
                text-white transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-cyan-500/20
                flex items-center justify-center gap-2"
              >
                <FaShoppingBag />
                <span>Shop Collection</span>
                <FaArrowRight className="text-sm" />
              </button>

              <button
                onClick={() => navigate("/collections")}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold
                border border-[color:var(--border)] text-[color:var(--text)]
                hover:bg-[color:var(--surface-2)] transition-all duration-300"
              >
                Explore Deals
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 sm:gap-8 mt-4 text-center">
              {[
                { value: "50K+", label: "Customers" },
                { value: "2K+", label: "Products" },
                { value: "5★", label: "Rating" },
              ].map((s) => (
                <div key={s.label} className="px-3 py-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
                  <div className="text-xl sm:text-2xl font-extrabold text-[color:var(--text)]">{s.value}</div>
                  <div className="text-[11px] sm:text-sm" style={{ color: "var(--muted)" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex-1 w-full h-[320px] sm:h-[460px] lg:h-[600px] relative">
            <Background />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
