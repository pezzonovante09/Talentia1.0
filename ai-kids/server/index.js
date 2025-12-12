const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/hints", async (req, res) => {
  try {
    const { question, childAnswer, correctAnswer } = req.body;

    if (!question || typeof childAnswer === "undefined") {
      return res.status(400).json({ error: "Missing question or answer." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are Tali the kind dinosaur tutor for 4-7 year olds.
Question: ${question}
Child answered: ${childAnswer}
Correct answer: ${correctAnswer}
Give ONE short, playful hint. Do NOT say the answer.`;

    const response = await model.generateContent(prompt);

    const hint =
      response.response.text()?.trim() || "Try counting it one more time!";

    res.json({ hint });
  } catch (error) {
    console.error("Hint error", error);
    res.status(500).json({ error: "Unable to fetch hint right now." });
  }
});

const upload = multer({ storage: multer.memoryStorage() });
// Voice chat temporarily disabled until new STT/TTS provider is selected
app.post("/api/voice-chat", upload.single("audio"), (req, res) => {
  return res
    .status(501)
    .json({ error: "Voice chat is temporarily unavailable. Try text chat!" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message = "", task = "", correct = "", history = [] } = req.body;

    // Normalize message and correct answer for comparison
    const normalizedMessage = message.trim().toLowerCase();
    const normalizedCorrect = String(correct).trim().toLowerCase();
    const isCorrectAnswer = normalizedMessage === normalizedCorrect;
    
    // Check if user is asking for help
    const helpKeywords = ["help", "hint", "idk", "i don't know", "don't know", "stuck", "what", "how"];
    const isAskingForHelp = helpKeywords.some(keyword => 
      normalizedMessage.includes(keyword)
    );

    // Build conversation history context (last 6 messages to avoid token bloat)
    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    const historyContext = recentHistory
      .map(m => `${m.role === "assistant" ? "Tali" : "Child"}: ${m.content}`)
      .join("\n");

    // Build a stable, non-loopy prompt
    const prompt = `You are Tali the Dino, a kind and friendly helper for kids ages 5-8.

IMPORTANT RULES:
1. Always answer in 1-2 very short, simple sentences (max 15 words total).
2. NEVER reveal the correct answer "${correct}" - you can only give hints.
3. If the child says "${correct}" (the correct answer), praise them warmly with excitement!
4. If the child asks for help (says "help", "hint", "idk", etc.), give ONE simple, actionable hint that guides them without giving the answer.
5. Make each hint DIFFERENT from previous hints - be creative and vary your approach.
6. Never repeat the same phrase you just said.
7. Keep your tone warm, encouraging, and age-appropriate.

Current Task: "${task}"
Correct Answer (NEVER say this number/word): "${correct}"

Previous conversation:
${historyContext || "(This is the start of our chat)"}

Child's message: "${message}"

${isCorrectAnswer ? "IMPORTANT: The child just gave the CORRECT answer! Praise them enthusiastically!" : ""}
${isAskingForHelp ? "IMPORTANT: The child is asking for help. Give a simple, unique hint that hasn't been given before." : ""}

Tali's response (1-2 short sentences, kid-friendly):`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 40,
        topP: 0.9
      }
    });

    const response = await model.generateContent(prompt);

    let reply = response.response.text()?.trim();
    
    // Fallback if no reply
    if (!reply || reply.length === 0) {
      if (isCorrectAnswer) {
        reply = "Wow! You got it! 🎉🦕";
      } else if (isAskingForHelp) {
        reply = "Try counting step by step! 🦕";
      } else {
        reply = "Let's think together! 🦕";
      }
    }

    // Ensure reply is short (truncate if too long)
    if (reply.length > 100) {
      reply = reply.substring(0, 97) + "...";
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat error", error);
    res.status(500).json({ reply: "Tali is thinking... try again! 🦕" });
  }
});

app.listen(port, () => {
  console.log(`Talentia AI server listening on port ${port}`);
});

