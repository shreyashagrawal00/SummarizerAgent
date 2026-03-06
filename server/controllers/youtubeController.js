import { summarizeVideoText } from "../services/summarizerService.js";
import axios from "axios";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Rotating user agents to avoid bot detection
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
];
const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Bracket-depth JSON extractor (handles nested arrays/objects correctly)
const extractCaptionTracksJson = (html) => {
  const marker = '"captionTracks":';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  let i = start + marker.length;
  while (i < html.length && html[i] !== "[") i++;
  if (i >= html.length) return null;
  let depth = 0;
  const jsonStart = i;
  for (; i < html.length; i++) {
    if (html[i] === "[" || html[i] === "{") depth++;
    else if (html[i] === "]" || html[i] === "}") {
      depth--;
      if (depth === 0) return html.slice(jsonStart, i + 1);
    }
  }
  return null;
};

const eventsToText = (events) => {
  if (!events?.length) return null;
  return events
    .filter((e) => e.segs)
    .map((e) => e.segs.map((s) => s.utf8 || "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim() || null;
};

// Fetch with retry on 429 using rotating user agents
const fetchYouTube = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, {
        headers: {
          "User-Agent": randomUA(),
          "Accept-Language": "en-US,en;q=0.9",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        timeout: 15000,
      });
      return res;
    } catch (err) {
      if (err.response?.status === 429 && i < retries - 1) {
        const wait = 2000 * (i + 1);
        console.warn(`429 rate limited, retrying in ${wait}ms...`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
};

// ─── Proxy endpoint: GET /api/youtube/transcript?videoId=xxx ─────────────────
// Called by the frontend to fetch the transcript server-side.
// Separating this from summarize allows the frontend to handle errors cleanly.
export const getTranscript = async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ message: "videoId is required" });

  try {
    console.log(`YouTube transcript: fetching for ${videoId}`);

    const { data: html } = await fetchYouTube(
      `https://www.youtube.com/watch?v=${videoId}&hl=en`
    );

    const jsonStr = extractCaptionTracksJson(html);
    if (!jsonStr) {
      return res.status(404).json({ message: "No captions found for this video. Please ensure captions are enabled." });
    }

    const captionTracks = JSON.parse(jsonStr);
    if (!captionTracks?.length) {
      return res.status(404).json({ message: "No caption tracks available for this video." });
    }

    const track =
      captionTracks.find((t) => t.languageCode === "en" && !t.kind) ||
      captionTracks.find((t) => t.languageCode === "en") ||
      captionTracks.find((t) => t.languageCode?.startsWith("en")) ||
      captionTracks[0];

    if (!track?.baseUrl) {
      return res.status(404).json({ message: "Could not find caption URL." });
    }

    const { data: captionJson } = await fetchYouTube(track.baseUrl + "&fmt=json3");
    const transcript = eventsToText(captionJson?.events);

    if (!transcript) {
      return res.status(404).json({ message: "Caption data was empty." });
    }

    console.log(`YouTube transcript: success — ${transcript.length} chars`);
    res.json({ transcript });
  } catch (err) {
    console.error("Transcript fetch error:", err.message);
    const status = err.response?.status;
    if (status === 429) {
      return res.status(429).json({ message: "YouTube is rate limiting this server. Please try again in a few seconds." });
    }
    res.status(500).json({ message: "Failed to fetch transcript. Please try again." });
  }
};

// ─── Summarize endpoint: POST /api/youtube/summarize ─────────────────────────
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
      return res.status(500).json({ message: "AI Quota Exceeded. Please check your AI service billing details." });
    }
    res.status(500).json({ message: "Failed to summarize. Please try again." });
  }
};