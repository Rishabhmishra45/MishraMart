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
        if (next >= 100) return 100;
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
    <div
      className="
        w-full h-full relative overflow-hidden
        rounded-2xl lg:rounded-3xl
        border border-[color:var(--border)]
        bg-[color:var(--surface)]
        shadow-xl
        group
      "
    >
      {/* Slider Images */}
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
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent z-10" />

            {/* Counter */}
            <div
              className="
                absolute top-3 sm:top-4 right-3 sm:right-4 z-20
                px-3 py-1 rounded-full
                text-[11px] sm:text-sm font-semibold
                backdrop-blur-md
                border
              "
              style={{
                background: "color-mix(in oklab, var(--surface) 25%, black)",
                borderColor: "color-mix(in oklab, var(--border) 35%, transparent)",
                color: "white",
              }}
            >
              {idx + 1} / {images.length}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="
          absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20
          min-h-[44px] min-w-[44px]
          grid place-items-center
          rounded-full
          backdrop-blur-md
          border border-white/10
          transition-all duration-300
          opacity-0 group-hover:opacity-100 lg:opacity-100
          hover:scale-110 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-cyan-500/40
        "
        style={{
          background: "rgba(0,0,0,0.35)",
          color: "white",
        }}
        aria-label="Previous image"
        type="button"
      >
        <FaChevronLeft className="text-base sm:text-xl" />
      </button>

      <button
        onClick={nextSlide}
        className="
          absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20
          min-h-[44px] min-w-[44px]
          grid place-items-center
          rounded-full
          backdrop-blur-md
          border border-white/10
          transition-all duration-300
          opacity-0 group-hover:opacity-100 lg:opacity-100
          hover:scale-110 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-cyan-500/40
        "
        style={{
          background: "rgba(0,0,0,0.35)",
          color: "white",
        }}
        aria-label="Next image"
        type="button"
      >
        <FaChevronRight className="text-base sm:text-xl" />
      </button>

      {/* Autoplay */}
      <button
        onClick={() => setIsAutoPlay((v) => !v)}
        className="
          absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-20
          min-h-[44px] min-w-[44px]
          grid place-items-center
          rounded-full
          backdrop-blur-md
          border border-white/10
          transition-all duration-300
          opacity-0 group-hover:opacity-100 lg:opacity-100
          hover:scale-110 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-cyan-500/40
        "
        style={{
          background: "rgba(0,0,0,0.35)",
          color: "white",
        }}
        aria-label={isAutoPlay ? "Pause slideshow" : "Play slideshow"}
        type="button"
      >
        {isAutoPlay ? (
          <FaPause className="text-xs sm:text-sm" />
        ) : (
          <FaPlay className="text-xs sm:text-sm" />
        )}
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`rounded-full transition-all duration-300 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
              idx === current
                ? "w-3 h-3 sm:w-3.5 sm:h-3.5 bg-cyan-400 shadow-lg shadow-cyan-400/40 scale-125"
                : "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/40 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
            type="button"
          />
        ))}
      </div>

      {/* Progress */}
      <div className="absolute bottom-0 left-0 w-full h-1 z-20 bg-black/15">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{ width: `${isAutoPlay ? progress : 0}%` }}
        />
      </div>

      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyan-400 rounded-full blur-2xl opacity-15 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-15 pointer-events-none" />
    </div>
  );
};

export default Background;
