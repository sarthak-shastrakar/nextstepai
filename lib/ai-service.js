import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://nextstep-ai.com", // Optional, for OpenRouter tracking
    "X-Title": "NextStep AI",
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
    retryCount = 2, 
    isText = false,
    model = "google/gemini-3-flash-preview", 
    system = "You are a senior career coach and resume expert. Be concise, professional, and metrics-oriented."
  } = options;

  let attempt = 0;

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
        max_tokens: maxTokens,
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

      if (attempt >= retryCount) {
        throw new Error("AI service currently unavailable. Triggering fallback...");
      }
      
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
