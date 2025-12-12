import { useState, useEffect, useCallback, useRef } from "react";

const BACKEND_URL =
  "https://talentia-backend-lf8wxivet-denizs-projects-a72ae425.vercel.app/api/chat";

export default function useChatAssistant({ question, correct, attempts, mistakes }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Tali 🦕. Let's think together!" }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // always track latest messages
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);

    try {
      setIsLoading(true);

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          task: question,
          correct,
          attempts,
          mistakes,
          history: messagesRef.current
        })
      });

      const data = await res.json();

      const reply = data.reply || "I'm still thinking 🦕";

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

    } catch (err) {
      console.error(err);
      setError("Tali can't think right now 🦕");
    } finally {
      setIsLoading(false);
    }
  }, [question, correct, attempts, mistakes]);

  return { messages, isLoading, error, sendMessage };
}
