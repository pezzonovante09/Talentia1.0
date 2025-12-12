import React, { useState, useMemo, useEffect } from "react";
import ScreenSection from "../components/ScreenSection";
import { Link } from "react-router-dom";
import { generateSpecialTask } from "../data/specialTaskGenerators";

export default function SpecialMode() {
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [lockedOption, setLockedOption] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);

  // Generate 3 simple, structured tasks
  // Regenerate when session completes
  const tasks = useMemo(() => {
    return [
      generateSpecialTask("easy"),
      generateSpecialTask("easy"),
      generateSpecialTask("easy")
    ];
  }, [Math.floor(completedTasks / 3)]); // Regenerate every 3 tasks

  const currentTask = tasks[step];

  // Reset when starting new session
  useEffect(() => {
    if (step === 0 && completedTasks > 0) {
      setMistakes(0);
      setLockedOption(null);
      setShowSuccess(false);
    }
  }, [step, completedTasks]);

  function handleAnswer(option) {
    if (lockedOption !== null) return;

    const correct = option === currentTask.correct;

    setLockedOption(option);

    if (!correct) {
      setMistakes(m => m + 1);
      // Visual feedback for wrong answer
      setTimeout(() => {
        setLockedOption(null);
      }, 1500);
      return;
    }

    // Success feedback
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setLockedOption(null);
      
      if (step < 2) {
        setStep(s => s + 1);
      } else {
        // Session complete
        setCompletedTasks(prev => prev + 1);
        setStep(0);
      }
    }, 2000);
  }

  if (!currentTask) return null;

  return (
    <ScreenSection variant="meadow">
      <div className="max-w-2xl mx-auto">
        {/* Header with clear structure */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-lg border-4 border-emerald-300">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-emerald-900">Learning Time</h1>
            <Link to="/">
              <button className="bg-gray-200 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-300">
                Home
              </button>
            </Link>
          </div>
          
          {/* Visual progress indicator */}
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
            Task {step + 1} of 3
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
            {(currentTask.type === "add" || currentTask.type === "subtract") && (
              <div className="flex justify-center items-center gap-4 text-4xl my-4">
                <div className="flex gap-2">
                  {Array(currentTask.num1).fill(0).map((_, i) => (
                    <span key={i}>{currentTask.visual || "🔵"}</span>
                  ))}
                </div>
                <span className="text-3xl font-bold">
                  {currentTask.type === "add" ? "+" : "-"}
                </span>
                <div className="flex gap-2">
                  {Array(currentTask.num2).fill(0).map((_, i) => (
                    <span key={i}>{currentTask.visual || "🔵"}</span>
                  ))}
                </div>
                <span className="text-3xl font-bold">=</span>
                <span className="text-3xl">?</span>
              </div>
            )}

            {/* Visual representation for comparison */}
            {currentTask.type === "compare" && (
              <div className="flex justify-center gap-8 my-4">
                <div className="text-center">
                  <p className="text-xl font-bold mb-2">Left</p>
                  <div className="text-4xl">
                    {Array(currentTask.left).fill(0).map((_, i) => (
                      <span key={i}>{currentTask.visual || "🍎"}</span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold mb-2">Right</p>
                  <div className="text-4xl">
                    {Array(currentTask.right).fill(0).map((_, i) => (
                      <span key={i}>{currentTask.visual || "🍎"}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Visual representation for odd one out */}
            {currentTask.type === "odd" && (
              <div className="flex justify-center gap-3 text-5xl my-4">
                {currentTask.items.map((item, i) => (
                  <span key={i}>{item}</span>
                ))}
              </div>
            )}

            {/* Visual representation for color sorting */}
            {currentTask.type === "color" && (
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
            {currentTask.type === "count" && (
              <div className="flex justify-center gap-2 text-5xl my-4">
                {Array(currentTask.count).fill(0).map((_, i) => (
                  <span key={i}>{currentTask.visual || "🔵"}</span>
                ))}
              </div>
            )}

            {/* Visual representation for pattern */}
            {currentTask.type === "pattern" && (
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
            {currentTask.type === "category" && (
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
            {currentTask.type === "sequence" && (
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

        {/* Session summary */}
        {step === 2 && showSuccess && (
          <div className="mt-6 bg-yellow-50 border-4 border-yellow-400 rounded-xl p-6 text-center">
            <p className="text-2xl font-bold text-yellow-900 mb-2">
              Session Complete! 🎊
            </p>
            <p className="text-lg text-yellow-800">
              You completed {completedTasks + 1} session{completedTasks > 0 ? "s" : ""}!
            </p>
            <p className="text-lg text-yellow-800 mt-2">
              Mistakes: {mistakes}
            </p>
          </div>
        )}
      </div>
    </ScreenSection>
  );
}

