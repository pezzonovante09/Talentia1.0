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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generateInsights(analyticsData, profileData) {
    if (!analyticsData || !profileData) return;

    // Get real error rates from analytics
    const errorRates = getErrorRateByType();
    const taskTypeStats = analyticsData.taskTypeStats || {};
    const sessionHistory = analyticsData.sessionHistory || [];

    // Calculate strengths and weaknesses based on REAL data
    const strengths = [];
    const weaknesses = [];
    const advice = [];

    // Analyze by task type - use real error rates
    // Strength: error rate < 20% AND at least 3 attempts (to be statistically meaningful)
    // Weakness: error rate > 50% AND at least 3 attempts
    for (const [type, data] of Object.entries(errorRates)) {
      if (data.total >= 3) { // Need at least 3 attempts to make a judgment
        if (data.errorRate < 20) {
          strengths.push({
            type: type,
            errorRate: data.errorRate,
            total: data.total,
            errors: data.errors,
            successRate: 100 - data.errorRate
          });
        } else if (data.errorRate > 50) {
          weaknesses.push({
            type: type,
            errorRate: data.errorRate,
            total: data.total,
            errors: data.errors,
            successRate: 100 - data.errorRate
          });
        }
      }
    }

    // Sort strengths by success rate (highest first)
    strengths.sort((a, b) => b.successRate - a.successRate);
    // Sort weaknesses by error rate (highest first)
    weaknesses.sort((a, b) => b.errorRate - a.errorRate);

    // Overall performance
    const totalTasks = profileData.tasksCompleted || 0;
    const totalMistakes = profileData.totalMistakes || 0;
    const overallErrorRate = totalTasks > 0 ? (totalMistakes / (totalTasks * 3)) * 100 : 0;

    // Generate advice based on REAL data
    if (overallErrorRate < 15) {
      advice.push("Your child is doing excellent! Consider introducing more challenging tasks.");
    } else if (overallErrorRate < 30) {
      advice.push("Good progress! Continue practicing to build confidence.");
    } else {
      advice.push("Your child may need more practice. Focus on the areas with higher error rates.");
    }

    // Specific advice based on weaknesses
    if (weaknesses.length > 0) {
      const weaknessNames = weaknesses.map(w => getTaskTypeName(w.type));
      if (weaknesses.length === 1) {
        advice.push(`Focus on practicing ${weaknessNames[0]}. Your child has a ${weaknesses[0].errorRate.toFixed(1)}% error rate in this area.`);
      } else {
        advice.push(`Focus on practicing: ${weaknessNames.join(", ")}. These areas need more attention.`);
      }
      
      // Add specific tips for each weakness
      weaknesses.forEach(weakness => {
        const tips = getTipsForTaskType(weakness.type);
        if (tips) {
          advice.push(`${getTaskTypeName(weakness.type)}: ${tips}`);
        }
      });
    }

    // Positive reinforcement for strengths
    if (strengths.length > 0) {
      const strengthNames = strengths.map(s => getTaskTypeName(s.type));
      if (strengths.length === 1) {
        advice.push(`Excellent work in ${strengthNames[0]}! Your child has a ${strengths[0].successRate.toFixed(1)}% success rate.`);
      } else {
        advice.push(`Great strengths in: ${strengthNames.join(", ")}. Keep up the good work!`);
      }
    }

    // Recent trend analysis
    if (sessionHistory.length >= 3) {
      const recentMistakes = sessionHistory.slice(-3).map(s => s.mistakes || 0);
      const avgRecent = recentMistakes.reduce((a, b) => a + b, 0) / recentMistakes.length;
      if (avgRecent < 1) {
        advice.push("Recent performance is excellent! Your child is improving.");
      } else if (avgRecent > 2) {
        advice.push("Recent sessions show more mistakes. Consider reviewing basic concepts.");
      }
    }

    // If no data yet
    if (Object.keys(taskTypeStats).length === 0) {
      advice.push("Complete more tasks to get personalized recommendations!");
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

  function getTipsForTaskType(type) {
    const tips = {
      add: "Try using visual aids like counting objects or fingers. Practice with small numbers first.",
      subtract: "Use visual subtraction by removing objects. Start with numbers where the result is positive.",
      multiply: "Think of multiplication as repeated addition. Use groups of objects to visualize.",
      compare: "Count items on each side carefully. Use visual aids to see which side has more.",
      sequence: "Look for the pattern - are numbers increasing or decreasing? By how much?",
      odd: "Look for the item that looks different from the others. Most items should be the same."
    };
    return tips[type] || null;
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
            <div className="space-y-3">
              {insights.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <span className="text-lg font-semibold">{getTaskTypeName(strength.type)}</span>
                      <p className="text-sm text-gray-600">
                        {strength.total} attempts, {strength.total - strength.errors} correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-green-600">{strength.successRate.toFixed(1)}%</span>
                    <p className="text-xs text-gray-500">success rate</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Complete more tasks to identify strengths! (Need at least 3 attempts per task type)</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Areas for Improvement</h2>
          {insights.weaknesses.length > 0 ? (
            <div className="space-y-3">
              {insights.weaknesses.map((weakness, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <span className="text-lg font-semibold">{getTaskTypeName(weakness.type)}</span>
                      <p className="text-sm text-gray-600">
                        {weakness.total} attempts, {weakness.errors} errors
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-red-600">{weakness.errorRate.toFixed(1)}%</span>
                    <p className="text-xs text-gray-500">error rate</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Great job! No major weaknesses identified. (Need at least 3 attempts per task type to identify weaknesses)</p>
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

