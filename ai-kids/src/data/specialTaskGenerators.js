// Special task generators for children with special needs
// Based on TEACCH methodology: simple, structured, visual

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const visuals = ["🔵", "🟢", "🔴", "🟡", "🟣", "🟠"];

/**
 * Generate simple addition task with visual support
 * @param {number} level - 1, 2, or 3
 */
function generateSimpleAddition(level = 1) {
  let a, b;
  
  if (level === 1) {
    // Level 1: Very small numbers 1-3
    a = Math.floor(Math.random() * 3) + 1; // 1-3
    b = Math.floor(Math.random() * 3) + 1; // 1-3
  } else if (level === 2) {
    // Level 2: Small numbers 1-5
    a = Math.floor(Math.random() * 5) + 1; // 1-5
    b = Math.floor(Math.random() * 5) + 1; // 1-5
  } else {
    // Level 3: Medium numbers 1-7
    a = Math.floor(Math.random() * 7) + 1; // 1-7
    b = Math.floor(Math.random() * 7) + 1; // 1-7
  }
  
  const sum = a + b;
  const visual = visuals[Math.floor(Math.random() * visuals.length)];

  // Distractors get harder with level
  let distractorRange = level === 1 ? [1] : level === 2 ? [1, 2] : [1, 2, 3];
  const options = [
    sum,
    sum + distractorRange[0],
    Math.max(1, sum - distractorRange[0]),
    sum + (distractorRange[1] || distractorRange[0])
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
 * @param {number} level - 1, 2, or 3
 */
function generateSimpleSubtraction(level = 2) {
  let a, b;
  
  if (level === 1) {
    // Level 1: Very simple (not used in level 1, but just in case)
    a = Math.floor(Math.random() * 3) + 2; // 2-4
    b = Math.floor(Math.random() * (a - 1)) + 1;
  } else if (level === 2) {
    // Level 2: Small numbers
    a = Math.floor(Math.random() * 4) + 3; // 3-6
    b = Math.floor(Math.random() * (a - 1)) + 1;
  } else {
    // Level 3: Medium numbers
    a = Math.floor(Math.random() * 5) + 4; // 4-8
    b = Math.floor(Math.random() * (a - 1)) + 1;
  }
  
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
 * @param {number} level - 1, 2, or 3
 */
function generateSimpleComparison(level = 1) {
  let left, right;
  
  if (level === 1) {
    // Level 1: Very clear difference
    left = Math.floor(Math.random() * 2) + 2; // 2-3
    right = Math.floor(Math.random() * 2) + 5; // 5-6
  } else if (level === 2) {
    // Level 2: Clear difference
    left = Math.floor(Math.random() * 3) + 2; // 2-4
    right = Math.floor(Math.random() * 3) + 5; // 5-7
  } else {
    // Level 3: Smaller difference
    left = Math.floor(Math.random() * 4) + 2; // 2-5
    right = Math.floor(Math.random() * 4) + 4; // 4-7
  }
  
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
 * @param {number} level - 1, 2, or 3
 */
function generateSimpleOdd(level = 2) {
  const shapes = ["🔺", "🟦", "🟢", "🟨", "🔴", "🟣", "⭐"];
  const normal = shapes[Math.floor(Math.random() * (level === 1 ? 4 : shapes.length))];
  let odd;
  do {
    odd = shapes[Math.floor(Math.random() * shapes.length)];
  } while (odd === normal);

  // Level 1: 3 same, 1 different (very obvious)
  // Level 2-3: More items, slightly harder
  const count = level === 1 ? 3 : level === 2 ? 4 : 5;
  const items = Array(count).fill(normal);
  items.push(odd);

  return {
    type: "odd",
    question: "Find the DIFFERENT one:",
    items: shuffle(items),
    correct: odd
  };
}

/**
 * Generate color sorting task
 * @param {number} level - 1, 2, or 3
 */
function generateColorSort(level = 1) {
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
 * @param {number} level - 1, 2, or 3
 */
function generateMatching(level = 1) {
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
 * @param {number} level - 1, 2, or 3
 */
function generateCounting(level = 1) {
  let count;
  
  if (level === 1) {
    count = Math.floor(Math.random() * 3) + 1; // 1-3
  } else if (level === 2) {
    count = Math.floor(Math.random() * 5) + 1; // 1-5
  } else {
    count = Math.floor(Math.random() * 7) + 1; // 1-7
  }
  
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
 * @param {number} level - 1, 2, or 3 (only used in level 3)
 */
function generatePattern(level = 3) {
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
 * @param {number} level - 1, 2, or 3
 */
function generateSizeComparison(level = 2) {
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
 * @param {number} level - 1, 2, or 3 (only used in level 3)
 */
function generateCategory(level = 3) {
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
 * @param {number} level - 1, 2, or 3 (only used in level 3)
 */
function generateSequence(level = 3) {
  let sequences;
  
  if (level === 1) {
    // Level 1: Very simple (not used, but just in case)
    sequences = [{ start: 1, step: 1, length: 2 }]; // 1, 2, ?
  } else if (level === 2) {
    // Level 2: Simple
    sequences = [
      { start: 1, step: 1, length: 2 }, // 1, 2, ?
      { start: 2, step: 1, length: 2 }  // 2, 3, ?
    ];
  } else {
    // Level 3: More complex
    sequences = [
      { start: 1, step: 1, length: 3 }, // 1, 2, 3, ?
      { start: 2, step: 1, length: 3 }, // 2, 3, 4, ?
      { start: 1, step: 2, length: 3 }  // 1, 3, 5, ?
    ];
  }
  
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
 * Generate a special task based on difficulty and level
 * All tasks are simplified for special needs
 * @param {string} difficulty - "easy", "medium", or "hard"
 * @param {number} level - 1, 2, or 3
 */
export function generateSpecialTask(difficulty = "easy", level = 1) {
  // Task types vary by level for progression
  let types;
  
  if (level === 1) {
    // Level 1: Simplest tasks
    types = ["add", "count", "match", "color", "compare"];
  } else if (level === 2) {
    // Level 2: Add more variety
    types = ["add", "subtract", "compare", "odd", "color", "match", "count", "size"];
  } else {
    // Level 3: All task types including patterns and sequences
    types = [
      "add", "subtract", "compare", "odd",
      "color", "match", "count", "pattern",
      "size", "category", "sequence"
    ];
  }
  
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case "add":
      return generateSimpleAddition(level);
    case "subtract":
      return generateSimpleSubtraction(level);
    case "compare":
      return generateSimpleComparison(level);
    case "odd":
      return generateSimpleOdd(level);
    case "color":
      return generateColorSort(level);
    case "match":
      return generateMatching(level);
    case "count":
      return generateCounting(level);
    case "pattern":
      return generatePattern(level);
    case "size":
      return generateSizeComparison(level);
    case "category":
      return generateCategory(level);
    case "sequence":
      return generateSequence(level);
    default:
      return generateSimpleAddition(level);
  }
}

