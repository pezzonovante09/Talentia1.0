// src/components/ProfileCard.js
import React from "react";

export default function ProfileCard({ profile }) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="text-4xl">🦕</div>
        <div>
          <h2 className="text-xl font-bold">Player</h2>
          <p className="text-sm text-slate-600">Level {profile.level}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-bold">{profile.tasksCompleted}</div>
          <div className="text-xs text-slate-500">Tasks</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{profile.totalMistakes}</div>
          <div className="text-xs text-slate-500">Mistakes</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{profile.points || 0}</div>
          <div className="text-xs text-slate-500">Points</div>
        </div>
      </div>
    </div>
  );
}
