import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const SummaryActions = ({ summary, onDownloadPdf, downloadingPdf, title = "Summary", url = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [speechUtterance, setSpeechUtterance] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
    return () => {
      // Cancel speech on unmount
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary)
      .then(() => toast.success("Summary copied to clipboard!"))
      .catch(() => toast.error("Failed to copy summary."));
  };

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Briefly - ${title}`,
          text: "Check out this AI-generated summary!",
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if (err.name !== "AbortError") {
            // Un-supported share or other error, fallback to copy URL
            navigator.clipboard.writeText(shareUrl)
              .then(() => toast.success("Link copied to clipboard!"))
              .catch(() => toast.error("Failed to copy link."));
        }
      }
    } else {
      // Fallback: Copy link
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch(() => toast.error("Failed to copy link."));
    }
  };

  const handlePlayAudio = () => {
    if (!summary || !speechSynthesis) {
        toast.error("Audio playback is not supported in this browser.");
        return;
    }

    if (isPlaying) {
      speechSynthesis.cancel(); // Stop completely
      setIsPlaying(false);
      return;
    }

    // Strip markdown before speaking for cleaner audio
    const cleanText = summary
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`{1,3}[^`\n]*`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to pick a good voice
    const voices = speechSynthesis.getVoices();
    // Try to find a nice English voice
    const preferredVoice = voices.find(v => v.lang.includes("en-US") && v.name.includes("Google")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 1.0; 
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
        if(event.error !== "canceled"){
             console.error("SpeechSynthesisUtterance.onerror", event);
             setIsPlaying(false);
             toast.error("Failed to play audio.");
        }
    };

    setSpeechUtterance(utterance);
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 sm:mt-0">
      <button
        onClick={handlePlayAudio}
        className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-lg transition-all ${
           isPlaying 
            ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50" 
            : "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40"
        }`}
        title={isPlaying ? "Stop Audio" : "Play Audio"}
      >
        <span className="material-symbols-outlined text-sm sm:text-base">
          {isPlaying ? "stop_circle" : "volume_up"}
        </span>
        <span className="hidden sm:inline">{isPlaying ? "Stop" : "Listen"}</span>
      </button>

      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 sm:px-4 py-2 rounded-lg transition-all"
        title="Copy to Clipboard"
      >
        <span className="material-symbols-outlined text-sm sm:text-base">content_copy</span>
        <span className="hidden sm:inline">Copy</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 sm:px-4 py-2 rounded-lg transition-all"
        title="Share"
      >
        <span className="material-symbols-outlined text-sm sm:text-base">share</span>
        <span className="hidden sm:inline">Share</span>
      </button>

      {onDownloadPdf && (
        <button
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 sm:px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download PDF"
        >
          {downloadingPdf ? (
              <div className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-current border-t-transparent rounded-full"></div>
          ) : (
               <span className="material-symbols-outlined text-sm sm:text-base">download</span>
          )}
          <span className="hidden sm:inline">Download PDF</span>
        </button>
      )}
    </div>
  );
};

export default SummaryActions;
