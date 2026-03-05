import { YoutubeTranscript } from "youtube-transcript";
import { summarizeVideoText } from "../services/summarizerService.js";

export const summarizeYoutube = async (req, res) => {
  const { url, language } = req.body;

  if (!url) {
    return res.status(400).json({ message: "YouTube URL is required" });
  }

  try {
    // Fetch the transcript
    const transcript = await YoutubeTranscript.fetchTranscript(url);

    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ message: "No transcript found for this video. Ensure the video has captions enabled." });
    }

    // Combine all transcript parts into a single text block
    const fullText = transcript.map(t => t.text).join(" ");

    // Summarize the transcript
    const summary = await summarizeVideoText(fullText, language || "en");

    res.json({ summary });

  } catch (error) {
    console.error("YouTube Summarize Error:", error);
    if (error.message && error.message.includes("Could not find captions")) {
      return res.status(400).json({ message: "Could not find captions for this video. Captions might be disabled or auto-generated captions are not supported." });
    }
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details."
      });
    }
    res.status(500).json({ message: "Failed to summarize YouTube video" });
  }
};
