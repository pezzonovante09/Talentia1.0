// Task generators with adaptive difficulty modifiers

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * Generate addition task with adaptive difficulty
 * @param {string} modifier - "easier", "neutral", or "harder"
 * @param {boolean} isIslands4to6 - true if this is for islands 4-6
 */
function generateAdditionTask(modifier = "neutral", isIslands4to6 = false) {
  let a, b;
  
  if (modifier === "easier") {
    // Easier: small numbers 1-10
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
  } else if (modifier === "harder" && isIslands4to6) {
    // Harder on islands 4-6: much larger numbers 30-80
    a = Math.floor(Math.random() * 51) + 30; // 30-80
    b = Math.floor(Math.random() * 51) + 30; // 30-80
  } else {
    // Neutral or harder on islands 1-3: medium numbers 1-30
    a = Math.floor(Math.random() * 30) + 1;
    b = Math.floor(Math.random() * 30) + 1;
  }
  
  const sum = a + b;
  
  // Adjust distractor difficulty
  let distractorRange;
  if (modifier === "easier") {
    distractorRange = [1, 2]; // Easy distractors
  } else if (modifier === "harder") {
    distractorRange = [2, 5, 7]; // Harder distractors
  } else {
    distractorRange = [2, 3, 5]; // Medium distractors
  }
  
  const options = [
    sum,
    sum + distractorRange[0],
    Math.max(1, sum - distractorRange[0]),
    sum + (distractorRange[1] || distractorRange[0])
  ];
  
  return {
    type: "add",
    question: `How many is ${a} + ${b}?`,
    correct: sum,
    options: shuffle(options),
  };
}

/**
 * Generate comparison task with adaptive difficulty
 * @param {string} modifier - "easier", "neutral", or "harder"
 * @param {boolean} isIslands4to6 - true if this is for islands 4-6
 */
function generateCompareTask(modifier = "neutral", isIslands4to6 = false) {
  let left, right;
  
  if (modifier === "easier") {
    // Easier: big difference (e.g., 3 vs 9, 2 vs 8)
    const base = Math.floor(Math.random() * 5) + 2; // 2-6
    const diff = Math.floor(Math.random() * 5) + 4; // 4-8 difference
    left = base;
    right = base + diff;
    // Ensure they're different
    if (Math.random() < 0.5) {
      [left, right] = [right, left];
    }
  } else if (modifier === "harder" && isIslands4to6) {
    // Harder on islands 4-6: very small difference with larger numbers (e.g., 45 vs 46, 67 vs 68)
    const base = Math.floor(Math.random() * 40) + 30; // 30-69
    left = base;
    right = base + 1; // Difference of 1
    if (Math.random() < 0.5) {
      [left, right] = [right, left];
    }
  } else {
    // Neutral or harder on islands 1-3: medium difference
    left = Math.floor(Math.random() * 15) + 2; // 2-16
    do {
      right = Math.floor(Math.random() * 15) + 2; // 2-16
    } while (left === right);
  }
  
  return {
    type: "compare",
    question: `Which side has MORE items?`,
    left,
    right,
    correct: left > right ? "left" : "right",
    options: ["left", "right"],
  };
}

/**
 * Generate odd-one-out task with adaptive difficulty
 * @param {string} modifier - "easier", "neutral", or "harder"
 */
function generateOddTask(modifier = "neutral") {
  const allShapes = ["🔺", "🟦", "🟢", "🟨", "🔴", "🟣", "⭐", "💎"];
  
  let normal, odd;
  let items;
  
  if (modifier === "easier") {
    // Easier: very obvious difference - use completely different shape categories
    const easyPairs = [
      [["🔺", "🔺", "🔺"], "🟦"], // Triangles vs square
      [["🟦", "🟦", "🟦"], "🔺"], // Squares vs triangle
      [["🟢", "🟢", "🟢"], "🔴"], // Green vs red
      [["🔴", "🔴", "🔴"], "🟢"], // Red vs green
    ];
    const pair = easyPairs[Math.floor(Math.random() * easyPairs.length)];
    normal = pair[0][0];
    odd = pair[1];
    items = shuffle([...pair[0], odd, ...pair[0].slice(0, 2)]);
  } else if (modifier === "harder") {
    // Harder: subtle difference - similar shapes or colors
    normal = allShapes[Math.floor(Math.random() * allShapes.length)];
    // Pick a similar but different shape
    const similarShapes = allShapes.filter(s => s !== normal);
    odd = similarShapes[Math.floor(Math.random() * similarShapes.length)];
    // More items, more subtle
    items = shuffle([
      normal, normal, normal, normal, normal,
      odd, normal, normal
    ]);
  } else {
    // Neutral: medium difficulty
    normal = allShapes[Math.floor(Math.random() * allShapes.length)];
    do {
      odd = allShapes[Math.floor(Math.random() * allShapes.length)];
    } while (odd === normal);
    items = shuffle([
      normal, normal, normal,
      odd, normal, normal
    ]);
  }
  
  return {
    type: "odd",
    question: "Find the DIFFERENT shape:",
    items,
    correct: odd,
  };
}

/**
 * Generate a task based on level and difficulty modifier
 * @param {number} level - Base level (1-3)
 * @param {string} modifier - "easier", "neutral", or "harder"
 * @param {boolean} isIslands4to6 - true if this is for islands 4-6
 */
export function generateTaskByLevel(level, modifier = "neutral", isIslands4to6 = false) {
  // Determine task type based on level
  let taskType;
  
  if (level <= 1) {
    // Level 1: Only addition
    taskType = "add";
  } else if (level === 2) {
    // Level 2: Mix of addition and comparison
    taskType = Math.random() < 0.5 ? "add" : "compare";
  } else {
    // Level 3: Mix of all types
    const rand = Math.random();
    if (rand < 0.4) {
      taskType = "add";
    } else if (rand < 0.7) {
      taskType = "compare";
    } else {
      taskType = "odd";
    }
  }
  
  // Generate task based on type
  if (taskType === "add") {
    return generateAdditionTask(modifier, isIslands4to6);
  } else if (taskType === "compare") {
    return generateCompareTask(modifier, isIslands4to6);
  } else {
    return generateOddTask(modifier);
  }
}

// Legacy exports for backward compatibility
export function generateEasy() {
  return generateTaskByLevel(1, "easier");
}

export function generateMedium() {
  return generateTaskByLevel(2, "neutral");
}

export function generateHard() {
  return generateTaskByLevel(3, "harder");
}
