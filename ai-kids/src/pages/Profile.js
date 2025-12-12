import React, { useEffect, useState } from "react";
import ScreenSection from "../components/ScreenSection";
import { Link } from "react-router-dom";
import { loadProfile } from "../utils/profileManager";
import { resetAnalytics } from "../utils/analytics";


export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const saved = loadProfile();
    setProfile(saved);
  }, []);

  function handleResetStats() {
    if (!window.confirm("Are you sure you want to reset all statistics? This action cannot be undone.")) {
      return;
    }
    
    // Reset profile to default
    const defaultProfile = {
      level: 1,
      tasksCompleted: 0,
      totalMistakes: 0,
      points: 0,
      achievements: [],
      lastThreeMistakes: [],
      levelHistory: [1],
      nextDifficultyModifier: "neutral"
    };
    
    localStorage.setItem("talentia_profile", JSON.stringify(defaultProfile));
    
    // Reset progress
    const defaultProgress = {
      island1: true,
      island2: false,
      island3: false,
      island4: false,
      island5: false,
      island6: false
    };
    localStorage.setItem("progress", JSON.stringify(defaultProgress));
    
    // Reset analytics (errors, task stats, session history)
    resetAnalytics();
    
    setProfile(defaultProfile);
    alert("All statistics and error history have been reset!");
  }

  if (!profile)
    return (
      <ScreenSection>
        <p>Loading...</p>
      </ScreenSection>
    );

  return (
    <ScreenSection variant="meadow">
      <div className="max-w-lg mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold text-emerald-900">Your Profile</h1>

        <p className="text-lg"><b>Level:</b> {profile.level}</p>
        <p className="text-lg"><b>Completed tasks:</b> {profile.tasksCompleted}</p>
        <p className="text-lg"><b>Total mistakes:</b> {profile.totalMistakes}</p>
        <p className="text-lg"><b>Points:</b> {profile.points || 0}</p>

        <h2 className="text-xl font-bold mt-4">Achievements</h2>
        <ul className="space-y-1">
          {(profile.achievements || []).length > 0 ? (
            profile.achievements.map((a) => (
              <li key={a}>🏅 {a}</li>
            ))
          ) : (
            <li className="text-gray-500">No achievements yet</li>
          )}
        </ul>

        <div className="mt-6 space-y-3">
          <Link to="/analytics">
            <button className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl shadow text-white font-semibold transition">
              View Error Analytics
            </button>
          </Link>
          <Link to="/reports">
            <button className="w-full bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-xl shadow text-white font-semibold transition">
              Parent Reports
            </button>
          </Link>
          <button
            onClick={handleResetStats}
            className="w-full bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl shadow text-white font-semibold transition"
          >
            Reset Statistics
          </button>
        </div>
      </div>
      <div className="mt-6">
        <Link to="/">
          <button className="bg-white px-4 py-2 rounded-xl shadow text-emerald-700 font-semibold">
            Back to Home
          </button>
        </Link>
      </div>

    </ScreenSection>
  );
}
