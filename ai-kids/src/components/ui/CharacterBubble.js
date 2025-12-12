import React from "react";

export default function CharacterBubble({
  children,
  className = "",
  tone = "default",
}) {
  const tones = {
    default: "bg-white/90 border-emerald-200 text-emerald-800",
    success: "bg-emerald-100 border-emerald-300 text-emerald-800",
    warning: "bg-amber-100 border-amber-300 text-amber-800",
  };

  return (
    <div
      className={`w-full rounded-[32px] border-2 p-4 text-lg font-medium shadow-inner ${tones[tone] || tones.default} ${className}`}
    >
      {children}
    </div>
  );
}


