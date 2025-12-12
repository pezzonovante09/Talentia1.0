import React, { useState } from "react";
import PrimaryButton from "./ui/PrimaryButton";
import CharacterBubble from "./ui/CharacterBubble";
import useChatAssistant from "../hooks/useChatAssistant";

export default function ChatPanel({ question, correct, attempts, mistakes }) {
  const [input, setInput] = useState("");

  const { messages, isLoading, error, sendMessage } = useChatAssistant({
    question,
    correct,
    attempts,
    mistakes
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  }

  return (
    <div className="w-full rounded-3xl bg-white/80 border p-4 shadow-xl mt-4">

      <h3 className="font-bold text-emerald-700 mb-2">Chat with Tali</h3>

      <div className="h-48 overflow-y-auto mt-3 space-y-2">
        {messages.map((m, i) => (
          <CharacterBubble
            key={i}
            tone={m.role === "assistant" ? "success" : "default"}
          >
            <b>{m.role === "assistant" ? "Tali:" : "You:"}</b> {m.content}
          </CharacterBubble>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="Ask Tali..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <PrimaryButton disabled={isLoading}>
          {isLoading ? "..." : "Send"}
        </PrimaryButton>
      </form>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
