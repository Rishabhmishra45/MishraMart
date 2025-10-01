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
    FaCreditCard
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: "Home", path: "/" },
        { name: "Collections", path: "/collections" },
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" }
    ];

    const categories = [
        "Men's Fashion",
        "Women's Fashion",
        "Kids Wear",
        "Winter Collection",
        "Summer Collection",
        "Accessories"
    ];

    const customerService = [
        "Shipping Information",
        "Returns & Exchanges",
        "Size Guide",
        "FAQ",
        "Track Your Order",
        "Contact Support"
    ];

    const socialLinks = [
        { icon: <FaFacebookF />, name: "Facebook", url: "#" },
        { icon: <FaTwitter />, name: "Twitter", url: "#" },
        { icon: <FaInstagram />, name: "Instagram", url: "#" },
        { icon: <FaLinkedinIn />, name: "LinkedIn", url: "#" }
    ];

    const paymentMethods = [
        "Visa", "MasterCard", "PayPal", "Razorpay", "UPI", "Net Banking"
    ];

    return (
        <footer className="w-full bg-gradient-to-b from-[#0c2025] to-[#141414] text-white border-t border-gray-800">

            {/* Trust Badges Section */}
            <div className="bg-[#0f1b1d] border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="flex flex-col items-center">
                            <FaTruck className="text-2xl text-blue-400 mb-2" />
                            <span className="text-sm font-semibold">Free Shipping</span>
                            <span className="text-xs text-gray-400">Above ₹999</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaShieldAlt className="text-2xl text-green-400 mb-2" />
                            <span className="text-sm font-semibold">Secure Payment</span>
                            <span className="text-xs text-gray-400">100% Protected</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaHeadset className="text-2xl text-purple-400 mb-2" />
                            <span className="text-sm font-semibold">24/7 Support</span>
                            <span className="text-xs text-gray-400">Always Available</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaCreditCard className="text-2xl text-orange-400 mb-2" />
                            <span className="text-sm font-semibold">Easy Returns</span>
                            <span className="text-xs text-gray-400">30 Days Policy</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

                    {/* Company Info */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            MishraMart
                        </h3>
                        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                            Your trusted destination for premium fashion and lifestyle products.
                            We bring you the latest trends with quality assurance and exceptional customer service.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <FaMapMarkerAlt className="text-blue-400 flex-shrink-0" />
                                <span>123 Fashion Street, Jaipur, India - 302031</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <FaPhone className="text-green-400 flex-shrink-0" />
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <FaEnvelope className="text-purple-400 flex-shrink-0" />
                                <span>support@mishramart.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <FaClock className="text-orange-400 flex-shrink-0" />
                                <span>24/7 Customer Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-1 transform inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-white">Categories</h4>
                        <ul className="space-y-3">
                            {categories.map((category, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/collections?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-1 transform inline-block"
                                    >
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service & Newsletter */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-white">Customer Service</h4>
                        <ul className="space-y-3 mb-6">
                            {customerService.map((service, index) => (
                                <li key={index}>
                                    <span
                                        className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-1 transform inline-block cursor-pointer"
                                        onClick={() => console.log(`Clicked on: ${service}`)}
                                    >
                                        {service}
                                    </span>
                                </li>
                            ))}
                        </ul>


                        {/* Newsletter */}
                        <div className="bg-[#0f1b1d] p-4 rounded-lg border border-gray-700">
                            <h5 className="font-semibold text-white mb-2 text-sm">Stay Updated</h5>
                            <p className="text-gray-400 text-xs mb-3">Get latest offers and updates</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="flex-1 px-3 py-2 bg-[#141414] border border-gray-600 rounded text-white text-xs placeholder-gray-400 outline-none focus:border-blue-400"
                                />
                                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800 bg-[#0a1619]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                        {/* Copyright */}
                        <div className="text-gray-400 text-sm text-center md:text-left">
                            © {currentYear} MishraMart. All rights reserved.
                        </div>

                        {/* Payment Methods */}
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-sm">We Accept:</span>
                            <div className="flex gap-2 flex-wrap justify-center">
                                {paymentMethods.map((method, index) => (
                                    <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">
                                        {method}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    className="w-8 h-8 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Additional Legal */}
                    <div className="text-center mt-4 pt-4 border-t border-gray-800">
                        <p className="text-gray-500 text-xs">
                            MishraMart is a registered trademark. Prices and availability are subject to change.
                            All orders are subject to product availability and verification.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;