// src/pages/Task.js
import React, { useState, useMemo, useEffect } from "react";
import ScreenSection from "../components/ScreenSection";
import ChatPanel from "../components/ChatPanel";
import { generateTaskByLevel } from "../data/taskGenerators";
import { loadProfile, updateProfileAfterSession } from "../utils/profileManager";

export default function Task({ level = null, onFinish, islandId = null }) {
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

  // Get difficulty modifier from profile or progress
  // For islands 1-3: use profile modifier
  // For islands 4-6: use stored difficulty from progress
  const progress = JSON.parse(localStorage.getItem("progress") || "{}");
  let difficultyModifier = profile?.nextDifficultyModifier || "neutral";
  
  // If on islands 4-6, use the stored difficulty
  if (islandId && islandId >= 4 && progress.nextIslandsDifficulty) {
    const storedDifficulty = progress.nextIslandsDifficulty;
    // Map stored difficulty to modifier
    if (storedDifficulty === "hard") {
      difficultyModifier = "harder";
    } else if (storedDifficulty === "medium") {
      difficultyModifier = "neutral";
    } else if (storedDifficulty === "easy") {
      difficultyModifier = "easier";
    }
  }

  // Reset session state when starting a new session (level or modifier changes)
  useEffect(() => {
    setStep(0);
    setMistakes(0);
    setLockedOption(null);
  }, [currentLevel, difficultyModifier]);

  // Generate 3 tasks where each is progressively harder:
  // Task 1: Easy (level 1)
  // Task 2: Medium (level 2)
  // Task 3: Hard (level 3)
  const tasks = useMemo(() => {
    if (!profile || currentLevel < 1) {
      return [];
    }
    
    // Each task is progressively harder
    const task1 = generateTaskByLevel(1, difficultyModifier); // Easy
    const task2 = generateTaskByLevel(2, difficultyModifier); // Medium
    const task3 = generateTaskByLevel(3, difficultyModifier); // Hard
    
    return [task1, task2, task3];
  }, [currentLevel, difficultyModifier, profile]);

  // Only show task if step is within bounds (0, 1, or 2)
  const q = step < tasks.length ? tasks[step] : null;

  function finishSession() {
    if (!profile) return;
    
    // Update profile with adaptive difficulty
    const updatedProfile = updateProfileAfterSession(mistakes);
    setProfile(updatedProfile);
    
    // Call onFinish to navigate back to map
    if (typeof onFinish === "function") {
      onFinish(mistakes);
    }
  }

  function handleAnswer(option) {
    if (!q) return; // Safety check
    
    const correct = option === q.correct;

    setLockedOption(option);

    if (!correct) {
      setMistakes(m => m + 1);
      setTimeout(() => setLockedOption(null), 700);
      return;
    }

    // If this is the last task (step 2), finish session and generate new tasks
    if (step === 2) {
      setTimeout(() => {
        finishSession();
      }, 400);
    } else {
      // Move to next task
      setTimeout(() => {
        setLockedOption(null);
        setStep(s => s + 1);
      }, 400);
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
