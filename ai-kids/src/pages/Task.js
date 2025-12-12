// src/pages/Task.js
import React, { useState, useMemo } from "react";
import ScreenSection from "../components/ScreenSection";
import ChatPanel from "../components/ChatPanel";
import { generateTaskByLevel } from "../data/taskGenerators";

function loadProfile() {
  const raw = localStorage.getItem("talentia_profile");
  return raw ? JSON.parse(raw) : null;
}
function saveProfile(profile) {
  localStorage.setItem("talentia_profile", JSON.stringify(profile));
}

export default function Task({ level = 1, onFinish }) {
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [lockedOption, setLockedOption] = useState(null);

  // create 3 tasks once per mount / level
  const tasks = useMemo(() => [
    generateTaskByLevel(level),
    generateTaskByLevel(level),
    generateTaskByLevel(level)
  ], [level]);

  const q = tasks[step];

  function finishSession() {
    const profile = loadProfile() || {
      level: 1,
      tasksCompleted: 0,
      totalMistakes: 0,
      points: 0,
      achievements: [],
      lastThreeMistakes: [],
      levelHistory: [1]
    };

    profile.tasksCompleted += 1;
    profile.totalMistakes += mistakes;
    profile.lastThreeMistakes = [...profile.lastThreeMistakes, mistakes].slice(-3);

    let newLevel = profile.level;
    if (mistakes <= 1) newLevel = Math.min(3, newLevel + 1);
    else if (mistakes >= 3) newLevel = Math.max(1, newLevel - 1);

    profile.levelHistory.push(newLevel);
    profile.level = newLevel;

    profile.points += Math.max(1, 5 - mistakes);

    saveProfile(profile);

    if (typeof onFinish === "function") onFinish();
  }

  function handleAnswer(option) {
    const correct = option === q.correct;

    setLockedOption(option);

    if (!correct) {
      setMistakes(m => m + 1);
      setTimeout(() => setLockedOption(null), 700);
      return;
    }

    if (step < 2) {
      setTimeout(() => {
        setLockedOption(null);
        setStep(s => s + 1);
      }, 400);
    } else {
      finishSession();
    }
  }

  if (!q) return null;

  return (
    <ScreenSection variant="meadow">
      <div className="max-w-lg mx-auto text-center space-y-4">

        <h2 className="text-2xl font-bold">Task {step + 1} of 3</h2>
        <p className="text-lg font-semibold">{q.question}</p>

        {/* ADDITIONAL TASK TYPES HANDLE */}
        {(q.type === "add" || q.type === "compute") && (
          <div className="grid grid-cols-2 gap-3">
            {q.options.map(opt => (
              <button
                key={opt}
                disabled={lockedOption !== null}
                onClick={() => handleAnswer(opt)}
                className={`p-4 border rounded-xl text-xl font-bold ${
                  lockedOption === opt ? "bg-gray-300" : "bg-white hover:bg-emerald-100"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === "compare" && (
          <div className="space-y-3">
            <p className="text-xl">Left: {q.left}</p>
            <p className="text-xl">Right: {q.right}</p>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map(opt => (
                <button
                  key={opt}
                  disabled={lockedOption !== null}
                  onClick={() => handleAnswer(opt)}
                  className={`p-4 border rounded-xl font-bold ${
                    lockedOption === opt ? "bg-gray-300" : "bg-white hover:bg-emerald-100"
                  }`}
                >
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {q.type === "odd" && (
          <div className="flex justify-center gap-3 text-4xl">
            {q.items.map((shape, i) => (
              <button
                key={i}
                disabled={lockedOption !== null}
                onClick={() => handleAnswer(shape)}
                className={`p-4 rounded-xl shadow ${
                  lockedOption === shape ? "bg-gray-300" : "bg-white hover:bg-emerald-100"
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        )}

        {/* FIXED: correctAnswer instead of correct */}
        <ChatPanel
          question={q.question}
          correctAnswer={q.correct}
          attempts={step + 1}
          mistakes={mistakes}
        />
      </div>
    </ScreenSection>
  );
}
