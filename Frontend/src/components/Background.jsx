import React, { useEffect, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
];

const Background = () => {
  const [current, setCurrent] = useState(0);

  // Auto-slide every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg">
      {/* Slider Images */}
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`slide-${idx}`}
          draggable={false}
          className={`absolute w-full h-full object-cover transition-opacity duration-1000 transform ${
            idx === current
              ? "opacity-100 scale-100"
              : "opacity-0 scale-110"
          }`}
        />
      ))}

      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 z-10"></div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full ${
              idx === current ? "bg-cyan-400 shadow-lg" : "bg-gray-400/50"
            } transition-all duration-300`}
          />
        ))}
      </div>

      {/* Optional: Left/Right Arrows (Mobile & Desktop) */}
      <button
        onClick={() => setCurrent((current - 1 + images.length) % images.length)}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition z-20 hidden md:flex"
      >
        &#8592;
      </button>
      <button
        onClick={() => setCurrent((current + 1) % images.length)}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition z-20 hidden md:flex"
      >
        &#8594;
      </button>
    </div>
  );
};

export default Background;
