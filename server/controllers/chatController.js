import { askQuestion } from "../services/summarizerService.js";

export const handleChat = async (req, res) => {
  const { contextText, question, language, history } = req.body;

  if (!contextText || !question) {
    return res.status(400).json({ message: "Both document context and a question are required." });
  }

  // Prevent enormous context windows if someone tries to exploit the chat
  const MAX_CHARS = 25000;
  let safeContext = contextText;
  if (safeContext.length > MAX_CHARS) {
    safeContext = safeContext.substring(0, MAX_CHARS) + "...[Content Truncated]";
  }

  try {
    const answer = await askQuestion(safeContext, question, language || "en", history || []);
    res.json({ answer });
  } catch (error) {
    console.error("Chat Error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details."
      });
    }
    res.status(500).json({ message: "Failed to generate answer for your question." });
  }
};
