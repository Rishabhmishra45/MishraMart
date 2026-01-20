import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaCreditCard,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const categories = [
    "Men's Fashion",
    "Women's Fashion",
    "Kids Wear",
    "Winter Collection",
    "Summer Collection",
    "Accessories",
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, name: "Facebook", url: "#" },
    { icon: <FaTwitter />, name: "Twitter", url: "#" },
    { icon: <FaInstagram />, name: "Instagram", url: "#" },
    { icon: <FaLinkedinIn />, name: "LinkedIn", url: "#" },
  ];

  const paymentMethods = ["Visa", "MasterCard", "PayPal", "Razorpay", "UPI", "Net Banking"];

  return (
    <footer
      className="w-full border-t"
      style={{
        background: "linear-gradient(180deg, var(--surface), var(--bg))",
        color: "var(--text)",
        borderColor: "var(--border)",
      }}
    >
      {/* Trust Badges */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <FaTruck className="text-2xl text-blue-400 mb-2" />
              <span className="text-sm font-semibold">Free Shipping</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                Above ₹999
              </span>
            </div>
            <div className="flex flex-col items-center">
              <FaShieldAlt className="text-2xl text-green-400 mb-2" />
              <span className="text-sm font-semibold">Secure Payment</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                100% Protected
              </span>
            </div>
            <div className="flex flex-col items-center">
              <FaHeadset className="text-2xl text-purple-400 mb-2" />
              <span className="text-sm font-semibold">24/7 Support</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                Always Available
              </span>
            </div>
            <div className="flex flex-col items-center">
              <FaCreditCard className="text-2xl text-orange-400 mb-2" />
              <span className="text-sm font-semibold">Easy Returns</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                30 Days Policy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              MishraMart
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
              Your trusted destination for premium fashion and lifestyle products. We bring you the latest trends with quality assurance.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm" style={{ color: "var(--muted)" }}>
                <FaMapMarkerAlt className="text-blue-400 mt-0.5" />
                <span>123 Fashion Street, Jaipur, India - 302031</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
                <FaPhone className="text-green-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
                <FaEnvelope className="text-purple-400" />
                <span>support@mishramart.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
                <FaClock className="text-orange-400" />
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm hover:text-cyan-500 transition-colors" style={{ color: "var(--muted)" }}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Categories</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/collections?category=${category.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm hover:text-cyan-500 transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter mini */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Stay Updated</h4>
            <div className="rounded-2xl p-4 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                Get latest offers & updates.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-xl text-xs outline-none border bg-transparent"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                />
                <button className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-95">
                  Subscribe
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="px-2 py-1 rounded-lg text-[11px] border"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="w-9 h-9 rounded-full flex items-center justify-center border hover:scale-105 transition"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  aria-label={social.name}
                >
                  <span className="text-sm" style={{ color: "var(--muted)" }}>
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-sm text-center md:text-left" style={{ color: "var(--muted)" }}>
              © {currentYear} MishraMart. All rights reserved.
            </div>

            <div className="text-xs text-center" style={{ color: "var(--muted)" }}>
              Prices and availability are subject to change.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
