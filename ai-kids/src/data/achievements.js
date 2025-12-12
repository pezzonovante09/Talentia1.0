// src/data/achievements.js
export const ACHIEVEMENTS = [
  { id: "first", title: "First Steps", desc: "Complete your first task" },
  { id: "no_mistakes_3", title: "Flawless Trio", desc: "Complete 3 tasks in a row with 0 mistakes" },
  { id: "level_up", title: "Level Up!", desc: "Increase your level" },
  { id: "ten_tasks", title: "Math Explorer", desc: "Complete 10 tasks" },
];

export function evaluateAchievements(profile) {
  const unlocked = new Set(profile.achievements || []);
  if (profile.tasksCompleted >= 1) unlocked.add("first");
  if (profile.lastThreeMistakes && profile.lastThreeMistakes.every(m => m === 0)) unlocked.add("no_mistakes_3");
  if (profile.levelHistory && profile.levelHistory.length > 1 && profile.levelHistory[profile.levelHistory.length - 1] > profile.levelHistory[profile.levelHistory.length - 2]) unlocked.add("level_up");
  if (profile.tasksCompleted >= 10) unlocked.add("ten_tasks");
  return Array.from(unlocked);
}
