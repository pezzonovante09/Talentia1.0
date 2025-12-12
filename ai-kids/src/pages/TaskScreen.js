import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Task from "./Task";

import { loadProfile } from "../utils/profileManager";

export default function TaskScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  function handleFinish() {
    // Unlock next island (but don't navigate - let user continue playing)
    const progress = JSON.parse(localStorage.getItem("progress")) || {
      island1: true,
      island2: false,
      island3: false,
    };

    const level = Number(id);
    if (level === 1) {
      progress.island2 = true;
    } else if (level === 2) {
      progress.island3 = true;
    }

    localStorage.setItem("progress", JSON.stringify(progress));

    // Don't navigate - tasks will regenerate automatically
    // User can continue playing on the same island
  }

  // Don't pass level - let Task component use adaptive level from profile
  return <Task onFinish={handleFinish} />;
}
