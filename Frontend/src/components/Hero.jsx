import React from "react";
import Background from "./Background";

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col md:flex-row items-center justify-between bg-gray-900 text-white overflow-x-hidden">

      {/* Left content */}
      <div className="z-20 flex-1 flex flex-col items-center md:items-start justify-center px-6 md:px-16 py-20 text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
          Bold Fashion, <br />
          <span className="text-cyan-400">Exclusive Offers</span> <br />
          Just For You
        </h1>
        <p className="mt-4 text-gray-300 max-w-md text-sm sm:text-base">
          Discover the latest trends in fashion, tech, and lifestyle. Limited time deals available now!
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg shadow-lg transition duration-300">
            Shop Now
          </button>
          <button className="px-8 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white font-semibold rounded-lg transition duration-300">
            Explore
          </button>
        </div>
      </div>

      {/* Right Background Slider */}
      <div className="flex-1 h-[300px] sm:h-[400px] md:h-screen relative max-w-full overflow-hidden">
        <Background />
      </div>

      {/* Optional Overlay */}
      <div className="absolute inset-0 bg-black/20 z-10 md:hidden"></div>
    </section>
  );
};

export default Hero;
