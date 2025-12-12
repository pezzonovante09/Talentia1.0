const generateHardTask = () => {
  const shapes = ["🔵", "🟢", "🟣", "⬛"];

  // выбираем один базовый shape
  const base = shapes[Math.floor(Math.random() * shapes.length)];

  // выбираем odd shape, который ≠ base
  let odd = shapes[Math.floor(Math.random() * shapes.length)];
  while (odd === base) {
    odd = shapes[Math.floor(Math.random() * shapes.length)];
  }

  // создаём ряд: 4 одинаковых + один odd
  const arr = Array(5).fill(base);
  const oddIndex = Math.floor(Math.random() * 5);
  arr[oddIndex] = odd;

  return {
    question: "Which shape does NOT belong?",
    answer: oddIndex,
    // options — массив индексов позиции
    options: arr.map((shape, index) => ({ shape, index })),
    renderExtra: (
      <div className="flex justify-center gap-4 mt-4 text-4xl">
        {arr.map((shape, idx) => (
          <span key={idx}>{shape}</span>
        ))}
      </div>
    ),
  };
};
