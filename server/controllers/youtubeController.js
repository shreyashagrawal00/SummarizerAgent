import { summarizeVideoText } from "../services/summarizerService.js";
import axios from "axios";

const extractVideoId = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("?")[0];
      if (id && id.length === 11) return id;
    }
  } catch (_) {}
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

// ─── Method 1: Supadata API (free, purpose-built for YT transcripts) ──────────
const fetchWithSupadata = async (videoId) => {
  const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;
  if (!SUPADATA_API_KEY) {
    console.warn("YouTube [1/2]: SUPADATA_API_KEY not set, skipping.");
    return null;
  }
  try {
    console.log("YouTube [1/2]: trying Supadata API...");
    const res = await axios.get("https://api.supadata.ai/v1/youtube/transcript", {
      params: { videoId, text: true },
      headers: { "x-api-key": SUPADATA_API_KEY },
      timeout: 15000,
    });
    const transcript = res.data?.transcript || res.data?.content || res.data?.text;
    if (!transcript) return null;
    console.log(`YouTube [1/2]: Supadata success — ${transcript.length} chars`);
    return transcript;
  } catch (err) {
    console.warn("YouTube [1/2] Supadata failed:", err.response?.data?.message || err.message);
    return null;
  }
};

// ─── Method 2: RapidAPI YouTube Transcript (fallback) ────────────────────────
const fetchWithRapidAPI = async (videoId) => {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  if (!RAPIDAPI_KEY) {
    console.warn("YouTube [2/2]: RAPIDAPI_KEY not set, skipping.");
    return null;
  }
  try {
    console.log("YouTube [2/2]: trying RapidAPI...");
    const res = await axios.get("https://youtube-transcript3.p.rapidapi.com/api/transcript", {
      params: { videoId },
      headers: {
        "x-rapidapi-host": "youtube-transcript3.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      timeout: 15000,
    });
    const segments = res.data?.transcript || res.data;
    if (!Array.isArray(segments)) return null;
    const text = segments.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
    if (!text) return null;
    console.log(`YouTube [2/2]: RapidAPI success — ${text.length} chars`);
    return text;
  } catch (err) {
    console.warn("YouTube [2/2] RapidAPI failed:", err.response?.data?.message || err.message);
    return null;
  }
};

// ─── Transcript endpoint ──────────────────────────────────────────────────────
export const getTranscript = async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ message: "videoId is required" });

  console.log(`YouTube transcript: fetching for ${videoId}`);

  const transcript =
    (await fetchWithSupadata(videoId)) ||
    (await fetchWithRapidAPI(videoId));

  if (!transcript) {
    return res.status(404).json({
      message:
        "Could not fetch transcript. Please ensure the video has captions enabled, or try another video.",
    });
  }

  res.json({ transcript });
};

// ─── Summarize endpoint ───────────────────────────────────────────────────────
export const summarizeYoutube = async (req, res) => {
  const { transcript, language } = req.body;
  if (!transcript?.trim()) {
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
      return res.status(500).json({ message: "AI Quota Exceeded. Please check your billing details." });
    }
    res.status(500).json({ message: "Failed to summarize. Please try again." });
  }
};