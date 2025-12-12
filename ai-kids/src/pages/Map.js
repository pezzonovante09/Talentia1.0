import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ScreenSection from "../components/ScreenSection";

export default function Map() {
  const [progress, setProgress] = useState({
    island1: true,
    island2: false,
    island3: false,
    island4: false,
    island5: false,
    island6: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("progress");
    if (saved) {
      const parsed = JSON.parse(saved);
      setProgress({
        island1: parsed.island1 !== false,
        island2: parsed.island2 === true,
        island3: parsed.island3 === true,
        island4: parsed.island4 === true,
        island5: parsed.island5 === true,
        island6: parsed.island6 === true,
      });
    }
  }, []);

  const islands = [
    { id: 1, title: "Forest Island", icon: "🌿", unlocked: progress.island1 },
    { id: 2, title: "River Island", icon: "🌊", unlocked: progress.island2 },
    { id: 3, title: "Volcano Island", icon: "🌋", unlocked: progress.island3 },
    { id: 4, title: "Crystal Island", icon: "💎", unlocked: progress.island4 },
    { id: 5, title: "Cloud Island", icon: "☁️", unlocked: progress.island5 },
    { id: 6, title: "Star Island", icon: "⭐", unlocked: progress.island6 },
  ];

  return (
    <ScreenSection variant="sky">
      <div className="w-full max-w-lg mx-auto">

        <h1 className="text-3xl font-bold text-emerald-900 text-center mb-6">
          Choose Your Mission
        </h1>

        <div className="space-y-4">
          {islands.map((island) => (
            <div
              key={island.id}
              className={`flex items-center justify-between border rounded-2xl p-4 transition 
                ${island.unlocked ? "bg-white border-emerald-200" : "bg-gray-200 border-gray-300 opacity-60"}
              `}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{island.icon}</span>
                <span className="text-xl font-semibold">{island.title}</span>
              </div>

              {island.unlocked ? (
                <Link to={`/task/${island.id}`}>
                  <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600">
                    Start
                  </button>
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-600">Locked 🔒</span>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-emerald-700 font-semibold underline">
            Back Home
          </Link>
        </div>
      </div>
    </ScreenSection>
  );
}
