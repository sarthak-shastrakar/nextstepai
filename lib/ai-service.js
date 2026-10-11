import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://levora.app", // Optional, for OpenRouter tracking
    "X-Title": "Levora",
  },
});

// Rate limiter: Minimum 1s between calls for OpenRouter stability
let lastCallTime = 0;
const MIN_DELAY = 1000;

async function wait() {
  const now = Date.now();
  const diff = now - lastCallTime;
  if (diff < MIN_DELAY) {
    await new Promise((resolve) => setTimeout(resolve, MIN_DELAY - diff));
  }
  lastCallTime = Date.now();
}

/**
 * Unified AI Service Layer (OpenRouter Migration)
 */
export async function runAI(task, data, options = {}) {
  const { 
    maxTokens = 800, 
    retryCount = 3, 
    isText = false,
    model = "google/gemini-3-flash-preview", 
    system = "You are a senior career coach and resume expert. Be concise, professional, and metrics-oriented."
  } = options;

  let attempt = 0;
  let currentMaxTokens = maxTokens;

  while (attempt < retryCount) {
    try {
      await wait();

      const jsonInstruction = isText
        ? "Plain text only."
        : "Output JSON ONLY. No markdown blocks.";

      const messages = [
        { role: "system", content: `${system}\n${jsonInstruction}` },
        { role: "user", content: `Data: ${data}\nTask: ${task}` }
      ];

      const response = await ai.chat.completions.create({
        model,
        messages,
        max_tokens: currentMaxTokens,
        temperature: 0.4, // lower temperature for more consistent professional output
      });

      let text = response.choices[0].message.content.trim();

      if (isText) return text;

      // Robust JSON extraction: Handle markdown blocks and surrounding text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error("Manual JSON Parse Failed, raw text:", text);
        throw new Error("AI returned invalid JSON structure.");
      }
    } catch (error) {
      attempt++;
      console.error(`AI Call Attempt ${attempt} failed:`, error.message);

      // Auto-adapt if OpenRouter credit limit requires fewer tokens
      const affordMatch = error.message.match(/can only afford (\d+)/i);
      if (affordMatch && affordMatch[1]) {
        const affordable = parseInt(affordMatch[1], 10);
        currentMaxTokens = Math.max(500, Math.floor(affordable * 0.95));
        console.log(`[AI Service] Auto-adjusting max_tokens to ${currentMaxTokens} based on account balance.`);
      }

      if (attempt >= retryCount) {
        throw new Error("AI service currently unavailable. Triggering fallback...");
      }
      
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}
