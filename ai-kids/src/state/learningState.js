const learningState = {
  errors: 0,
  streak: 0,
  taskCount: 0,
  difficulty: "easy",

  registerSuccess() {
    this.streak++;
    this.taskCount++;

    if (this.streak >= 2) this.difficulty = "medium";
  },

  registerFail() {
    this.errors++;
    this.streak = 0;

    if (this.errors >= 2) this.difficulty = "easy";
  },

  resetTaskCount() {
    this.taskCount = 0;
  },

  reset() {
    this.errors = 0;
    this.streak = 0;
    this.taskCount = 0;
    this.difficulty = "easy";
  },
};

export default learningState;
