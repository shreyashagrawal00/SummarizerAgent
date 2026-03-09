import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { downloadSummaryAsPdf } from "../utils/downloadPdf";

export default function GmailFeed() {
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);
  const [error, setError] = useState(null);
  const [connectError, setConnectError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://summarizeragent.onrender.com/api";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setConnectError(null);

    API.get("/gmail")
      .then((res) => {
        // FIX: safely handle both {emails:[...]} and flat array
        const raw = res.data;
        const list = raw?.emails ?? raw ?? [];
        setEmails(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Gmail fetch error:", err);
        const status = err.response?.status;
        const msg = err.response?.data?.message || "";

        if (status === 403 || msg.toLowerCase().includes("not connected") || msg.toLowerCase().includes("permission")) {
          setConnectError("gmail_permission_denied");
        } else if (status === 401 || msg.toLowerCase().includes("expired")) {
          setConnectError("gmail_token_expired");
        } else {
          setConnectError("gmail_fetch_error");
        }
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, navigate]);

  const summarizeEmail = async (email, index) => {
    setSummarizingId(index);
    setError(null);
    try {
      const res = await API.post("/gmail/summarize-one", { email });
      setActiveSummary({
        title: email.subject || "(No Subject)",
        content: res.data.summary,
      });
    } catch (err) {
      console.error("Summarize error:", err);
      if (err.response?.data?.message === "AI Quota Exceeded") {
        setError("QUOTA_ERROR");
      } else {
        setError("Summarization failed. Please try again later.");
      }
      setActiveSummary(null);
    } finally {
      setSummarizingId(null);
    }
  };

  const handleDownloadPDF = () => {
    if (!activeSummary) return;
    setDownloading(true);
    try {
      downloadSummaryAsPdf(
        activeSummary.content,
        `Summary: ${activeSummary.title}`,
        `Gmail-Summary-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (connectError) {
    const label =
      connectError === "gmail_permission_denied"
        ? { icon: "mail_lock", title: "Gmail Not Connected", body: "Please sign in with Google and allow Gmail access to view your emails here." }
        : connectError === "gmail_token_expired"
        ? { icon: "sync_problem", title: "Gmail Session Expired", body: "Your Google session has expired. Please sign in again to reconnect." }
        : { icon: "error_outline", title: "Failed to Load Emails", body: "Something went wrong fetching your emails. Try reconnecting your Google account." };

    return (
      <div className="min-h-[calc(100vh-80px)] bg-background-light dark:bg-slate-950 flex items-center justify-center p-6 transition-colors">
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 max-w-2xl w-full px-8">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4 block">{label.icon}</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{label.title}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">{label.body}</p>
          <button
            onClick={() => (window.location.href = `${API_BASE}/auth/gmail/link?token=${localStorage.getItem("accessToken") || ""}`)}
            className="bg-primary text-white text-sm font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all shadow-md"
          >
            Connect Gmail via Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-light dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl">mail</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white transition-colors">Gmail Inbox</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">Your recent emails, with AI-powered summarization at your fingertips.</p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 transition-colors">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4 block">inbox</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No emails found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Your inbox appears to be empty, or Gmail hasn't been connected yet.</p>
            <button
              onClick={() => (window.location.href = `${API_BASE}/auth/gmail/link?token=${localStorage.getItem("accessToken") || ""}`)}
              className="mt-6 bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-md"
            >
              Connect Gmail
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {emails.map((email, index) => {
              const senderName = email.from?.split("<")[0]?.trim() || email.from || "Unknown";
              const initials = senderName.charAt(0).toUpperCase();
              return (
                <div key={email.id || index} className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white transition-colors truncate">{senderName}</p>
                        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                          {email.date ? new Date(email.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2 transition-colors truncate">
                        {email.subject || "(No Subject)"}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 transition-colors">
                        {email.snippet || "No preview available."}
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={() => summarizeEmail(email, index)}
                          disabled={summarizingId === index}
                          className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {summarizingId === index
                            ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                          {summarizingId === index ? "Summarizing..." : "Summarize"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(activeSummary || error) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">mail</span>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                  {error ? "Summarization Error" : activeSummary?.title}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {!error && activeSummary && (
                  <button onClick={handleDownloadPDF} disabled={downloading}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50">
                    {downloading
                      ? <div className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"></div>
                      : <span className="material-symbols-outlined text-sm">download</span>}
                    Download PDF
                  </button>
                )}
                <button onClick={() => { setActiveSummary(null); setError(null); }}
                  className="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>
            <div className="p-8 md:p-12 max-h-[60vh] overflow-y-auto">
              {error === "QUOTA_ERROR" ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-5xl text-amber-500 mb-4 block">warning_amber</span>
                  <p className="text-slate-900 dark:text-white font-bold text-lg">AI Quota Exceeded</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Your AI API key has exceeded its limit. Please wait or update your billing details.</p>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">error_outline</span>
                  <p className="text-slate-900 dark:text-white font-bold text-lg">{error}</p>
                </div>
              ) : (
                <article className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xl leading-relaxed font-sans">
                  <ReactMarkdown>{activeSummary?.content}</ReactMarkdown>
                </article>
              )}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => { setActiveSummary(null); setError(null); }}
                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all shadow-md active:scale-95">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}