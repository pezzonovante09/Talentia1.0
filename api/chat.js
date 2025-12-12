// Helper function to set CORS headers
function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
}

export default async function handler(req, res) {
  // Handle OPTIONS preflight request FIRST - before anything else
  // This must be handled BEFORE any try-catch to ensure headers are always set
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    setCORSHeaders(res);
    res.status(200);
    res.end();
    return;
  }

  // Set CORS headers for all other requests
  setCORSHeaders(res);

  // Only allow POST for actual requests
  if (req.method !== "POST") {
    res.status(405).json({ reply: "Method not allowed" });
    return;
  }

  try {
    // Log for debugging
    console.log(`[${new Date().toISOString()}] POST request to /api/chat`);

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

    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set!");
      setCORSHeaders(res);
      return res.status(500).json({ 
        reply: "Tali is thinking... try again! 🦕",
        error: "GEMINI_API_KEY environment variable is missing"
      });
    }

    // Use gemini-pro which is more stable, or try gemini-1.5-flash-latest
    const modelName = "gemini-pro"; // Fallback to gemini-pro if 1.5-flash doesn't work
    const url =
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=` +
      process.env.GEMINI_API_KEY;
    
    console.log(`Calling Gemini API with model: ${modelName}`);

    const aiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.8, 
          maxOutputTokens: 40,
          topP: 0.9
        }
      }),
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error(`Gemini API error: ${aiRes.status}`);
      console.error(`Error response: ${errorText}`);
      console.error(`URL used: ${url.replace(process.env.GEMINI_API_KEY, 'HIDDEN')}`);
      setCORSHeaders(res);
      return res.status(500).json({ 
        reply: "Tali is thinking... try again! 🦕",
        error: `Gemini API error: ${aiRes.status}`,
        details: errorText.substring(0, 200) // First 200 chars of error
      });
    }

    const data = await aiRes.json();

    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
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

    res.status(200).json({ reply });
    return;
  } catch (err) {
    console.error("Backend error:", err);
    console.error("Error stack:", err.stack);
    // Ensure CORS headers are set even on error
    setCORSHeaders(res);
    res.status(500).json({ reply: "Tali is thinking... try again! 🦕" });
    return;
  }
}
