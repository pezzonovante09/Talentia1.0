// Task generators with adaptive difficulty modifiers

// Enhanced shuffle with timestamp-based randomization
function shuffle(arr) {
  // Add timestamp-based seed for extra randomness
  const seed = Date.now() % 1000;
  return [...arr].sort(() => {
    const rand = Math.random() + (seed / 1000);
    return rand - 0.5;
  });
}

// Generate random number with better distribution
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate addition task with adaptive difficulty
 * @param {string} modifier - "easier", "neutral", or "harder"
 * @param {boolean} isIslands4to6 - true if this is for islands 4-6
 */
function generateAdditionTask(modifier = "neutral", isIslands4to6 = false) {
  let a, b;
  
  if (modifier === "easier") {
    // Easier: small numbers 1-10, fully random
    a = randomInt(1, 10);
    b = randomInt(1, 10);
  } else if (modifier === "harder" && isIslands4to6) {
    // Harder on islands 4-6: much larger numbers 30-80
    a = randomInt(30, 80);
    b = randomInt(30, 80);
  } else {
    // Neutral or harder on islands 1-3: medium numbers 1-30
    a = randomInt(1, 30);
    b = randomInt(1, 30);
  }
  
  const sum = a + b;
  
  // More varied distractors - generate multiple options and pick random ones
  let distractorOptions = [];
  if (modifier === "easier") {
    distractorOptions = [1, 2, 3, -1, -2];
  } else if (modifier === "harder") {
    distractorOptions = [2, 3, 5, 7, 10, -2, -3, -5];
  } else {
    distractorOptions = [2, 3, 4, 5, -2, -3];
  }
  
  // Pick 3 random distractors
  const shuffledDistractors = shuffle([...distractorOptions]);
  const dist1 = shuffledDistractors[0];
  const dist2 = shuffledDistractors[1];
  const dist3 = shuffledDistractors[2];
  
  const options = [
    sum,
    Math.max(1, sum + dist1),
    Math.max(1, sum + dist2),
    Math.max(1, sum + dist3)
  ];
  
  // Ensure all options are unique
  const uniqueOptions = [...new Set(options)];
  while (uniqueOptions.length < 4) {
    const extraDist = randomInt(-5, 5);
    if (extraDist !== 0) {
      const newOption = Math.max(1, sum + extraDist);
      if (!uniqueOptions.includes(newOption)) {
        uniqueOptions.push(newOption);
      }
    }
  }
  
  return {
    type: "add",
    question: `How many is ${a} + ${b}?`,
    correct: sum,
    options: shuffle(uniqueOptions.slice(0, 4)),
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
    // Easier: big difference, fully random
    const base = randomInt(2, 10);
    const diff = randomInt(4, 10); // Big difference
    left = base;
    right = base + diff;
    // Randomly swap
    if (Math.random() < 0.5) {
      [left, right] = [right, left];
    }
  } else if (modifier === "harder" && isIslands4to6) {
    // Harder on islands 4-6: very small difference with larger numbers
    const base = randomInt(30, 70);
    const diff = randomInt(1, 2); // Very small difference (1 or 2)
    left = base;
    right = base + diff;
    if (Math.random() < 0.5) {
      [left, right] = [right, left];
    }
  } else {
    // Neutral or harder on islands 1-3: medium difference, fully random
    left = randomInt(2, 25);
    const diff = randomInt(2, 8);
    if (Math.random() < 0.5) {
      right = left + diff;
    } else {
      right = Math.max(1, left - diff);
    }
    // Ensure they're different
    if (left === right) {
      right = left + randomInt(1, 5);
    }
  }
  
  return {
    type: "compare",
    question: `Which side has MORE items?`,
    left,
    right,
    correct: left > right ? "left" : "right",
    options: shuffle(["left", "right"]), // Shuffle for extra randomness
  };
}

/**
 * Generate subtraction task with adaptive difficulty
 * @param {string} modifier - "easier", "neutral", or "harder"
 * @param {boolean} isIslands4to6 - true if this is for islands 4-6
 */
