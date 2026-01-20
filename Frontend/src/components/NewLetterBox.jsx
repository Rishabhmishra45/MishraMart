import React, { useState } from "react";
import { FaPaperPlane, FaGift, FaShieldAlt } from "react-icons/fa";

const NewLetterBox = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // Subscribe logic can be integrated later (API)
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section
      className="w-full py-14 sm:py-18 lg:py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--bg), var(--surface))",
        color: "var(--text)",
      }}
    >
      {/* Soft blobs */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-cyan-400 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <FaGift className="text-blue-400 text-sm" />
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Limited Time Offer
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Subscribe Now & Get{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              20% Off
            </span>
          </h2>

          <p className="text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
            Join our fashion community and enjoy exclusive savings, deals, and early access to new collections.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-7">
            {[
              "First access to new arrivals",
              "Members-only sales",
              "Style tips & inspiration",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs sm:text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Box */}
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-3xl p-6 sm:p-10 border shadow-2xl relative overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full blur-md opacity-70"></div>
            <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-cyan-400 rounded-full blur-md opacity-70"></div>

            {isSubscribed && (
              <div className="mb-6 p-4 rounded-2xl border"
                style={{ background: "rgba(34,197,94,.10)", borderColor: "rgba(34,197,94,.35)" }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">🎉</span>
                  <span className="font-semibold" style={{ color: "var(--text)" }}>
                    Welcome to the MishraMart family!
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-center mt-1" style={{ color: "var(--muted)" }}>
                  Your discount code has been sent to your email.
                </p>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-lg sm:text-2xl font-bold">Ready to Save?</h3>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--muted)" }}>
                Enter your email below to claim your exclusive discount.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-4 rounded-2xl border outline-none bg-transparent"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  required
                />
                {/* pointer-events-none: allows clicking input (important) */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-all duration-300"
                  style={{ boxShadow: "0 0 0 6px var(--ring)" }}
                ></div>
              </div>

              <button
                type="submit"
                className="px-7 py-4 rounded-2xl font-bold text-white
                bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-95
                transition-all duration-300 shadow-xl shadow-blue-500/20
                flex items-center justify-center gap-3"
              >
                <span>Subscribe</span>
                <FaPaperPlane className="text-sm" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t flex flex-col items-center"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-green-400" />
                  <span>100% Secure & Private</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span>No spam</span>
                <span className="hidden sm:inline">•</span>
                <span>Unsubscribe anytime</span>
              </div>

              <p className="text-[11px] sm:text-xs mt-4 text-center max-w-md" style={{ color: "var(--muted)" }}>
                By subscribing, you agree to receive updates from MishraMart. You can unsubscribe at any time.
              </p>
            </div>
          </div>

          <p className="text-center mt-6 text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
            🎁 <span className="font-semibold text-cyan-500">Bonus:</span> First 100 subscribers get free shipping on their first order!
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewLetterBox;
