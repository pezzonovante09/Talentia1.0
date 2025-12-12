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
    const { messages = [], question = "" } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required." });
    }

    const limitedMessages = messages.slice(-8).map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let history = "";
    limitedMessages.forEach((message) => {
      history += `${message.role.toUpperCase()}: ${message.content}\n`;
    });

    const prompt = `You are Tali, a playful dinosaur mentor for ages 4-7.
Use short, positive sentences and never reveal full answers directly.
Current question (optional): ${question || "none"}.
Here is the conversation so far:
${history}
Continue as Tali with one or two short sentences.`;

    const response = await model.generateContent(prompt);

    const reply =
      response.response.text()?.trim() ||
      "I'm proud of you! Let's think again together.";

    res.json({ reply });
  } catch (error) {
    console.error("Chat error", error);
    res.status(500).json({ error: "Chat with Tali is busy. Try again soon." });
  }
});

app.listen(port, () => {
  console.log(`Talentia AI server listening on port ${port}`);
});