function generateSubtractionTask(modifier = "neutral", isIslands4to6 = false) {
  let a, b;
  
  if (modifier === "easier") {
    // Easier: small numbers, result is positive, fully random
    b = randomInt(1, 8);
    a = randomInt(b + 1, b + 10); // Ensure positive result
  } else if (modifier === "harder" && isIslands4to6) {
    // Harder on islands 4-6: larger numbers
    b = randomInt(20, 60);
    a = randomInt(b + 1, b + 30);
  } else {
    // Neutral or harder on islands 1-3: medium numbers
    b = randomInt(1, 20);
    a = randomInt(b + 1, b + 20);
  }
  
  const result = a - b;
  
  // More varied distractors
  let distractorOptions = [];
  if (modifier === "easier") {
    distractorOptions = [1, 2, 3, -1, -2, a, b];
  } else if (modifier === "harder") {
    distractorOptions = [2, 3, 5, 7, 10, -2, -3, -5, a - b + 1, a + b];
  } else {
    distractorOptions = [2, 3, 4, 5, -2, -3, a, b];
  }
  
  const shuffledDistractors = shuffle([...distractorOptions]);
  const options = [
    result,
    Math.max(0, result + shuffledDistractors[0]),
    Math.max(0, result + shuffledDistractors[1]),
    Math.max(0, result + shuffledDistractors[2])
  ];
  
  // Ensure all options are unique and positive
  const uniqueOptions = [...new Set(options.filter(opt => opt >= 0))];
  while (uniqueOptions.length < 4) {
    const extraDist = randomInt(-3, 5);
    if (extraDist !== 0) {
      const newOption = Math.max(0, result + extraDist);
      if (!uniqueOptions.includes(newOption)) {
        uniqueOptions.push(newOption);
      }
    }
  }
  
  return {
    type: "subtract",
    question: `How many is ${a} - ${b}?`,
    correct: result,
    options: shuffle(uniqueOptions.slice(0, 4)),
  };
}

/**
 * Generate multiplication task (only for hard level)
 * @param {string} modifier - "easier", "neutral", or "harder"
 * @param {boolean} isIslands4to6 - true if this is for islands 4-6
 */
function generateMultiplicationTask(modifier = "neutral", isIslands4to6 = false) {
  let a, b;
  
  if (modifier === "easier") {
    // Easier: small multiplication tables, fully random
    a = randomInt(2, 5);
    b = randomInt(2, 5);
  } else if (modifier === "harder" && isIslands4to6) {
    // Harder on islands 4-6: larger numbers
    a = randomInt(5, 10);
    b = randomInt(5, 10);
  } else {
    // Neutral or harder on islands 1-3: medium numbers
    a = randomInt(2, 6);
    b = randomInt(2, 6);
  }
  
  const result = a * b;
  
  // More varied distractors
  let distractorOptions = [];
  if (modifier === "easier") {
    distractorOptions = [a, b, a + b, a * (b - 1), (a - 1) * b, result + a, result - a];
  } else if (modifier === "harder") {
    distractorOptions = [result + a, result + b, result - a, result - b, a + b, a * (b + 1), (a + 1) * b];
  } else {
    distractorOptions = [result + 2, result - 2, a + b, a * (b - 1), (a - 1) * b, result + a];
  }
  
  const shuffledDistractors = shuffle([...distractorOptions]);
  const options = [
    result,
    Math.max(1, shuffledDistractors[0]),
    Math.max(1, shuffledDistractors[1]),
    Math.max(1, shuffledDistractors[2])
  ];
  
  // Ensure all options are unique
  const uniqueOptions = [...new Set(options)];
  while (uniqueOptions.length < 4) {
    const extraDist = shuffledDistractors[uniqueOptions.length] || randomInt(-5, 10);
    const newOption = Math.max(1, result + extraDist);
    if (!uniqueOptions.includes(newOption)) {
      uniqueOptions.push(newOption);
    }
  }
  
  return {
    type: "multiply",
    question: `How many is ${a} × ${b}?`,
    correct: result,
    options: shuffle(uniqueOptions.slice(0, 4)),
  };
}

/**
 * Generate sequence task (find the pattern)
 * @param {string} modifier - "easier", "neutral", or "harder"
 */
