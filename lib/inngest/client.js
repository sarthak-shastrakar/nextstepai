import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "Levora",
  name: "Levora",
  credentials: {
    gemini: {
      apiKey: process.env.GENERATIVE_AI_KEY,
    },
  },
});
