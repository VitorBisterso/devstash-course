import OpenAI from "openai";

export const AI_MODEL = "gpt-5-nano";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
