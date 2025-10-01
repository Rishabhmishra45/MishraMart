import React from "react";
import Background from "./Background";
import { FaShoppingBag, FaArrowRight } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center bg-gradient-to-br from-[#0c2025] to-[#141414] text-white pt-[70px]">
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                Elevate Your{" "}
                <span className="text-cyan-400">Style</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl text-gray-300">
                With Premium Fashion
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-300 max-w-xl">
              Discover curated collections that blend quality, comfort, and style for the modern you.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
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

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition duration-300 flex items-center gap-2">
                <FaShoppingBag />
                <span>Shop Collection</span>
                <FaArrowRight className="text-sm" />
              </button>

              <button className="px-8 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white font-semibold rounded-lg transition duration-300">
                Explore Deals
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-gray-400 text-sm">Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">2K+</div>
                <div className="text-gray-400 text-sm">Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">5★</div>
                <div className="text-gray-400 text-sm">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image Slider */}
          <div className="flex-1 w-full h-[400px] sm:h-[500px] lg:h-[600px] relative">
            <Background />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;