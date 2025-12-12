import React, { useEffect, useState } from "react";
import ScreenSection from "../components/ScreenSection";
import { Link } from "react-router-dom";
import { loadAnalytics, getRecentErrors, getErrorRateByType } from "../utils/analytics";
import ChatPanel from "../components/ChatPanel";
import useChatAssistant from "../hooks/useChatAssistant.js";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const data = loadAnalytics();
    setAnalytics(data);
  }, []);

  const recentErrors = analytics ? getRecentErrors(20) : [];
  const errorRates = analytics ? getErrorRateByType() : {};

  const taskTypeNames = {
    add: "Addition",
    subtract: "Subtraction",
    multiply: "Multiplication",
    compare: "Comparison",
    sequence: "Sequence",
    odd: "Odd One Out"
  };

  const { messages, isLoading, error, sendMessage } = useChatAssistant({
    question: selectedError?.task || "",
    correct: selectedError?.correctAnswer || "",
    taskType: selectedError?.taskType || "add",
    level: 1,
    mistakes: 0,
    lastThreeMistakes: []
  });

  function handleDiscussError(errorRecord) {
    setSelectedError(errorRecord);
    setShowChat(true);
  }

  if (!analytics) {
    return (
      <ScreenSection>
        <p>Loading...</p>
      </ScreenSection>
    );
  }

  return (
    <ScreenSection variant="meadow">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-emerald-900">Error Analytics</h1>
          <Link to="/">
            <button className="bg-white px-4 py-2 rounded-xl shadow text-emerald-700 font-semibold">
              Back to Home
            </button>
          </Link>
        </div>

        {/* Error Rates by Task Type */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">Error Rates by Task Type</h2>
          {Object.keys(errorRates).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(errorRates).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="font-semibold">{taskTypeNames[type] || type}:</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-500 h-4 rounded-full"
                        style={{ width: `${data.errorRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {data.errorRate.toFixed(1)}% ({data.errors}/{data.total})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data yet. Complete some tasks to see analytics!</p>
          )}
        </div>

        {/* Recent Errors */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">Recent Errors</h2>
          {recentErrors.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentErrors.map((error, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:bg-emerald-50 transition cursor-pointer"
                  onClick={() => handleDiscussError(error)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{error.task}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: {taskTypeNames[error.taskType] || error.taskType} | 
                        Island: {error.islandId || "N/A"}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="text-red-600">Your answer: {error.userAnswer}</span> | 
                        <span className="text-green-600"> Correct: {error.correctAnswer}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(error.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-emerald-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDiscussError(error);
                      }}
                    >
                      Discuss with Tali
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No errors yet. Great job!</p>
          )}
        </div>

        {/* Chat Panel for discussing errors */}
        {showChat && selectedError && (
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Discussing: {selectedError.task}</h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ChatPanel
              question={selectedError.task}
              correctAnswer={selectedError.correctAnswer}
              taskType={selectedError.taskType}
              level={1}
              mistakes={0}
              lastThreeMistakes={[]}
            />
          </div>
        )}
      </div>
    </ScreenSection>
  );
}

