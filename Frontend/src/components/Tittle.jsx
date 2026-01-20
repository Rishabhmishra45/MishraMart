import React from "react";

const Tittle = ({ text1, text2 }) => {
  return (
    <div className="text-center mb-3 sm:mb-6 px-3">
      <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
        <span className="text-[color:var(--text)]">{text1} </span>
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {text2}
        </span>
      </h2>
      <div
        className="w-16 sm:w-20 h-1 mx-auto mt-3 rounded-full"
        style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }}
      />
    </div>
  );
};

export default Tittle;
