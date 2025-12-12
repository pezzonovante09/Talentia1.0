// src/pages/Task.js
import React, { useState, useMemo, useEffect } from "react";
import ScreenSection from "../components/ScreenSection";
import ChatPanel from "../components/ChatPanel";
import { generateTaskByLevel } from "../data/taskGenerators";
import { loadProfile, updateProfileAfterSession } from "../utils/profileManager";

export default function Task({ level = null, onFinish }) {
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [lockedOption, setLockedOption] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(level || 1);
  const [profile, setProfile] = useState(null);

  // Load profile and set level on mount
  useEffect(() => {
    const loadedProfile = loadProfile();
    setProfile(loadedProfile);
    if (!level) {
      setCurrentLevel(loadedProfile.level);
    }
  }, [level]);

  // Get difficulty modifier from profile (determines if tasks should be easier/harder/neutral)
  // This modifier was set based on the PREVIOUS session's performance
  // For the first session, it will be "neutral"
  const difficultyModifier = profile?.nextDifficultyModifier || "neutral";

  // Reset session state when starting a new session
  useEffect(() => {
    setStep(0);
    setMistakes(0);
    setLockedOption(null);
  }, [currentLevel, difficultyModifier]);

  // create 3 tasks once per mount / level with adaptive difficulty modifier
  // Only generate tasks when profile is loaded and we have valid level/modifier
  const tasks = useMemo(() => {
    if (!profile || currentLevel < 1) {
      return [];
    }
    
    // Generate 3 tasks with variety - ensure we get different types if level allows
    const task1 = generateTaskByLevel(currentLevel, difficultyModifier);
    const task2 = generateTaskByLevel(currentLevel, difficultyModifier);
    const task3 = generateTaskByLevel(currentLevel, difficultyModifier);
    
    return [task1, task2, task3];
  }, [currentLevel, difficultyModifier, profile]);

  const q = tasks[step];

  function finishSession() {
    if (!profile) return;
    
    // Update profile with adaptive difficulty
    const updatedProfile = updateProfileAfterSession(mistakes);
    setProfile(updatedProfile);

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

        <ChatPanel
          question={q.question}
          correctAnswer={q.correct}
          taskType={q.type}
          level={currentLevel}
          mistakes={mistakes}
          lastThreeMistakes={profile?.lastThreeMistakes || []}
        />
      </div>
    </ScreenSection>
  );
}
