import { useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ChatBox from "../components/ChatBox";

// CORS proxy options — tried in order
const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://cors-anywhere.herokuapp.com/${url}`,
];

async function fetchWithProxy(url) {
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy(url), { signal: AbortSignal.timeout(10000) });
      if (res.ok) return res;
    } catch (_) {}
  }
  throw new Error("All CORS proxies failed. Please try again later.");
}

function extractVideoId(url) {
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
}

// Extract captionTracks JSON using bracket-depth walker (handles nested JSON correctly)
function extractCaptionTracksJson(html) {
  const marker = '"captionTracks":';
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return null;
  let i = markerIdx + marker.length;
  while (i < html.length && html[i] !== "[") i++;
  let depth = 0;
  const jsonStart = i;
  for (; i < html.length; i++) {
    if (html[i] === "[" || html[i] === "{") depth++;
    else if (html[i] === "]" || html[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  return html.slice(jsonStart, i + 1);
}

async function fetchTranscript(videoId) {
  // Step 1: fetch YouTube page via CORS proxy
  const pageRes = await fetchWithProxy(
    `https://www.youtube.com/watch?v=${videoId}&hl=en`
  );
  const html = await pageRes.text();

  // Step 2: extract caption tracks
  const jsonStr = extractCaptionTracksJson(html);
  if (!jsonStr) throw new Error("No captions found for this video");

  const captionTracks = JSON.parse(jsonStr);
  if (!captionTracks?.length) throw new Error("No caption tracks available");

  // Step 3: pick best English track
  const track =
    captionTracks.find((t) => t.languageCode === "en" && !t.kind) ||
    captionTracks.find((t) => t.languageCode === "en") ||
    captionTracks.find((t) => t.languageCode?.startsWith("en")) ||
    captionTracks[0];

  if (!track?.baseUrl) throw new Error("No caption URL found");

  // Step 4: download caption JSON via CORS proxy
  const captionRes = await fetchWithProxy(track.baseUrl + "&fmt=json3");
  const captionJson = await captionRes.json();
  if (!captionJson?.events?.length) throw new Error("Caption data is empty");

  // Step 5: convert to plain text
  const text = captionJson.events
    .filter((e) => e.segs)
    .map((e) => e.segs.map((s) => s.utf8 || "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) throw new Error("Could not extract text from captions");
  return text;
}

export default function YoutubeSummary() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [isFetching, setIsFetching] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSummarize = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) { setError("Please paste a valid YouTube URL."); return; }

    const videoId = extractVideoId(trimmedUrl);
    if (!videoId) { setError("Please enter a valid YouTube link."); return; }

    setError(null);
    setSummary(null);
    setIsFetching(true);
    setStatusMsg("Fetching transcript...");

    let transcript;
    try {
      transcript = await fetchTranscript(videoId);
    } catch (err) {
      setIsFetching(false);
      setStatusMsg("");
      setError(
        err.message?.includes("No captions") || err.message?.includes("No caption")
          ? "This video does not have captions enabled. Please try a video with captions."
          : `Could not fetch transcript: ${err.message}`
      );
      return;
    }

    setIsFetching(false);
    setIsSummarizing(true);
    setStatusMsg("Generating AI summary...");

    try {
      const res = await API.post("/youtube/summarize", { transcript, language });
      setSummary(res.data.summary);
    } catch (err) {
      if (err.response?.data?.message === "AI Quota Exceeded") {
        setError("AI Quota Exceeded. Please check your AI service billing details.");
      } else {
        setError(err.response?.data?.message || "Failed to generate summary. Please try again.");
      }
    } finally {
      setIsSummarizing(false);
      setStatusMsg("");
    }
  };

  const isLoading = isFetching || isSummarizing;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-light dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-red-600 dark:text-red-500 text-3xl sm:text-4xl">smart_display</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">YouTube Summarizer</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Paste any YouTube URL to get an instant AI-generated summary of its contents.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm mb-12 flex flex-col items-center transition-colors">
          <div className="w-full max-w-2xl mb-8">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">YouTube Video URL</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="material-symbols-outlined text-slate-400">translate</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-2.5 outline-none font-bold transition-colors"
              >
                <option value="en">English (default)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
              </select>
            </div>

            <button
              onClick={handleSummarize}
              disabled={isLoading || !url}
              className="w-full sm:w-auto bg-red-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/20"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {statusMsg || "Processing..."}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate Summary
                </>
              )}
            </button>
          </div>

          {isLoading && statusMsg && (
            <div className="w-full max-w-2xl bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{statusMsg}</p>
            </div>
          )}

          {error && (
            <div className="w-full max-w-2xl bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-left">
              <span className="material-symbols-outlined text-amber-500 flex-shrink-0">warning</span>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{error}</p>
            </div>
          )}
        </div>

        {summary && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Summary Generated</h2>
            </div>
            <div className="p-8 sm:p-12">
              <article className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-sans">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </article>
            </div>
            <ChatBox contextText={summary} sourceName="YouTube Video" language={language} />
          </div>
        )}
      </div>
    </div>
  );
}