function generateSequenceTask(modifier = "neutral") {
  let sequence, correct, question, step;
  
  // More varied patterns
  const patternType = randomInt(0, 4); // 0-4 different pattern types
  
  if (modifier === "easier") {
    // Easier: simple counting sequences with variations
    const start = randomInt(1, 10);
    step = randomInt(1, 3); // 1, 2, or 3
    sequence = [start, start + step, start + step * 2, "?"];
    correct = start + step * 3;
    question = `What comes next? ${sequence[0]}, ${sequence[1]}, ${sequence[2]}, ?`;
  } else if (modifier === "harder") {
    // Harder: various patterns
    const start = randomInt(2, 15);
    if (patternType === 0) {
      // Skip counting by 2
      step = 2;
      sequence = [start, start + step, start + step * 2, "?"];
      correct = start + step * 3;
    } else if (patternType === 1) {
      // Skip counting by 3
      step = 3;
      sequence = [start, start + step, start + step * 2, "?"];
      correct = start + step * 3;
    } else if (patternType === 2) {
      // Increasing by variable amounts
      const step1 = randomInt(2, 4);
      const step2 = randomInt(2, 4);
      sequence = [start, start + step1, start + step1 + step2, "?"];
      correct = start + step1 + step2 + randomInt(2, 4);
      step = step2; // Use last step for distractors
    } else {
      // Larger steps
      step = randomInt(4, 7);
      sequence = [start, start + step, start + step * 2, "?"];
      correct = start + step * 3;
    }
    question = `What comes next? ${sequence[0]}, ${sequence[1]}, ${sequence[2]}, ?`;
  } else {
    // Neutral: varied patterns
    const start = randomInt(1, 10);
    step = randomInt(1, 5);
    sequence = [start, start + step, start + step * 2, "?"];
    correct = start + step * 3;
    question = `What comes next? ${sequence[0]}, ${sequence[1]}, ${sequence[2]}, ?`;
  }
  
  // Ensure step is defined
  if (!step) {
    step = sequence.length >= 2 ? (sequence[1] - sequence[0]) : 1;
  }
  
  // More varied distractors
  const distractorOptions = [
    correct + 1,
    correct - 1,
    correct + step,
    correct - step,
    correct + step * 2,
    sequence[2] + step
  ];
  
  const shuffledDistractors = shuffle([...distractorOptions]);
  const uniqueDistractors = [...new Set(shuffledDistractors.filter(d => d > 0))].slice(0, 3);
  
  return {
    type: "sequence",
    question,
    correct,
    options: shuffle([correct, ...uniqueDistractors]),
  };
}

/**
 * Generate odd-one-out task with adaptive difficulty
 * @param {string} modifier - "easier", "neutral", or "harder"
 */
function generateOddTask(modifier = "neutral") {
  const allShapes = ["🔺", "🟦", "🟢", "🟨", "🔴", "🟣", "⭐", "💎", "🔷", "🔶", "🟧", "🟩"];
  
  let normal, odd;
  let items;
  
  // Fully random selection - no pre-made pairs
  normal = allShapes[randomInt(0, allShapes.length - 1)];
  const availableShapes = allShapes.filter(s => s !== normal);
  odd = availableShapes[randomInt(0, availableShapes.length - 1)];
  
  if (modifier === "easier") {
    // Easier: fewer items, more obvious
    const normalCount = randomInt(3, 4);
    items = [
      ...Array(normalCount).fill(normal),
      odd
    ];
    // Add 1-2 more normal items randomly
    if (Math.random() < 0.5) {
      items.push(normal);
    }
  } else if (modifier === "harder") {
    // Harder: more items, more subtle
    const normalCount = randomInt(5, 7);
    items = [
      ...Array(normalCount).fill(normal),
      odd,
      ...Array(randomInt(1, 2)).fill(normal)
    ];
  } else {
    // Neutral: medium difficulty
    const normalCount = randomInt(4, 5);
    items = [
      ...Array(normalCount).fill(normal),
      odd,
      ...Array(randomInt(1, 2)).fill(normal)
    ];
  }
  
  // Shuffle items for randomness
  items = shuffle(items);
  
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
    // Level 1: Addition and simple subtraction
    taskType = Math.random() < 0.7 ? "add" : "subtract";
  } else if (level === 2) {
    // Level 2: Mix of addition, subtraction, comparison, and sequences
    const rand = Math.random();
    if (rand < 0.3) {
      taskType = "add";
    } else if (rand < 0.5) {
      taskType = "subtract";
    } else if (rand < 0.75) {
      taskType = "compare";
    } else {
      taskType = "sequence";
    }
  } else {
    // Level 3: Mix of all types including multiplication
    const rand = Math.random();
    if (rand < 0.25) {
      taskType = "add";
    } else if (rand < 0.4) {
      taskType = "subtract";
    } else if (rand < 0.55) {
      taskType = "multiply"; // Multiplication for hard level
    } else if (rand < 0.7) {
      taskType = "compare";
    } else if (rand < 0.85) {
      taskType = "sequence";
    } else {
      taskType = "odd";
    }
  }
  
  // Generate task based on type
  if (taskType === "add") {
    return generateAdditionTask(modifier, isIslands4to6);
  } else if (taskType === "subtract") {
    return generateSubtractionTask(modifier, isIslands4to6);
  } else if (taskType === "multiply") {
    return generateMultiplicationTask(modifier, isIslands4to6);
  } else if (taskType === "compare") {
    return generateCompareTask(modifier, isIslands4to6);
  } else if (taskType === "sequence") {
    return generateSequenceTask(modifier);
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
