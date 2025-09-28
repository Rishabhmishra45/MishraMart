import React from "react";
import Hero from "../components/Hero";
import Product from "./Product";

const Home = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white overflow-x-hidden">
      <Hero />
      <Product />
    </div>
  );
};

export default Home;
