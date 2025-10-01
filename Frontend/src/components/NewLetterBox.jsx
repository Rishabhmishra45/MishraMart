import React, { useState } from "react";
import { FaPaperPlane, FaGift, FaShieldAlt } from "react-icons/fa";

const NewLetterBox = () => {
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            console.log("Subscribed with email:", email);
            setIsSubscribed(true);
            setEmail("");
            setTimeout(() => setIsSubscribed(false), 3000);
        }
    };

    return (
        <section className="w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#0c2025] via-[#141414] to-[#0c2025] relative overflow-hidden">

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-cyan-400 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full blur-lg"></div>
            </div>

            <div className="relative z-10">
                {/* Header Section */}
                <div className="text-center mb-12 sm:mb-16">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 rounded-full px-4 py-2 mb-6">
                        <FaGift className="text-blue-400 text-sm" />
                        <span className="text-blue-300 text-sm font-medium">Limited Time Offer</span>
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                        Subscribe Now & Get{" "}
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                            20% Off
                        </span>
                    </h2>

                    {/* Description */}
                    <p className="text-gray-300 text-sm sm:text-xl mb-6 max-w-3xl mx-auto leading-relaxed">
                        Join our fashion community and enjoy exclusive savings, special deals,
                        and early access to new collections before anyone else.
                    </p>

                    {/* Benefits List */}
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-8">
                        <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm sm:text-base">First access to new arrivals</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm sm:text-base">Members-only sales</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm sm:text-base">Style tips & inspiration</span>
                        </div>
                    </div>
                </div>

                {/* Newsletter Box */}
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl shadow-blue-900/30 backdrop-blur-sm relative">

                        {/* Decorative Elements */}
                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full blur-sm"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-cyan-400 rounded-full blur-sm"></div>

                        {/* Success Message */}
                        {isSubscribed && (
                            <div className="mb-8 p-4 bg-gradient-to-r from-green-900/40 to-emerald-900/30 border border-green-600/50 rounded-xl text-green-300 text-center backdrop-blur-sm">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">🎉</span>
                                    <span className="font-semibold">Welcome to the MishraMart family!</span>
                                </div>
                                <p className="text-sm mt-1 text-green-200">
                                    Your 20% discount code has been sent to your email.
                                </p>
                            </div>
                        )}

                        <div className="text-center relative z-10">
                            {/* Form Header */}
                            <div className="mb-8">
                                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                                    Ready to Save?
                                </h3>
                                <p className="text-gray-400 text-sm sm:text-base">
                                    Enter your email below to claim your exclusive discount
                                </p>
                            </div>

                            {/* Subscription Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <div className="flex-1 relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your best email address"
                                        className="w-full px-6 py-4 bg-[#141414] border-2 border-gray-600 rounded-2xl 
                                     text-white placeholder-gray-400 outline-none 
                                     focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 
                                     transition-all duration-300 text-base
                                     hover:border-gray-500"
                                        required
                                    />
                                    {/* FIXED: Overlay div now ignores pointer events */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 
                                        blur-sm transition-all duration-300 
                                     hover:from-blue-500/10 hover:to-cyan-500/10 
                                        pointer-events-none"></div>
                                </div>

                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 
                                     text-white font-bold rounded-2xl hover:from-blue-600 hover:to-cyan-600 
                                     transform hover:-translate-y-0.5 shadow-2xl shadow-blue-500/40 
                                     hover:shadow-blue-500/50 transition-all duration-300
                                    flex items-center justify-center gap-3 text-base
                                     min-w-[140px] relative overflow-hidden group"
                                >
                                    <span className="relative z-10">Subscribe</span>
                                    <FaPaperPlane className="text-sm relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                </button>
                            </form>


                            {/* Trust & Privacy Section */}
                            <div className="mt-8 pt-6 border-t border-gray-700/50">
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-400 text-xs">
                                    <div className="flex items-center gap-2">
                                        <FaShieldAlt className="text-green-400" />
                                        <span>100% Secure & Private</span>
                                    </div>
                                    <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
                                    <span>No spam, ever</span>
                                    <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
                                    <span>Unsubscribe anytime</span>
                                </div>

                                {/* Privacy Note */}
                                <p className="text-gray-500 text-xs mt-4 max-w-md mx-auto">
                                    By subscribing, you agree to our Privacy Policy and consent to receive
                                    updates from MishraMart. You can unsubscribe at any time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional CTA */}
                <div className="text-center mt-8">
                    <p className="text-gray-400 text-sm">
                        🎁 <span className="text-blue-300 font-semibold">Bonus:</span> First 100 subscribers get free shipping on their first order!
                    </p>
                </div>
            </div>
        </section>
    );
};

export default NewLetterBox;