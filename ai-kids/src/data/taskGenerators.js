// src/data/taskGenerators.js
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateEasy() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return {
    type: "add",
    question: `How many is ${a} + ${b}?`,
    correct: a + b,
    options: shuffle([a + b, a + b + 1, Math.max(1, a + b - 1), a + b + 2]),
  };
}

export function generateMedium() {
  // mix of addition/subtraction/comparison
  const kind = Math.random() < 0.5 ? "add" : "compare";
  if (kind === "add") {
    const a = Math.floor(Math.random() * 30) + 1;
    const b = Math.floor(Math.random() * 30) + 1;
    return {
      type: "add",
      question: `How many is ${a} + ${b}?`,
      correct: a + b,
      options: shuffle([a + b, a + b + 2, Math.max(1, a + b - 3), a + b + 5]),
    };
  } else {
    let left = Math.floor(Math.random() * 8) + 2;
    let right;
    do {
      right = Math.floor(Math.random() * 8) + 2;
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
  // shapes / logic / multi-step
  const r = Math.random();
  if (r < 0.5) {
    // multi-add (a + b) - c style
    const a = Math.floor(Math.random() * 30) + 10;
    const b = Math.floor(Math.random() * 30) + 5;
    const c = Math.floor(Math.random() * 10) + 1;
    const correct = a + b - c;
    return {
      type: "compute",
      question: `What is ${a} + ${b} - ${c}?`,
      correct,
      options: shuffle([correct, correct + 2, Math.max(1, correct - 2), correct + 5]),
    };
  } else {
    // find odd among five
    const shapes = ["🔺", "🟦", "🟢", "🟨"];
    const normal = shapes[Math.floor(Math.random() * shapes.length)];
    let odd;
    do {
      odd = shapes[Math.floor(Math.random() * shapes.length)];
    } while (odd === normal);
    const items = shuffle([normal, normal, normal, odd, normal]);
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
