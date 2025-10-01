import React, { useEffect, useState, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaPause, FaPlay } from "react-icons/fa";
import image from "../assets1/image.png"
import image1 from "../assets1/image1.png"
import image2 from "../assets1/image2.png"
import image3 from "../assets1/image3.png"
import image4 from "../assets1/image4.png"
import image5 from "../assets1/image5.png"
import image6 from "../assets1/image6.png"

const images = [
  image,
  image1,
  image2,
  image4,
  image5,
  image6,
  image3,
];

const Background = () => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  // Auto-slide with pause/play functionality
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, nextSlide]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl shadow-blue-900/20 group">
      
      {/* Slider Images with Enhanced Transitions */}
      <div className="relative w-full h-full">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 transform ${
              idx === current
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 z-0"
            }`}
          >
            <img
              src={img}
              alt={`Fashion Collection ${idx + 1}`}
              draggable={false}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent z-10"></div>
            
            {/* Image Indicator */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20 backdrop-blur-sm">
              {idx + 1} / {images.length}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Enhanced */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 
                   bg-black/30 hover:bg-black/60 text-white p-3 rounded-full 
                   transition-all duration-300 z-20 backdrop-blur-sm
                   opacity-0 group-hover:opacity-100 lg:opacity-100
                   hover:scale-110 hover:shadow-2xl"
        aria-label="Previous image"
      >
        <FaChevronLeft className="text-lg sm:text-xl" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 
                   bg-black/30 hover:bg-black/60 text-white p-3 rounded-full 
                   transition-all duration-300 z-20 backdrop-blur-sm
                   opacity-0 group-hover:opacity-100 lg:opacity-100
                   hover:scale-110 hover:shadow-2xl"
        aria-label="Next image"
      >
        <FaChevronRight className="text-lg sm:text-xl" />
      </button>

      {/* Auto-play Toggle */}
      <button
        onClick={() => setIsAutoPlay(!isAutoPlay)}
        className="absolute top-4 left-4 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full 
                   transition-all duration-300 z-20 backdrop-blur-sm
                   opacity-0 group-hover:opacity-100 lg:opacity-100
                   hover:scale-110"
        aria-label={isAutoPlay ? "Pause slideshow" : "Play slideshow"}
      >
        {isAutoPlay ? <FaPause className="text-sm" /> : <FaPlay className="text-sm" />}
      </button>

      {/* Slide Indicators - Enhanced */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
              idx === current 
                ? "bg-cyan-400 shadow-lg shadow-cyan-400/50 scale-125" 
                : "bg-gray-400/50 hover:bg-gray-300"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-600/30 z-20">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-1000 ease-linear"
          style={{ width: isAutoPlay ? '100%' : '0%' }}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyan-400 rounded-full blur-2xl opacity-20"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-400 rounded-full blur-2xl opacity-20"></div>
    </div>
  );
};

export default Background;