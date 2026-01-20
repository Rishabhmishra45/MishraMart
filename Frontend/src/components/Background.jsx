import React, { useEffect, useState, useCallback, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaPause, FaPlay } from "react-icons/fa";
import image from "../assets1/image.png";
import image1 from "../assets1/image1.png";
import image2 from "../assets1/image2.png";
import image3 from "../assets1/image3.png";
import image4 from "../assets1/image4.png";
import image5 from "../assets1/image5.png";
import image6 from "../assets1/image6.png";

const images = [image, image1, image2, image4, image5, image6, image3];

const SLIDE_MS = 4000;

const Background = () => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  // Smooth progress bar animation
  useEffect(() => {
    if (!isAutoPlay) return;

    const loop = (ts) => {
      if (!lastRef.current) lastRef.current = ts;
      const delta = ts - lastRef.current;
      lastRef.current = ts;

      setProgress((p) => {
        const next = p + (delta / SLIDE_MS) * 100;
        if (next >= 100) {
          return 100;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [isAutoPlay, current]);

  // Auto slide
  useEffect(() => {
    if (!isAutoPlay) return;

    if (progress >= 100) {
      setProgress(0);
      nextSlide();
    }
  }, [progress, isAutoPlay, nextSlide]);

  // Reset progress on slide change
  useEffect(() => {
    setProgress(0);
  }, [current]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl shadow-blue-900/20 group">
      {/* Slider Images */}
      <div className="relative w-full h-full">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 transform ${
              idx === current ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
            }`}
          >
            <img
              src={img}
              alt={`Fashion Collection ${idx + 1}`}
              draggable={false}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10"></div>

            {/* Counter */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/45 text-white px-3 py-1 rounded-full text-[11px] sm:text-sm z-20 backdrop-blur-sm border border-white/10">
              {idx + 1} / {images.length}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 
        bg-black/30 hover:bg-black/60 text-white p-2.5 sm:p-3 rounded-full 
        transition-all duration-300 z-20 backdrop-blur-sm
        opacity-0 group-hover:opacity-100 lg:opacity-100
        hover:scale-110 hover:shadow-2xl border border-white/10"
        aria-label="Previous image"
      >
        <FaChevronLeft className="text-base sm:text-xl" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 
        bg-black/30 hover:bg-black/60 text-white p-2.5 sm:p-3 rounded-full 
        transition-all duration-300 z-20 backdrop-blur-sm
        opacity-0 group-hover:opacity-100 lg:opacity-100
        hover:scale-110 hover:shadow-2xl border border-white/10"
        aria-label="Next image"
      >
        <FaChevronRight className="text-base sm:text-xl" />
      </button>

      {/* Autoplay */}
      <button
        onClick={() => setIsAutoPlay((v) => !v)}
        className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full 
        transition-all duration-300 z-20 backdrop-blur-sm
        opacity-0 group-hover:opacity-100 lg:opacity-100
        hover:scale-110 border border-white/10"
        aria-label={isAutoPlay ? "Pause slideshow" : "Play slideshow"}
      >
        {isAutoPlay ? <FaPause className="text-xs sm:text-sm" /> : <FaPlay className="text-xs sm:text-sm" />}
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
              idx === current
                ? "bg-cyan-400 shadow-lg shadow-cyan-400/50 scale-125"
                : "bg-gray-400/50 hover:bg-gray-200/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-20">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-400"
          style={{ width: `${isAutoPlay ? progress : 0}%` }}
        />
      </div>

      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyan-400 rounded-full blur-2xl opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-400 rounded-full blur-2xl opacity-20 pointer-events-none"></div>
    </div>
  );
};

export default Background;
