import { summarizeVideoText } from "../services/summarizerService.js";

// This controller now only handles AI summarization.
// Transcript fetching is done client-side to avoid server IP rate limiting.
export const summarizeYoutube = async (req, res) => {
  const { transcript, language } = req.body;

  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ message: "No transcript provided." });
  }

  try {
    const truncated =
      transcript.length > 15000
        ? transcript.substring(0, 15000) + "...[Transcript Truncated]"
        : transcript;

    console.log(`YouTube: summarizing ${truncated.length} chars...`);
    const summary = await summarizeVideoText(truncated, language || "en");
    res.json({ summary });
  } catch (error) {
    console.error("YouTube Summarize Error:", error);
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded. Please check your AI service billing details.",
      });
    }
    res.status(500).json({ message: "Failed to summarize. Please try again." });
  }
};