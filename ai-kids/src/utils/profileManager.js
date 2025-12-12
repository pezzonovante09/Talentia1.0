// Profile management with adaptive difficulty logic

const PROFILE_KEY = "talentia_profile";

export function loadProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) {
    return getDefaultProfile();
  }
  try {
    const profile = JSON.parse(raw);
    // Ensure all required fields exist
    return {
      ...getDefaultProfile(),
      ...profile,
      lastThreeMistakes: profile.lastThreeMistakes || [],
      levelHistory: profile.levelHistory || [1]
    };
  } catch (e) {
    console.error("Error loading profile:", e);
    return getDefaultProfile();
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Error saving profile:", e);
  }
}

function getDefaultProfile() {
  return {
    level: 1,
    tasksCompleted: 0,
    totalMistakes: 0,
    points: 0,
    achievements: [],
    lastThreeMistakes: [],
    levelHistory: [1],
    nextDifficultyModifier: "neutral" // "easier", "neutral", or "harder"
  };
}

/**
 * Calculate new difficulty level based on performance
 * @param {number} currentLevel - Current difficulty level (1-3)
 * @param {number} mistakes - Mistakes in current session
 * @param {number[]} lastThreeMistakes - Array of mistakes from last 3 sessions
 * @returns {number} New difficulty level (1-3)
 */
export function calculateAdaptiveLevel(currentLevel, mistakes, lastThreeMistakes) {
  let newLevel = currentLevel;
  
  // Rule 1: Immediate adjustment based on current session
  if (mistakes >= 3) {
    newLevel = Math.max(1, newLevel - 1);
  } else if (mistakes <= 1) {
    newLevel = Math.min(3, newLevel + 1);
  }
  
  // Rule 2: Stabilize based on last 3 sessions
  if (lastThreeMistakes.length >= 3) {
    const allHigh = lastThreeMistakes.every(m => m >= 3);
    const allLow = lastThreeMistakes.every(m => m <= 1);
    
    if (allHigh) {
      // All last 3 sessions had 3+ mistakes - decrease difficulty
      newLevel = Math.max(1, newLevel - 1);
    } else if (allLow) {
      // All last 3 sessions had 0-1 mistakes - increase difficulty
      newLevel = Math.min(3, newLevel + 1);
    }
  }
  
  // Ensure level stays within bounds
  return Math.max(1, Math.min(3, newLevel));
}

/**
 * Determine difficulty modifier for next session based on mistakes
 * @param {number} mistakes - Mistakes in current session
 * @returns {string} "easier", "neutral", or "harder"
 */
export function calculateDifficultyModifier(mistakes) {
  if (mistakes <= 1) {
    return "harder"; // Doing well → make next session harder
  } else if (mistakes >= 3) {
    return "easier"; // Struggling → make next session easier
  } else {
    return "neutral"; // In between → keep neutral
  }
}

/**
 * Update profile after session completion
 * @param {number} mistakes - Mistakes in completed session
 * @returns {object} Updated profile
 */
export function updateProfileAfterSession(mistakes) {
  const profile = loadProfile();
  
  profile.tasksCompleted += 1;
  profile.totalMistakes += mistakes;
  
  // Update last three mistakes history
  profile.lastThreeMistakes = [...profile.lastThreeMistakes, mistakes].slice(-3);
  
  // Calculate new level (for tracking, but we use modifier for actual difficulty)
  const newLevel = calculateAdaptiveLevel(
    profile.level,
    mistakes,
    profile.lastThreeMistakes
  );
  
  profile.level = newLevel;
  profile.levelHistory.push(newLevel);
  
  // Calculate difficulty modifier for NEXT session
  profile.nextDifficultyModifier = calculateDifficultyModifier(mistakes);
  
  // Calculate points (more points for fewer mistakes)
  profile.points += Math.max(1, 5 - mistakes);
  
  saveProfile(profile);
  return profile;
}

