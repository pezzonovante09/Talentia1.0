import React, { useEffect, useState } from "react";
import ScreenSection from "../components/ScreenSection";
import { Link } from "react-router-dom";


export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("talentia_profile"));
    setProfile(saved || {
      level: 1,
      tasksCompleted: 0,
      totalMistakes: 0,
      achievements: []
    });
  }, []);

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

        <h2 className="text-xl font-bold mt-4">Achievements</h2>
        <ul className="space-y-1">
          {(profile.achievements || []).map((a) => (
            <li key={a}>🏅 {a}</li>
          ))}
        </ul>
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
