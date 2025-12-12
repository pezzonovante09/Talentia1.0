import React from "react";

export default function AmuletModal({ island, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-3xl text-center shadow-xl w-80 animate-fadeIn">
        <h2 className="text-3xl font-bold text-emerald-700 mb-3">
          🎉 Great job!
        </h2>

        <p className="text-lg mb-4">
          You found a magical amulet piece on Island {island}!
        </p>

        <button
          onClick={onClose}
          className="bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
