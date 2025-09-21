// Hero.jsx
import React from "react";
import Background from "./Background";

const Hero = () => {
  return (
    <section
      id="home"
      className="w-full min-h-[calc(100vh-70px)] pt-[70px] flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#0c2025] to-[#141414] text-white"
    >
      {/* Left Text */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center px-6 md:px-12 py-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-bold leading-snug">
          Discover the Best of <br /> Bold Fashion <br />
          <span className="text-cyan-400">Limited Time Only!</span>
        </h1>
        <p className="text-gray-400 mt-4 text-sm md:text-base max-w-md">
          Shop the latest trends and get exclusive offers only at MishraMart.
        </p>
        <button className="mt-6 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition">
          Shop Now
        </button>
      </div>

      {/* Right Background Slider */}
      <div className="w-full md:w-1/2 h-[250px] sm:h-[350px] md:h-[calc(100vh-70px)] pt-[0px]">
        <Background />
      </div>
    </section>
  );
};

export default Hero;
