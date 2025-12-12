import React, { useEffect, useState } from "react";
import ScreenSection from "../components/ScreenSection";
import { Link } from "react-router-dom";
import { loadAnalytics, getErrorRateByType } from "../utils/analytics";
import { loadProfile } from "../utils/profileManager";

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const analyticsData = loadAnalytics();
    const profileData = loadProfile();
    setAnalytics(analyticsData);
    setProfile(profileData);
    generateInsights(analyticsData, profileData);
  }, []);

  function generateInsights(analyticsData, profileData) {
    if (!analyticsData || !profileData) return;

    const errorRates = getErrorRateByType();
    const errorHistory = analyticsData.errorHistory || [];
    const sessionHistory = analyticsData.sessionHistory || [];

    // Calculate strengths and weaknesses
    const strengths = [];
    const weaknesses = [];
    const advice = [];

    // Analyze by task type
    for (const [type, data] of Object.entries(errorRates)) {
      if (data.errorRate < 20) {
        strengths.push(type);
      } else if (data.errorRate > 50) {
        weaknesses.push(type);
      }
    }

    // Overall performance
    const totalTasks = profileData.tasksCompleted || 0;
    const totalMistakes = profileData.totalMistakes || 0;
    const overallErrorRate = totalTasks > 0 ? (totalMistakes / (totalTasks * 3)) * 100 : 0;

    // Generate advice
    if (overallErrorRate < 15) {
      advice.push("Your child is doing excellent! Consider introducing more challenging tasks.");
    } else if (overallErrorRate < 30) {
      advice.push("Good progress! Continue practicing to build confidence.");
    } else {
      advice.push("Your child may need more practice. Focus on the areas with higher error rates.");
    }

    if (weaknesses.length > 0) {
      advice.push(`Focus on practicing: ${weaknesses.map(t => getTaskTypeName(t)).join(", ")}`);
    }

    if (strengths.length > 0) {
      advice.push(`Great strengths in: ${strengths.map(t => getTaskTypeName(t)).join(", ")}`);
    }

    // Recent trend
    if (sessionHistory.length >= 3) {
      const recentMistakes = sessionHistory.slice(-3).map(s => s.mistakes);
      const avgRecent = recentMistakes.reduce((a, b) => a + b, 0) / recentMistakes.length;
      if (avgRecent < 1) {
        advice.push("Recent performance is excellent! Your child is improving.");
      } else if (avgRecent > 2) {
        advice.push("Recent sessions show more mistakes. Consider reviewing basic concepts.");
      }
    }

    setInsights({
      strengths,
      weaknesses,
      advice,
      overallErrorRate,
      totalTasks,
      totalMistakes
    });
  }

  function getTaskTypeName(type) {
    const names = {
      add: "Addition",
      subtract: "Subtraction",
      multiply: "Multiplication",
      compare: "Comparison",
      sequence: "Sequence",
      odd: "Odd One Out"
    };
    return names[type] || type;
  }

  if (!analytics || !profile || !insights) {
    return (
      <ScreenSection>
        <p>Loading...</p>
      </ScreenSection>
    );
  }

  return (
    <ScreenSection variant="sky">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-emerald-900">Parent Report</h1>
          <Link to="/">
            <button className="bg-white px-4 py-2 rounded-xl shadow text-emerald-700 font-semibold">
              Back to Home
            </button>
          </Link>
        </div>

        {/* Overall Statistics */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{profile.tasksCompleted}</p>
              <p className="text-gray-600">Sessions Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{profile.tasksCompleted * 3}</p>
              <p className="text-gray-600">Total Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{insights.overallErrorRate.toFixed(1)}%</p>
              <p className="text-gray-600">Error Rate</p>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Strengths</h2>
          {insights.strengths.length > 0 ? (
            <div className="space-y-2">
              {insights.strengths.map((type, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg">{getTaskTypeName(type)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Complete more tasks to identify strengths!</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Areas for Improvement</h2>
          {insights.weaknesses.length > 0 ? (
            <div className="space-y-2">
              {insights.weaknesses.map((type, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-lg">{getTaskTypeName(type)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Great job! No major weaknesses identified.</p>
          )}
        </div>

        {/* Advice */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">Recommendations</h2>
          <div className="space-y-3">
            {insights.advice.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenSection>
  );
}

