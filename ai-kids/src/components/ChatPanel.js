import React, { useState } from "react";
import PrimaryButton from "./ui/PrimaryButton";
import CharacterBubble from "./ui/CharacterBubble";
import useChatAssistant from "../hooks/useChatAssistant";

export default function ChatPanel({ 
  question, 
  correct, 
  correctAnswer, 
  taskType,
  level = 1,
  mistakes = 0,
  lastThreeMistakes = []
}) {
  const [input, setInput] = useState("");

  // Support both 'correct' and 'correctAnswer' prop names
  const correctValue = correct || correctAnswer || "";

  const { messages, isLoading, error, sendMessage } = useChatAssistant({
    question: question || "",
    correct: correctValue,
    taskType: taskType || "add",
    level: level,
    mistakes: mistakes,
    lastThreeMistakes: lastThreeMistakes
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  }

  return (
    <div className="w-full rounded-3xl bg-white/80 border p-4 shadow-xl mt-4">
      <h3 className="font-bold text-emerald-700 mb-2">Chat with Tali</h3>

      <div className="h-48 overflow-y-auto mt-3 space-y-2 pr-2">
        {messages.length === 0 ? (
          <CharacterBubble tone="success">
            <b>Tali:</b> Hi! I'm Tali 🦕. Let's think together!
          </CharacterBubble>
        ) : (
          messages.map((m, i) => (
            <CharacterBubble
              key={`msg-${i}-${m.content.substring(0, 10)}`}
              tone={m.role === "assistant" ? "success" : "default"}
            >
              <b>{m.role === "assistant" ? "Tali:" : "You:"}</b> {m.content}
            </CharacterBubble>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Ask Tali for help..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <PrimaryButton type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? "..." : "Send"}
        </PrimaryButton>
      </form>

      {error && (
        <p className="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
