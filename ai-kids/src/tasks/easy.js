export function generateEasyTask() {
  const a = Math.floor(Math.random() * 5) + 1;  
  const b = Math.floor(Math.random() * 5) + 1;

  return {
    question: `${a} + ${b} = ?`,
    answer: a + b,
    options: shuffle([a + b, a + b + 1, a + b - 1])
  };
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
