// services/ai.service.js

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.apiKey
});


exports.generateStructuredContent = async (text) => {
  const res = await client.chat.completions.create({
    model: process.env.model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are analyzing a German language class transcript.

Ignore Tamil/Sinhala explanations.

Extract ONLY German learning content and return JSON:

{
  "topics": [],
  "vocabulary": [],
  "grammar": [],
  "examples": []
}

Rules:
- Focus on what students learned
- Extract German words and phrases
- Include grammar concepts (e.g., "present tense", "articles")
- Keep it clean and structured
        `
      },
      {
        role: "user",
        content: text
      }
    ]
  });

  return JSON.parse(res.choices[0].message.content);
};