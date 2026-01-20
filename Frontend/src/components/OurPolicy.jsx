import React from "react";
import { FaTruck, FaUndo, FaShieldAlt, FaHeadset } from "react-icons/fa";

const OurPolicy = () => {
  const policies = [
    {
      icon: <FaTruck className="text-blue-400 text-2xl sm:text-3xl" />,
      title: "Fast Delivery",
      desc: "Quick shipping across India with tracking support.",
    },
    {
      icon: <FaUndo className="text-green-400 text-2xl sm:text-3xl" />,
      title: "Easy Returns",
      desc: "Hassle-free returns within 30 days of delivery.",
    },
    {
      icon: <FaShieldAlt className="text-purple-400 text-2xl sm:text-3xl" />,
      title: "Secure Payments",
      desc: "100% secure checkout with encrypted payments.",
    },
    {
      icon: <FaHeadset className="text-cyan-400 text-2xl sm:text-3xl" />,
      title: "24/7 Support",
      desc: "Always ready to help you with orders & queries.",
    },
  ];

  return (
    <section className="w-full py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {policies.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "var(--surface-2)" }}
              >
                {p.icon}
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2">{p.title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurPolicy;
