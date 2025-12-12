import React from "react";

const backgrounds = {
  meadow: "from-lime-100 via-emerald-100 to-emerald-300",
  sunset: "from-rose-100 via-orange-100 to-amber-200",
  sky: "from-sky-100 via-cyan-100 to-blue-200",
};

export default function ScreenSection({
  children,
  variant = "meadow",
  className = "",
}) {
  const gradient = backgrounds[variant] || backgrounds.meadow;

  return (
    <main
      className={`min-h-screen w-full bg-gradient-to-b ${gradient} ${className}`}
    >
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    </main>
  );
}


