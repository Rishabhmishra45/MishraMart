import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import Product from "./Product";
import LoadingSpinner from "../components/LoadingSpinner";

const Home = () => {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Use the reusable loading spinner
  if (isLoading) {
    return (
      <LoadingSpinner
        message="Loading Homepage..."
        spinnerColor="#aaf5fa"
        textColor="#aaf5fa"
      />
    );
  }


  return (
    <div className="w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white overflow-x-hidden">
      <Hero />
      <Product />
    </div>
  );
};

export default Home;
