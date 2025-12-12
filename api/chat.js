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
    const prompt = `You are Tali the Dino, a kind, friendly, and encouraging helper for kids ages 5-8. You are always supportive and never give up on helping!

CRITICAL RULES:
1. Always be warm, friendly, and encouraging - use words like "Great job!", "You're doing awesome!", "Let's think together!"
2. Always answer in 1-2 complete, friendly sentences (15-25 words). NEVER give one-word answers like "no" or "oh".
3. NEVER reveal the correct answer "${correct}" - you can ONLY give helpful hints that guide the child.
4. If the child says "${correct}" (the correct answer), celebrate with excitement: "Wow! You got it! 🎉 You're amazing!" or similar.
5. If the child asks for help (says "help", "hint", "idk", "don't know", "stuck", etc.), give a friendly, actionable hint that guides them step-by-step WITHOUT giving the answer.
6. If the child gives a wrong answer, be encouraging: "Good try! Let's think about it differently..." then give a helpful hint.
7. Make each hint DIFFERENT and creative - vary your approach each time.
8. Never repeat the same phrase you just said.
9. Always end on a positive, encouraging note.

Current Task: "${task}"
Correct Answer (NEVER say this - only give hints): "${correct}"

Previous conversation:
${historyContext || "(This is the start of our chat)"}

Child's message: "${message}"

${isCorrectAnswer ? "🎉 SUCCESS! The child just gave the CORRECT answer! Celebrate with excitement and praise them warmly!" : ""}
${isAskingForHelp ? "💡 HELP REQUESTED: The child needs help. Give a friendly, unique hint that guides them without revealing the answer." : ""}
${!isCorrectAnswer && !isAskingForHelp ? "💭 The child is trying. Be encouraging and give a helpful hint to guide them." : ""}

Tali's friendly, supportive response (1-2 complete sentences, warm and encouraging):`;

    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set!");
      setCORSHeaders(res);
      return res.status(500).json({ 
        reply: "Tali is thinking... try again! 🦕",
        error: "GEMINI_API_KEY environment variable is missing"
      });
    }

    // Try different model names - use models that are actually available
    const modelsToTry = [
      "gemini-2.5-flash",      // Latest and fastest
      "gemini-2.0-flash",      // Alternative
      "gemini-2.5-flash-lite", // Lightweight option
      "gemini-2.5-pro"         // More capable but slower
    ];
    
    let aiRes = null;
    let lastError = null;
    let modelUsed = null;
    
    // Try each model until one works
    for (const modelName of modelsToTry) {
      try {
        const url =
          `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=` +
          process.env.GEMINI_API_KEY;
        
        console.log(`Trying Gemini API with model: ${modelName}`);
        
        aiRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { 
              temperature: 0.9, 
              maxOutputTokens: 200,  // Increased for complete responses
              topP: 0.95
            }
          }),
        });

        if (aiRes.ok) {
          modelUsed = modelName;
          console.log(`Successfully using model: ${modelName}`);
          break;
        } else {
          const errorText = await aiRes.text();
          console.log(`Model ${modelName} failed: ${aiRes.status}`);
          lastError = { status: aiRes.status, text: errorText };
          // Continue to next model
        }
      } catch (err) {
        console.error(`Error trying model ${modelName}:`, err);
        lastError = { error: err.message };
        // Continue to next model
      }
    }

    // If all models failed, return error
    if (!aiRes || !aiRes.ok) {
      console.error(`All models failed. Last error:`, lastError);
      setCORSHeaders(res);
      return res.status(500).json({ 
        reply: "Tali is thinking... try again! 🦕",
        error: `Gemini API error: All models failed`,
        details: lastError ? JSON.stringify(lastError).substring(0, 200) : "Unknown error"
      });
    }

    const data = await aiRes.json();
    
    // Debug: log the full response structure
    console.log("Gemini API response structure:", JSON.stringify(data).substring(0, 500));

    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    // If reply is missing, try alternative paths
    if (!reply && data?.candidates?.[0]?.content?.parts) {
      console.log("Trying alternative response extraction...");
      reply = data.candidates[0].content.parts
        .map(part => part.text)
        .filter(Boolean)
        .join(" ")
        .trim();
    }
    
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

    // Log the full reply for debugging
    console.log(`Full reply received (${reply.length} chars): ${reply}`);
    
    // Only truncate if extremely long (keep it reasonable for kids, but allow complete sentences)
    if (reply.length > 200) {
      // Find the last complete sentence before 200 chars
      const truncated = reply.substring(0, 200);
      const lastPeriod = truncated.lastIndexOf('.');
      const lastExclamation = truncated.lastIndexOf('!');
      const lastQuestion = truncated.lastIndexOf('?');
      const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
      
      if (lastSentenceEnd > 50) {
        reply = reply.substring(0, lastSentenceEnd + 1);
      } else {
        reply = truncated + "...";
      }
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
