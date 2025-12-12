import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Task from "./Task";

export default function TaskScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  function handleFinish(mistakes = 0) {
    const progress = JSON.parse(localStorage.getItem("progress")) || {
      island1: true,
      island2: false,
      island3: false,
      island4: false,
      island5: false,
      island6: false,
    };

    const currentIsland = Number(id);
    
    // Unlock next island in sequence (1->2, 2->3, etc.)
    if (currentIsland < 3) {
      progress[`island${currentIsland + 1}`] = true;
    }
    
    // Determine difficulty for next 3 islands based on mistakes
    // <= 1 mistake → hard (islands 4, 5, 6)
    // 2 mistakes → medium
    // >= 3 mistakes → easy
    let nextDifficulty = "easy";
    if (mistakes <= 1) {
      nextDifficulty = "hard";
    } else if (mistakes === 2) {
      nextDifficulty = "medium";
    }
    
    // Store difficulty for next islands
    progress.nextIslandsDifficulty = nextDifficulty;
    
    // If completed island 3, unlock islands 4, 5, 6 with determined difficulty
    if (currentIsland === 3) {
      progress.island4 = true;
      progress.island5 = true;
      progress.island6 = true;
    }

    localStorage.setItem("progress", JSON.stringify(progress));

    // Navigate back to map (navigation is handled by modal in Task.js)
    navigate("/map");
  }

  // Pass island id to Task so it knows which island we're on
  return <Task onFinish={handleFinish} islandId={Number(id)} />;
}
