const generateMediumTask = () => {
  let left = Math.floor(Math.random() * 5) + 1;
  let right = Math.floor(Math.random() * 5) + 1;

  // избегаем равных значений
  while (left === right) {
    right = Math.floor(Math.random() * 5) + 1;
  }

  return {
    question: `Which group has more?`,
    answer: left > right ? "Left" : "Right",
    options: ["Left", "Right"],
    renderExtra: (
      <div className="flex justify-center gap-10 mt-4 text-3xl">
        <div>{"🍎".repeat(left)}</div>
        <div>{"🍎".repeat(right)}</div>
      </div>
    ),
  };
};
