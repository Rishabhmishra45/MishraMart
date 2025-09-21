import React from "react";
import Hero from "../components/Hero";

const Home = () => {
  return (
    <div className="w-[100vw] min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white overflow-x-hidden ">
      {/* Hero Section with Slider */}
      <Hero />
    </div>
  );
};

export default Home;
