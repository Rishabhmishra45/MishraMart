import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import Product from "./Product";
import LoadingSpinner from "../components/LoadingSpinner";
import OurPolicy from "../components/OurPolicy";
import NewLetterBox from "../components/NewLetterBox";
import Footer from "../components/Footer";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
      <OurPolicy />
      <NewLetterBox />
      <Footer />
    </div>
  );
};

export default Home;