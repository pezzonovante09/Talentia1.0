import React, { useState, useMemo, useEffect, useRef } from "react";
import ScreenSection from "../components/ScreenSection";
import { Link } from "react-router-dom";
import { generateSpecialTask } from "../data/specialTaskGenerators";

export default function SpecialMode() {
  const [level, setLevel] = useState(1); // 1, 2, or 3
  const [step, setStep] = useState(0); // 0, 1, or 2 (task within level)
  const [mistakes, setMistakes] = useState(0);
  const [lockedOption, setLockedOption] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [levelMistakes, setLevelMistakes] = useState(0); // Mistakes in current level
  const timeoutRef = useRef(null);

  // Generate 3 tasks for current level
  const tasks = useMemo(() => {
    const difficulty = level === 1 ? "easy" : level === 2 ? "medium" : "hard";
    try {
      const taskList = [
        generateSpecialTask(difficulty, level),
        generateSpecialTask(difficulty, level),
        generateSpecialTask(difficulty, level)
      ];
      // Validate all tasks have required properties
      return taskList.filter(task => 
        task && 
        task.type && 
        task.question && 
        task.correct !== undefined && 
        Array.isArray(task.options) && 
        task.options.length > 0
      );
    } catch (error) {
      console.error("Error generating tasks:", error);
      return [];
    }
  }, [level]);

  const currentTask = tasks && tasks.length > 0 && step >= 0 && step < tasks.length ? tasks[step] : null;

  // Reset when starting new level
  useEffect(() => {
    // Only reset when level changes
    // Use functional updates to avoid stale closures
    setLevelMistakes(0);
    setLockedOption(null);
    setShowSuccess(false);
    setStep(0); // Reset step when level changes
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [level]); // Only depend on level, not step

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleAnswer(option) {
    if (lockedOption !== null || !currentTask) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const correct = option === currentTask.correct;

    setLockedOption(option);

    if (!correct) {
      setMistakes(m => m + 1);
      setLevelMistakes(m => m + 1);
      // Visual feedback for wrong answer
      timeoutRef.current = setTimeout(() => {
        setLockedOption(null);
        timeoutRef.current = null;
      }, 1500);
      return;
    }

    // Success feedback
    setShowSuccess(true);
    timeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
      setLockedOption(null);
      
      if (step < 2) {
        // Move to next task in same level
        setStep(s => s + 1);
      } else {
        // Level complete - move to next level
        if (level < 3) {
          setLevel(l => l + 1);
          setStep(0);
          setLevelMistakes(0);
        } else {
          // All 3 levels complete - restart from level 1
          setLevel(1);
          setStep(0);
          setLevelMistakes(0);
          setMistakes(0);
        }
      }
      timeoutRef.current = null;
    }, 2000);
  }

  // Early return if no valid task - use useMemo to prevent re-renders
  const isValidTask = useMemo(() => {
    return currentTask && 
           currentTask.options && 
           Array.isArray(currentTask.options) && 
           currentTask.options.length > 0 &&
           currentTask.correct !== undefined &&
           currentTask.question;
  }, [currentTask]);

  if (!isValidTask) {
    return (
      <ScreenSection variant="meadow">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl">Loading task...</p>
          <button 
            onClick={() => {
              setStep(0);
              setLevel(1);
            }}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg"
          >
            Reset
          </button>
        </div>
      </ScreenSection>
    );
  }

  return (
    <ScreenSection variant="meadow">
      <div className="max-w-2xl mx-auto">
        {/* Header with clear structure */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-lg border-4 border-emerald-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Learning Time</h1>
              <p className="text-lg font-semibold text-blue-600">Level {level} of 3</p>
            </div>
            <Link to="/">
              <button className="bg-gray-200 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-300">
                Home
              </button>
            </Link>
          </div>
          
          {/* Level progress indicator */}
          <div className="mt-4 mb-2">
            <div className="flex gap-2 mb-2">
              {[1, 2, 3].map((lvl) => (
                <div
                  key={lvl}
                  className={`flex-1 h-4 rounded-full border-2 ${
                    lvl < level
                      ? "bg-green-500 border-green-600"
                      : lvl === level
                      ? "bg-blue-500 border-blue-600"
                      : "bg-gray-200 border-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              Level {level} Progress
            </p>
          </div>

          {/* Task progress indicator within level */}
          <div className="mt-4 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full border-2 ${
                  i < step
                    ? "bg-green-500 border-green-600"
                    : i === step
                    ? "bg-blue-500 border-blue-600 animate-pulse"
                    : "bg-gray-200 border-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-center mt-2 text-lg font-semibold text-emerald-800">
            Task {step + 1} of 3 (Level {level})
          </p>
        </div>

        {/* Task card with clear visual structure */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-4 border-blue-300">
          {/* Clear, simple question */}
          <div className="text-center mb-6">
            <p className="text-3xl font-bold text-emerald-900 mb-2">
              {currentTask.question}
            </p>
            
            {/* Visual representation for addition/subtraction */}
            {(currentTask.type === "add" || currentTask.type === "subtract") && currentTask.num1 !== undefined && currentTask.num2 !== undefined && (
              <div className="flex justify-center items-center gap-4 text-4xl my-4">
                <div className="flex gap-2">
                  {Array(Math.max(0, Math.min(currentTask.num1 || 0, 10))).fill(0).map((_, i) => (
                    <span key={i}>{currentTask.visual || "🔵"}</span>
                  ))}
                </div>
                <span className="text-3xl font-bold">
                  {currentTask.type === "add" ? "+" : "-"}
                </span>
                <div className="flex gap-2">
                  {Array(Math.max(0, Math.min(currentTask.num2 || 0, 10))).fill(0).map((_, i) => (
                    <span key={i}>{currentTask.visual || "🔵"}</span>
                  ))}
                </div>
                <span className="text-3xl font-bold">=</span>
                <span className="text-3xl">?</span>
              </div>
            )}

            {/* Visual representation for comparison */}
            {currentTask.type === "compare" && currentTask.left !== undefined && currentTask.right !== undefined && (
              <div className="flex justify-center gap-8 my-4">
                <div className="text-center">
                  <p className="text-xl font-bold mb-2">Left</p>
                  <div className="text-4xl">
                    {Array(Math.max(0, Math.min(currentTask.left || 0, 10))).fill(0).map((_, i) => (
                      <span key={i}>{currentTask.visual || "🍎"}</span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold mb-2">Right</p>
                  <div className="text-4xl">
                    {Array(Math.max(0, Math.min(currentTask.right || 0, 10))).fill(0).map((_, i) => (
                      <span key={i}>{currentTask.visual || "🍎"}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Visual representation for odd one out */}
            {currentTask.type === "odd" && currentTask.items && Array.isArray(currentTask.items) && (
              <div className="flex justify-center gap-3 text-5xl my-4">
                {currentTask.items.map((item, i) => (
                  <span key={i}>{item}</span>
                ))}
              </div>
            )}

            {/* Visual representation for color sorting */}
            {currentTask.type === "color" && currentTask.items && Array.isArray(currentTask.items) && (
              <div className="flex justify-center gap-3 text-5xl my-4">
                {currentTask.items.map((item, i) => (
                  <span key={i}>{item}</span>
                ))}
              </div>
            )}

            {/* Visual representation for matching */}
            {currentTask.type === "match" && (
              <div className="flex flex-col items-center gap-4 my-4">
                <div className="text-6xl mb-2">{currentTask.target}</div>
                <p className="text-xl font-bold text-blue-800">Find the same:</p>
              </div>
            )}

            {/* Visual representation for counting */}
            {currentTask.type === "count" && currentTask.count !== undefined && (
              <div className="flex justify-center gap-2 text-5xl my-4">
                {Array(Math.max(0, Math.min(currentTask.count || 0, 10))).fill(0).map((_, i) => (
                  <span key={i}>{currentTask.visual || "🔵"}</span>
                ))}
              </div>
            )}

            {/* Visual representation for pattern */}
            {currentTask.type === "pattern" && currentTask.items && Array.isArray(currentTask.items) && (
              <div className="flex justify-center gap-3 text-5xl my-4">
                {currentTask.items.map((item, i) => (
                  <span key={i} className={item === "?" ? "text-3xl font-bold text-red-600" : ""}>
                    {item}
                  </span>
                ))}
              </div>
            )}

            {/* Visual representation for size comparison */}
            {currentTask.type === "size" && (
              <div className="flex justify-center gap-8 my-4">
                <div className="text-6xl">{currentTask.bigItem}</div>
                <div className="text-4xl">{currentTask.smallItem}</div>
              </div>
            )}

            {/* Visual representation for category */}
            {currentTask.type === "category" && currentTask.categoryItems && Array.isArray(currentTask.categoryItems) && (
              <div className="flex flex-col items-center gap-4 my-4">
                <div className="flex gap-3 text-5xl">
                  {currentTask.categoryItems.map((item, i) => (
                    <span key={i}>{item}</span>
                  ))}
                </div>
                <p className="text-xl font-bold text-blue-800">Which one belongs?</p>
              </div>
            )}

            {/* Visual representation for sequence */}
            {currentTask.type === "sequence" && currentTask.numbers && Array.isArray(currentTask.numbers) && (
              <div className="flex justify-center items-center gap-3 text-4xl my-4">
                {currentTask.numbers.map((num, i) => (
                  <span key={i} className="font-bold">{num}</span>
                ))}
                <span className="text-3xl font-bold text-red-600">?</span>
              </div>
            )}
          </div>

          {/* Success message */}
          {showSuccess && (
            <div className="bg-green-100 border-4 border-green-500 rounded-lg p-4 mb-4 text-center">
              <p className="text-3xl mb-2">🎉 Great Job! 🎉</p>
              <p className="text-xl font-bold text-green-800">You got it right!</p>
            </div>
          )}

          {/* Answer options - large, clear buttons */}
          <div className="grid grid-cols-2 gap-4">
            {currentTask.options.map((opt, idx) => {
              const isSelected = lockedOption === opt;
              const isCorrect = opt === currentTask.correct;
              let bgColor = "bg-white hover:bg-emerald-100";
              
              if (isSelected) {
                bgColor = isCorrect ? "bg-green-400 border-4 border-green-600" : "bg-red-400 border-4 border-red-600";
              }

              return (
                <button
                  key={idx}
                  disabled={lockedOption !== null}
                  onClick={() => handleAnswer(opt)}
                  className={`p-6 border-4 rounded-xl text-3xl font-bold transition-all ${bgColor} ${
                    lockedOption !== null && !isSelected ? "opacity-50" : ""
                  }`}
                  style={{
                    minHeight: "100px",
                    borderColor: isSelected 
                      ? (isCorrect ? "#16a34a" : "#dc2626")
                      : "#d1d5db"
                  }}
                >
                  {typeof opt === "string" && opt.length > 10 ? opt.toUpperCase() : opt}
                </button>
              );
            })}
          </div>

          {/* Visual instruction */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <p className="text-center text-lg font-semibold text-blue-900">
              👆 Click the correct answer
            </p>
          </div>
        </div>

        {/* Level completion message */}
        {step === 2 && showSuccess && level < 3 && (
          <div className="mt-6 bg-yellow-50 border-4 border-yellow-400 rounded-xl p-6 text-center">
            <p className="text-2xl font-bold text-yellow-900 mb-2">
              Level {level} Complete! 🎊
            </p>
            <p className="text-lg text-yellow-800">
              Great job! Moving to Level {level + 1}...
            </p>
            <p className="text-lg text-yellow-800 mt-2">
              Mistakes in this level: {levelMistakes}
            </p>
          </div>
        )}

        {/* All levels complete */}
        {step === 2 && showSuccess && level === 3 && (
          <div className="mt-6 bg-purple-50 border-4 border-purple-400 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-purple-900 mb-2">
              All Levels Complete! 🏆🎉
            </p>
            <p className="text-xl text-purple-800 mb-2">
              You finished all 3 levels!
            </p>
            <p className="text-lg text-purple-800">
              Total mistakes: {mistakes}
            </p>
            <p className="text-lg text-purple-800 mt-2">
              Starting over from Level 1...
            </p>
          </div>
        )}
      </div>
    </ScreenSection>
  );
}

