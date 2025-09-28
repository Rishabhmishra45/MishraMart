import React, { useEffect, useState } from "react";
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
          className={`mt-[60px] absolute w-full h-full  transition-opacity duration-1000 transform ${idx === current
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
            className={`w-3 h-3 rounded-full ${idx === current ? "bg-cyan-400 shadow-lg" : "bg-gray-400/50"
              } transition-all duration-300`}
          />
        ))}
      </div>

      {/* Optional: Left/Right Arrows (Mobile & Desktop) */}
      <button
        onClick={() => setCurrent((current - 1 + images.length) % images.length)}
        className="absolute cursor-pointer top-1/2 left-4 transform -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition z-20 hidden md:flex"
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
