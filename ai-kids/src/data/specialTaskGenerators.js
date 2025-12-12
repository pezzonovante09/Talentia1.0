// Special task generators for children with special needs
// Based on TEACCH methodology: simple, structured, visual

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const visuals = ["🔵", "🟢", "🔴", "🟡", "🟣", "🟠"];

/**
 * Generate simple addition task with visual support
 */
function generateSimpleAddition() {
  // Very small numbers: 1-5
  const a = Math.floor(Math.random() * 5) + 1; // 1-5
  const b = Math.floor(Math.random() * 5) + 1; // 1-5
  const sum = a + b;
  const visual = visuals[Math.floor(Math.random() * visuals.length)];

  // Simple distractors: close to correct answer
  const options = [
    sum,
    sum + 1,
    Math.max(1, sum - 1),
    sum + 2
  ];

  return {
    type: "add",
    question: "How many in total?",
    num1: a,
    num2: b,
    correct: sum,
    options: shuffle(options),
    visual: visual
  };
}

/**
 * Generate simple subtraction task with visual support
 */
function generateSimpleSubtraction() {
  // Start with small number, subtract smaller
  const a = Math.floor(Math.random() * 5) + 3; // 3-7
  const b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
  const result = a - b;
  const visual = visuals[Math.floor(Math.random() * visuals.length)];

  const options = [
    result,
    result + 1,
    Math.max(0, result - 1),
    result + 2
  ];

  return {
    type: "subtract",
    question: "How many are left?",
    num1: a,
    num2: b,
    correct: result,
    options: shuffle(options),
    visual: visual
  };
}

/**
 * Generate simple comparison task
 */
function generateSimpleComparison() {
  // Clear difference between numbers
  const left = Math.floor(Math.random() * 3) + 2; // 2-4
  const right = Math.floor(Math.random() * 3) + 5; // 5-7
  // Randomly swap to avoid always left > right
  const finalLeft = Math.random() < 0.5 ? Math.max(left, right) : Math.min(left, right);
  const finalRight = finalLeft === left ? right : left;
  const visual = visuals[Math.floor(Math.random() * visuals.length)];

  return {
    type: "compare",
    question: "Which side has MORE?",
    left: finalLeft,
    right: finalRight,
    correct: finalLeft > finalRight ? "left" : "right",
    options: ["left", "right"],
    visual: visual
  };
}

/**
 * Generate simple odd-one-out task
 */
function generateSimpleOdd() {
  const shapes = ["🔺", "🟦", "🟢", "🟨", "🔴"];
  const normal = shapes[Math.floor(Math.random() * shapes.length)];
  let odd;
  do {
    odd = shapes[Math.floor(Math.random() * shapes.length)];
  } while (odd === normal);

  // Simple pattern: 3 same, 1 different
  const items = [normal, normal, normal, odd];

  return {
    type: "odd",
    question: "Find the DIFFERENT one:",
    items: shuffle(items),
    correct: odd
  };
}

/**
 * Generate a special task based on difficulty
 * All tasks are simplified for special needs
 */
export function generateSpecialTask(difficulty = "easy") {
  // For special mode, we keep it simple
  // Rotate between task types
  const types = ["add", "subtract", "compare", "odd"];
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case "add":
      return generateSimpleAddition();
    case "subtract":
      return generateSimpleSubtraction();
    case "compare":
      return generateSimpleComparison();
    case "odd":
      return generateSimpleOdd();
    default:
      return generateSimpleAddition();
  }
}

