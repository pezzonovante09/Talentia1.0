import React, { useState } from "react";
import { Link } from "react-router-dom";
import PrimaryButton from "../components/ui/PrimaryButton";
import ScreenSection from "../components/ScreenSection";
import DinoCharacter from "../components/DinoCharacter";

export default function Home() {
  const [showStory, setShowStory] = useState(false);

  return (
    <ScreenSection variant="meadow">
      <div className="absolute top-4 right-4">
        <Link to="/profile">
          <button className="bg-white px-4 py-2 rounded-xl shadow text-emerald-700 font-semibold">
            Profile
          </button>
        </Link>
      </div>
      
      <div className="flex flex-col items-center gap-6 text-center">

        {/* Dino */}
        <DinoCharacter />

        {/* Title */}
        <h1 className="text-5xl font-black text-emerald-900 drop-shadow-sm">
          Talentia
        </h1>
        <p className="text-lg font-semibold text-emerald-800">
          Learn & play with Tali the Dino
        </p>

        {/* Start Journey Button */}
        <PrimaryButton onClick={() => setShowStory(true)}>
          Start Journey
        </PrimaryButton>

        {/* Story Modal */}
        {showStory && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-3xl p-6 w-11/12 max-w-md text-center shadow-2xl animate-fadeIn">

              <DinoCharacter size="w-32 mx-auto" />

              <h2 className="text-3xl font-bold text-emerald-800 mb-3">
                Tali’s Story
              </h2>

              <p className="text-emerald-900 text-lg leading-relaxed mb-4">
                Hi, friend! I’m Tali the Dino.
                Something sad happened… I lost my mom’s magical amulet.
                The pieces are hidden across three islands.
                Will you help me find them by solving fun learning missions?
              </p>

              <Link to="/map">
                <PrimaryButton>Let’s begin!</PrimaryButton>
              </Link>

              <button
                className="mt-3 underline text-sm text-emerald-700"
                onClick={() => setShowStory(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </ScreenSection>
  );
}
