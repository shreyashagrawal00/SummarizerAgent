import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

export const summarizeNews = async (articles) => {
  if (!articles || articles.length === 0) return "No information to summarize.";

  const content = articles
    .map(a => `${a.title}: ${a.description || a.content || ""}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: `Summarize into 1-2 pages:\n${content}` }
    ]
  });

  return response.choices[0].message.content;
};