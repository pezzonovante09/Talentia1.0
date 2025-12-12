import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Task from "./Task";

export default function TaskScreen() {
  const { id } = useParams();          // 1, 2 или 3
  const navigate = useNavigate();

  const level = Number(id);

  const [difficulty, setDifficulty] = useState("normal");

  function handleFinish(result) {
    // result = easy | normal | harder
    setDifficulty(result);

    // unlock next island
    const progress = JSON.parse(localStorage.getItem("progress")) || {
      island1: true,
      island2: false,
      island3: false,
    };

    if (level === 1) {
      progress.island2 = true;
    } else if (level === 2) {
      progress.island3 = true;
    }

    localStorage.setItem("progress", JSON.stringify(progress));

    // go back to map
    setTimeout(() => {
      navigate("/map");
    }, 1000);
  }

  return <Task level={level} onFinish={handleFinish} difficulty={difficulty} />;
}
