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
 * Generate color sorting task
 */
function generateColorSort() {
  const colors = [
    { name: "red", emoji: "🔴" },
    { name: "blue", emoji: "🔵" },
    { name: "green", emoji: "🟢" },
    { name: "yellow", emoji: "🟡" }
  ];
  
  const targetColor = colors[Math.floor(Math.random() * colors.length)];
  const otherColors = colors.filter(c => c.name !== targetColor.name);
  
  // Create items: 3 of target color, 1 different
  const items = [
    targetColor.emoji,
    targetColor.emoji,
    targetColor.emoji,
    otherColors[Math.floor(Math.random() * otherColors.length)].emoji
  ];

  return {
    type: "color",
    question: "Find the DIFFERENT color:",
    items: shuffle(items),
    correct: targetColor.emoji,
    targetColor: targetColor.name
  };
}

/**
 * Generate matching task (find the pair)
 */
function generateMatching() {
  const pairs = [
    { item: "🐱", match: "🐱" },
    { item: "🐶", match: "🐶" },
    { item: "🐰", match: "🐰" },
    { item: "🐻", match: "🐻" },
    { item: "🦁", match: "🦁" }
  ];
  
  const target = pairs[Math.floor(Math.random() * pairs.length)];
  const distractors = pairs.filter(p => p.item !== target.item);
  
  const options = [
    target.match,
    distractors[0].match,
    distractors[1].match,
    distractors[2].match
  ];

  return {
    type: "match",
    question: "Find the SAME as this:",
    target: target.item,
    correct: target.match,
    options: shuffle(options)
  };
}

/**
 * Generate counting task
 */
function generateCounting() {
  const count = Math.floor(Math.random() * 5) + 1; // 1-5
  const visual = visuals[Math.floor(Math.random() * visuals.length)];
  
  const options = [
    count,
    count + 1,
    Math.max(1, count - 1),
    count + 2
  ];

  return {
    type: "count",
    question: "How many do you see?",
    count: count,
    visual: visual,
    correct: count,
    options: shuffle(options)
  };
}

/**
 * Generate simple pattern task
 */
function generatePattern() {
  const patterns = [
    { items: ["🔴", "🔵", "🔴", "🔵", "?"], next: "🔴" },
    { items: ["🟢", "🟢", "🟡", "🟢", "🟢", "?"], next: "🟡" },
    { items: ["🔺", "🟦", "🔺", "🟦", "?"], next: "🔺" },
    { items: ["⭐", "⭐", "💫", "⭐", "⭐", "?"], next: "💫" }
  ];
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const distractors = ["🔴", "🔵", "🟢", "🟡", "🔺", "🟦"].filter(
    item => item !== pattern.next
  );

  return {
    type: "pattern",
    question: "What comes next?",
    items: pattern.items,
    correct: pattern.next,
    options: shuffle([pattern.next, ...distractors.slice(0, 3)])
  };
}

/**
 * Generate size comparison task
 */
function generateSizeComparison() {
  const sizes = ["big", "small"];
  const targetSize = sizes[Math.floor(Math.random() * sizes.length)];
  
  const bigItems = ["🐘", "🦏", "🦒", "🐋"];
  const smallItems = ["🐭", "🐤", "🐛", "🐜"];
  
  const bigItem = bigItems[Math.floor(Math.random() * bigItems.length)];
  const smallItem = smallItems[Math.floor(Math.random() * smallItems.length)];

  return {
    type: "size",
    question: `Which one is ${targetSize}?`,
    bigItem: bigItem,
    smallItem: smallItem,
    correct: targetSize === "big" ? bigItem : smallItem,
    options: shuffle([bigItem, smallItem, "🐱", "🐶"])
  };
}

/**
 * Generate category task (what belongs together)
 */
function generateCategory() {
  const categories = [
    {
      name: "animals",
      items: ["🐱", "🐶", "🐰", "🐻"],
      distractors: ["🍎", "🚗", "🏠", "📚"]
    },
    {
      name: "fruits",
      items: ["🍎", "🍌", "🍊", "🍇"],
      distractors: ["🚗", "🏠", "📚", "🔴"]
    },
    {
      name: "vehicles",
      items: ["🚗", "🚌", "🚲", "✈️"],
      distractors: ["🍎", "🏠", "📚", "🐱"]
    }
  ];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const target = category.items[Math.floor(Math.random() * category.items.length)];

  return {
    type: "category",
    question: "Which one belongs with these?",
    categoryItems: category.items.filter(item => item !== target),
    correct: target,
    options: shuffle([target, ...category.distractors.slice(0, 3)])
  };
}

/**
 * Generate simple sequence task
 */
function generateSequence() {
  const sequences = [
    { start: 1, step: 1, length: 3 }, // 1, 2, 3, ?
    { start: 2, step: 1, length: 3 }, // 2, 3, 4, ?
    { start: 1, step: 2, length: 3 }  // 1, 3, 5, ?
  ];
  
  const seq = sequences[Math.floor(Math.random() * sequences.length)];
  const numbers = [];
  for (let i = 0; i < seq.length; i++) {
    numbers.push(seq.start + i * seq.step);
  }
  const next = seq.start + seq.length * seq.step;
  
  const options = [
    next,
    next + 1,
    Math.max(1, next - 1),
    next + 2
  ];

  return {
    type: "sequence",
    question: "What number comes next?",
    numbers: numbers,
    correct: next,
    options: shuffle(options)
  };
}

/**
 * Generate a special task based on difficulty
 * All tasks are simplified for special needs
 */
export function generateSpecialTask(difficulty = "easy") {
  // Expanded task types for variety
  const types = [
    "add", "subtract", "compare", "odd",
    "color", "match", "count", "pattern",
    "size", "category", "sequence"
  ];
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
    case "color":
      return generateColorSort();
    case "match":
      return generateMatching();
    case "count":
      return generateCounting();
    case "pattern":
      return generatePattern();
    case "size":
      return generateSizeComparison();
    case "category":
      return generateCategory();
    case "sequence":
      return generateSequence();
    default:
      return generateSimpleAddition();
  }
}

