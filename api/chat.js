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

    const { 
      message = "", 
      task = "", 
      correctAnswer = "", 
      taskType = "add",
      level = 1,
      mistakes = 0,
      lastThreeMistakes = [],
      history = [] 
    } = req.body;
    
    const correct = correctAnswer || "";

    // Normalize message and correct answer for comparison
    const normalizedMessage = message.trim().toLowerCase();
    const normalizedCorrect = String(correct).trim().toLowerCase();
    const isCorrectAnswer = normalizedMessage === normalizedCorrect;
    
    // Check if user is asking for help
    const helpKeywords = ["help", "hint", "idk", "i don't know", "don't know", "stuck", "what", "how"];
    const isAskingForHelp = helpKeywords.some(keyword => 
      normalizedMessage.includes(keyword)
    );

    // Build conversation history context (last 8 messages to help avoid repetition)
    const recentHistory = Array.isArray(history) ? history.slice(-8) : [];
    const historyContext = recentHistory
      .map(m => `${m.role === "assistant" ? "Tali" : "Child"}: ${m.content}`)
      .join("\n");

    // Ensure lastThreeMistakes is an array
    const lastThreeMistakesArray = Array.isArray(lastThreeMistakes) ? lastThreeMistakes : [];
    
    // Determine child's performance level
    const isStruggling = mistakes >= 2 || (lastThreeMistakesArray.length >= 2 && lastThreeMistakesArray.slice(-2).every(m => m >= 2));
    const isDoingWell = mistakes === 0 && lastThreeMistakesArray.length > 0 && lastThreeMistakesArray[lastThreeMistakesArray.length - 1] === 0;
    const difficultyLevel = level || 1;
    
    // Build task-specific hint guidance
    let taskTypeGuidance = "";
    if (taskType === "add" || taskType === "compute") {
      taskTypeGuidance = "For addition tasks, give hints like: 'Try counting from the bigger number upward' or 'Count each number carefully, one at a time' or 'Start with the first number, then add the second'";
    } else if (taskType === "subtract") {
      taskTypeGuidance = "For subtraction tasks, give hints like: 'Start with the bigger number and count backwards' or 'Take away the smaller number from the bigger one' or 'Count how many are left after taking away'";
    } else if (taskType === "multiply") {
      taskTypeGuidance = "For multiplication tasks, give hints like: 'Think of groups! If you have 3 groups of 4, count: 4, 8, 12' or 'Multiplication is like adding the same number many times' or 'Try counting in groups'";
    } else if (taskType === "compare") {
      taskTypeGuidance = "For comparison tasks, give hints like: 'Look which side has more items' or 'Count the items on each side carefully' or 'Which number is bigger?'";
    } else if (taskType === "sequence") {
      taskTypeGuidance = "For sequence tasks, give hints like: 'Look at the pattern! What number comes after each one?' or 'Count the difference between numbers' or 'See if the numbers are going up by the same amount'";
    } else if (taskType === "odd") {
      taskTypeGuidance = "For odd-one-out tasks, give hints like: 'Look for the shape that doesn't follow the pattern' or 'Which one looks different from the others?' or 'Count how many of each shape you see'";
    }
    
    // Check if child is asking how to solve (explanation request)
    const explanationKeywords = ["how", "how do", "how to", "explain", "show me", "teach me", "help me understand", "what do i do", "what should i do"];
    const isAskingForExplanation = explanationKeywords.some(keyword => 
      normalizedMessage.includes(keyword)
    );
    
    // Build adaptive prompt
    const prompt = `You are Tali the Dino, a kind, friendly, and encouraging helper for kids ages 5-8. You are always supportive and never give up on helping!

CRITICAL RULES:
1. Always be warm, friendly, and encouraging - use words like "Great job!", "You're doing awesome!", "Let's think together!"
2. ALWAYS respond in exactly 1-2 complete sentences (20-40 words total). NEVER cut off mid-sentence. ALWAYS finish your complete thought!
3. NEVER reveal the correct answer "${correct}" - you can ONLY give helpful hints that guide the child.
4. NEVER repeat the exact same response twice. Each hint must be DIFFERENT and creative.
5. If the child says "${correct}" (the correct answer), celebrate warmly: "Wow! You got it! 🎉 You're amazing!" - NO hints needed, just praise!
6. If the child asks for help (says "help", "hint", "idk", "don't know", "stuck", "what"), give a COMPLETE, friendly, actionable hint based on the task type WITHOUT giving the answer.
7. If the child asks HOW to solve (says "how", "how do", "how to", "explain", "show me", "teach me"), give a STEP-BY-STEP explanation of the method WITHOUT revealing the answer. Example: "For addition, start with the first number and count up by the second number! Like if it's 5 + 3, start at 5 and count: 6, 7, 8!"
8. If the child gives a wrong answer, be encouraging: "Good try! Let's think about it differently..." then give a helpful hint.
9. Always end on a positive, encouraging note.

CURRENT CONTEXT:
- Task: "${task}"
- Task Type: ${taskType}
- Difficulty Level: ${difficultyLevel} (1=easy, 2=medium, 3=hard)
- Mistakes in this session: ${mistakes}
- Last 3 sessions mistakes: [${lastThreeMistakesArray.join(", ") || "none yet"}]
- Child's performance: ${isStruggling ? "STRUGGLING - give simpler, clearer, step-by-step hints" : isDoingWell ? "DOING WELL - give lighter hints or encouragement" : "NORMAL - give standard helpful hints"}

ADAPTIVE HINT GUIDANCE:
${isStruggling ? "⚠️ The child is struggling (${mistakes} mistakes, difficulty history shows challenges). Give SIMPLER, CLEARER, more STEP-BY-STEP hints. Break it down into smaller pieces." : ""}
${isDoingWell ? "✅ The child is doing well (0 mistakes). Give lighter hints or small encouragement. Don't over-explain." : ""}
${taskTypeGuidance}

PREVIOUS CONVERSATION (last 8 messages - use this to avoid repeating):
${historyContext || "(This is the start of our chat)"}

IMPORTANT: Review the previous conversation above. NEVER repeat the exact same phrase or hint you've already given. Each response must be UNIQUE and DIFFERENT from previous responses.

CHILD'S MESSAGE: "${message}"

${isCorrectAnswer ? "🎉 SUCCESS! The child just gave the CORRECT answer! Celebrate with excitement and praise warmly. NO hints needed - just praise!" : ""}
${isAskingForExplanation ? "📚 EXPLANATION REQUESTED: The child wants to know HOW to solve this type of problem. Give a STEP-BY-STEP explanation of the method (e.g., 'For addition, start with the first number and count up!'). Explain the process clearly but DON'T give the answer!" : ""}
${isAskingForHelp && !isAskingForExplanation ? "💡 HELP REQUESTED: Give a COMPLETE, friendly, unique hint that guides them without revealing the answer. Make it DIFFERENT from previous hints!" : ""}
${!isCorrectAnswer && !isAskingForHelp && !isAskingForExplanation ? "💭 The child is trying. Be encouraging and give a COMPLETE helpful hint to guide them." : ""}

Tali's response (1-2 COMPLETE sentences, warm, encouraging, ALWAYS finish your thought, NEVER repeat previous responses):

CRITICAL: Your response MUST:
- Be a complete thought ending with proper punctuation (. ! or ?)
- NEVER stop mid-sentence or mid-word
- Be DIFFERENT from any previous responses in the conversation
- Adapt to the child's performance level (simpler if struggling, lighter if doing well)
- Give task-type-specific hints when help is requested

Write your COMPLETE, unique response now:`;

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
              temperature: 0.8,  // Slightly lower for more consistent completion
              maxOutputTokens: 500,  // Much higher to ensure complete responses
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
    console.log("Gemini API response structure:", JSON.stringify(data).substring(0, 1000));
    
    // Check why the response finished
    const finishReason = data?.candidates?.[0]?.finishReason;
    console.log(`Finish reason: ${finishReason}`);
    
    if (finishReason === "MAX_TOKENS" || finishReason === "OTHER") {
      console.warn(`⚠️ Response may be incomplete! Finish reason: ${finishReason}`);
    }

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
        reply = "Of course! Let's think about this step by step. Try counting each number carefully! 🦕";
      } else {
        reply = "Let's think together! 🦕";
      }
    }

    // Log the full reply for debugging
    console.log(`Full reply received (${reply.length} chars): ${reply}`);
    console.log(`Finish reason: ${finishReason}`);
    
    // Check if reply seems incomplete (no ending punctuation)
    // If incomplete, try to complete it intelligently
    if (reply && !reply.match(/[.!?]$/)) {
      console.warn(`⚠️ Incomplete reply detected: "${reply}"`);
      console.warn(`Finish reason was: ${finishReason}`);
      
      // Try to complete the incomplete sentence intelligently
      // Remove trailing incomplete words and punctuation
      let cleanedReply = reply.trim();
      
      // Remove trailing commas, and incomplete words like "and", "the", "a", "or", "but"
      const incompleteWords = [' and', ' the', ' a', ' an', ' or', ' but', ' with', ' to', ' of', ' in', ' on', ' at'];
      for (const word of incompleteWords) {
        if (cleanedReply.endsWith(word + ',')) {
          cleanedReply = cleanedReply.substring(0, cleanedReply.length - word.length - 1);
          break;
        } else if (cleanedReply.endsWith(word)) {
          cleanedReply = cleanedReply.substring(0, cleanedReply.length - word.length);
          break;
        }
      }
      
      // Remove trailing comma if present
      cleanedReply = cleanedReply.replace(/,\s*$/, '');
      
      // Now add the proper ending
      if (isAskingForHelp) {
        reply = cleanedReply + "! Let's try counting step by step together! 🦕";
      } else if (isCorrectAnswer) {
        reply = cleanedReply + "! Great job! 🎉🦕";
      } else {
        reply = cleanedReply + "! Let's think about this together! 🦕";
      }
      console.log(`Completed reply: "${reply}"`);
    }
    
    // Only truncate if extremely long (keep it reasonable for kids, but allow complete sentences)
    if (reply.length > 300) {
      // Find the last complete sentence before 300 chars
      const truncated = reply.substring(0, 300);
      const lastPeriod = truncated.lastIndexOf('.');
      const lastExclamation = truncated.lastIndexOf('!');
      const lastQuestion = truncated.lastIndexOf('?');
      const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
      
      if (lastSentenceEnd > 100) {
        reply = reply.substring(0, lastSentenceEnd + 1);
      } else {
        // If no sentence end found, just truncate at 300
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
