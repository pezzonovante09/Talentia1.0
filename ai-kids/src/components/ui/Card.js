import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={`w-full rounded-[36px] border-4 border-white/80 bg-white/90 p-6 text-center shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}


