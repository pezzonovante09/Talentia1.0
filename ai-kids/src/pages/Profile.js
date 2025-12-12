import React, { useEffect, useState } from "react";
import ScreenSection from "../components/ScreenSection";
import { Link } from "react-router-dom";
import { loadProfile } from "../utils/profileManager";


export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const saved = loadProfile();
    setProfile(saved);
  }, []);

  function handleResetStats() {
    if (!window.confirm("Вы уверены, что хотите сбросить всю статистику? Это действие нельзя отменить.")) {
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
    
    setProfile(defaultProfile);
    alert("Статистика сброшена!");
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
            <li className="text-gray-500">Пока нет достижений</li>
          )}
        </ul>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleResetStats}
            className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl shadow text-white font-semibold transition"
          >
            Сбросить статистику
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
