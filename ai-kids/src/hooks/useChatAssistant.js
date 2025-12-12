import { useState, useCallback, useRef } from "react";

// Support both production and localhost
// Use Vercel backend by default (CORS is fixed)
// Can override with REACT_APP_API_URL or use localhost:5001 if preferred
const getBackendUrl = () => {
  // Allow override via environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Use Vercel backend (CORS is fixed, works from localhost too)
  return "https://talentia1-0.vercel.app/api/chat";
};

const BACKEND_URL = getBackendUrl();

// Log which backend URL is being used (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 Using backend URL:', BACKEND_URL);
}

export default function useChatAssistant({ question, correct, attempts, mistakes }) {
  const [messages, setMessages] = useState(() => [
    { role: "assistant", content: "Hi! I'm Tali 🦕. Let's think together!" }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use refs to track latest values without causing re-renders
  const questionRef = useRef(question);
  const correctRef = useRef(correct);
  const messagesRef = useRef(messages);

  // Update refs when props/state change
  questionRef.current = question;
  correctRef.current = correct;
  messagesRef.current = messages;

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Prevent sending if already loading
    if (isLoading) return;

    const userMsg = { role: "user", content: trimmed };
    
    // Optimistically add user message
    setMessages(prev => {
      const updated = [...prev, userMsg];
      messagesRef.current = updated;
      return updated;
    });

    try {
      setIsLoading(true);
      setError(null);

      // Use current ref values to avoid stale closures
      const currentHistory = messagesRef.current;
      const currentQuestion = questionRef.current;
      const currentCorrect = correctRef.current;

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          task: currentQuestion || "",
          correct: currentCorrect || "",
          attempts: attempts || 0,
          mistakes: mistakes || 0,
          history: currentHistory
        })
      });

      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!data || typeof data.reply !== "string") {
        throw new Error("Invalid response format");
      }

      const reply = data.reply.trim() || "Let's think together! 🦕";

      // Add assistant reply
      setMessages(prev => {
        const updated = [...prev, { role: "assistant", content: reply }];
        messagesRef.current = updated;
        return updated;
      });

    } catch (err) {
      console.error("Chat error:", err);
      console.error("Backend URL used:", BACKEND_URL);
      
      // Remove the user message if request failed
      setMessages(prev => {
        const filtered = prev.filter((msg, idx) => 
          !(idx === prev.length - 1 && msg.role === "user" && msg.content === trimmed)
        );
        messagesRef.current = filtered;
        return filtered;
      });

      // More helpful error message
      setError("Tali can't think right now. Try again! 🦕");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, attempts, mistakes]);

  return { messages, isLoading, error, sendMessage };
}
