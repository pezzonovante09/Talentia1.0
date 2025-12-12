import React from "react";

const DINO_SRC =
  "https://i.graphicmama.com/uploads/2023/3/6419623f4b00a-baby-dino-animated-gifs.gif";

export default function DinoCharacter({ size = "w-48", className = "" }) {
  return (
    <img
      src={DINO_SRC}
      alt="Tali the friendly dino"
      className={`${size} animate-bob drop-shadow-[0_15px_15px_rgba(16,185,129,0.35)] ${className}`}
    />
  );
}


