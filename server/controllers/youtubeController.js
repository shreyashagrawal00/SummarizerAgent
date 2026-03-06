import { Innertube, UniversalCache } from "youtubei.js";
import { summarizeVideoText } from "../services/summarizerService.js";
import axios from "axios";

// Initialize Innertube globally so we don't recreate it on every request
let yt;
const initYoutube = async () => {
  if (!yt) {
    yt = await Innertube.create({ generate_session_locally: true, cache: new UniversalCache(false) });
  }
  return yt;
};

// Helper function to extract video ID
const extractVideoId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Rock-solid fallback extractor that scrapes the raw HTML
const fallbackExtractTranscript = async (videoId) => {
  try {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };
    const { data: html } = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, { headers });

    const match = html.match(/"captionTracks":(\[.*?\])/);
    if (!match || !match[1]) return null;

    const captionTracks = JSON.parse(match[1]);
    if (!captionTracks.length) return null;

    // Sort to prefer English, otherwise take the first available
    const track = captionTracks.find(t => t.languageCode === 'en') ||
      captionTracks.find(t => t.languageCode?.startsWith('en')) ||
      captionTracks[0];

    // Append fmt=json3 to get JSON response instead of empty XML
    const trackUrl = track.baseUrl + "&fmt=json3";
    const { data: json } = await axios.get(trackUrl, { headers });

    if (!json || !json.events) return null;

    // json.events is an array of caption cue objects, each with `segs` array
    const text = json.events
      .filter(e => e.segs)
      .map(e => e.segs.map(s => s.utf8).join(""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return text || null;
  } catch (err) {
    console.error("Fallback transcript extraction failed:", err.message);
    return null;
  }
};

export const summarizeYoutube = async (req, res) => {
  const { url, language } = req.body;

  if (!url) {
    return res.status(400).json({ message: "YouTube URL is required" });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ message: "Invalid YouTube URL format." });
  }

  try {
    let fullText = null;

    // Attempt 1: Fast raw HTML extraction (doesn't break on cipher changes)
    fullText = await fallbackExtractTranscript(videoId);

    // Attempt 2: youtubei.js
    if (!fullText) {
      console.log("Fallback failed, trying youtubei.js...");
      const tube = await initYoutube();
      const info = await tube.getInfo(videoId);
      const transcriptData = await info.getTranscript();

      if (transcriptData?.transcript?.content?.body?.initial_segments) {
        fullText = transcriptData.transcript.content.body.initial_segments
          .map(segment => segment.snippet.text)
          .join(" ");
      }
    }

    if (!fullText || fullText.trim() === "") {
      return res.status(404).json({ message: "No transcript found for this video. Ensure the video has captions enabled." });
    }

    // Summarize the transcript
    const summary = await summarizeVideoText(fullText, language || "en");

    res.json({ summary });

  } catch (error) {
    console.error("YouTube Summarize Error:", error);
    if (error.message && error.message.includes("Could not find captions") || error.message.includes("Transcript not available")) {
      return res.status(400).json({ message: "Could not find captions for this video. Captions might be disabled or auto-generated captions are not supported." });
    }
    if (error.message?.includes("quota") || error.status === 429) {
      return res.status(500).json({
        message: "AI Quota Exceeded",
        detail: "Please check your AI service billing details."
      });
    }
    res.status(500).json({ message: "Failed to summarize YouTube video. The server encountered an error parsing the video." });
  }
};
