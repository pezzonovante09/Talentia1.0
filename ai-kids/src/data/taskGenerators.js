// src/data/taskGenerators.js
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateEasy() {
  // Level 1: Simple addition with small numbers (1-10)
  // Only addition tasks, very simple
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const sum = a + b;
  return {
    type: "add",
    question: `How many is ${a} + ${b}?`,
    correct: sum,
    options: shuffle([
      sum, 
      sum + 1, 
      Math.max(1, sum - 1), 
      sum + 2
    ]),
  };
}

export function generateMedium() {
  // Level 2: Medium difficulty - larger numbers (1-30) or comparison tasks
  const kind = Math.random() < 0.5 ? "add" : "compare";
  if (kind === "add") {
    const a = Math.floor(Math.random() * 30) + 1;
    const b = Math.floor(Math.random() * 30) + 1;
    const sum = a + b;
    return {
      type: "add",
      question: `How many is ${a} + ${b}?`,
      correct: sum,
      options: shuffle([
        sum, 
        sum + 2, 
        Math.max(1, sum - 3), 
        sum + 5
      ]),
    };
  } else {
    // Comparison tasks - medium difficulty
    let left = Math.floor(Math.random() * 15) + 2;
    let right;
    do {
      right = Math.floor(Math.random() * 15) + 2;
    } while (left === right);
    return {
      type: "compare",
      question: `Which side has MORE items?`,
      left,
      right,
      correct: left > right ? "left" : "right",
      options: ["left", "right"],
    };
  }
}

export function generateHard() {
  // Level 3: Hard difficulty - multi-step operations or pattern recognition
  const r = Math.random();
  if (r < 0.5) {
    // Multi-step computation: (a + b) - c or (a - b) + c
    const operation = Math.random() < 0.5;
    if (operation) {
      // Addition then subtraction
      const a = Math.floor(Math.random() * 30) + 10;
      const b = Math.floor(Math.random() * 30) + 5;
      const c = Math.floor(Math.random() * 15) + 1;
      const correct = a + b - c;
      return {
        type: "compute",
        question: `What is ${a} + ${b} - ${c}?`,
        correct,
        options: shuffle([
          correct, 
          correct + 2, 
          Math.max(1, correct - 2), 
          correct + 5
        ]),
      };
    } else {
      // Subtraction then addition
      const a = Math.floor(Math.random() * 40) + 20;
      const b = Math.floor(Math.random() * 15) + 5;
      const c = Math.floor(Math.random() * 20) + 1;
      const correct = a - b + c;
      return {
        type: "compute",
        question: `What is ${a} - ${b} + ${c}?`,
        correct,
        options: shuffle([
          correct, 
          correct + 3, 
          Math.max(1, correct - 3), 
          correct + 7
        ]),
      };
    }
  } else {
    // Pattern recognition - find odd one out
    const shapes = ["🔺", "🟦", "🟢", "🟨", "🔴", "🟣"];
    const normal = shapes[Math.floor(Math.random() * shapes.length)];
    let odd;
    do {
      odd = shapes[Math.floor(Math.random() * shapes.length)];
    } while (odd === normal);
    // More shapes for harder difficulty
    const items = shuffle([
      normal, normal, normal, normal, 
      odd, normal, normal
    ]);
    return {
      type: "odd",
      question: "Find the DIFFERENT shape:",
      items,
      correct: odd,
    };
  }
}

export function generateTaskByLevel(level) {
  if (level <= 1) return generateEasy();
  if (level === 2) return generateMedium();
  return generateHard();
}
