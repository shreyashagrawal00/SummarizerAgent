import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function GmailFeed() {
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);
  const [error, setError] = useState(null);
  const [connectError, setConnectError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      API.get("/gmail")
        .then(res => setEmails(res.data.emails))
        .catch(err => {
          console.error("Failed to fetch emails", err);
          if (err.response?.status === 403) {
            setConnectError("gmail_not_connected");
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const summarizeEmail = async (email, index) => {
    setSummarizingId(index);
    setError(null);
    try {
      const res = await API.post("/gmail/summarize-one", { email });
      setActiveSummary({
        title: email.subject || "(No Subject)",
        content: res.data.summary
      });
    } catch (err) {
      console.error("Failed to summarize email", err);
      if (err.response?.data?.message === "AI Quota Exceeded") {
        setError("QUOTA_ERROR");
      } else {
        setError("Summarization failed. Please try again later.");
      }
    } finally {
      setSummarizingId(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-4xl">mail</span>
            <h1 className="font-display text-4xl font-bold text-slate-900">Gmail Inbox</h1>
          </div>
          <p className="text-slate-500 mt-2">Your recent emails, with AI-powered summarization at your fingertips.</p>
        </header>

        {connectError === "gmail_not_connected" ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">mail_lock</span>
            <h3 className="text-xl font-bold text-slate-900">Gmail Not Connected</h3>
            <p className="text-slate-500 mt-2 mb-6">Please sign in with Google to access your emails.</p>
            <button
              onClick={() => window.location.href = "http://localhost:5001/api/auth/google"}
              className="bg-primary text-white text-sm font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all shadow-md"
            >
              Connect Gmail via Google
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-5 bg-slate-100 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : emails.length > 0 ? (
          <div className="space-y-4">
            {emails.map((email, index) => {
              const senderName = email.from?.split("<")[0]?.trim() || email.from;
              const initials = senderName?.charAt(0)?.toUpperCase() || "?";

              return (
                <div key={email.id || index} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{senderName}</p>
                        <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                          {email.date ? new Date(email.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ""}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-2 truncate">
                        {email.subject || "(No Subject)"}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2">
                        {email.snippet || "No preview available."}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => summarizeEmail(email, index)}
                          disabled={summarizingId !== null}
                          className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                        >
                          {summarizingId === index ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                          )}
                          Summarize
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inbox</span>
            <h3 className="text-xl font-bold text-slate-900">No emails found</h3>
            <p className="text-slate-500 mt-2">Your inbox appears to be empty. Check back later.</p>
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {(activeSummary || error) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">mail</span>
                <h2 className="font-display text-xl font-bold text-slate-900 line-clamp-1">
                  {error ? "Summarization Error" : activeSummary?.title}
                </h2>
              </div>
              <button
                onClick={() => { setActiveSummary(null); setError(null); }}
                className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-8 md:p-12 max-h-[60vh] overflow-y-auto">
              {error === "QUOTA_ERROR" ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-5xl text-amber-500 mb-4">warning_amber</span>
                  <p className="text-slate-900 font-bold text-lg">AI Quota Exceeded</p>
                  <p className="text-slate-500 mt-2">Your AI API key has exceeded its limit. Please wait or update your billing details.</p>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error_outline</span>
                  <p className="text-slate-900 font-bold text-lg">{error}</p>
                </div>
              ) : (
                <article className="prose prose-slate max-w-none">
                  <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {activeSummary?.content}
                  </p>
                </article>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setActiveSummary(null); setError(null); }}
                className="bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all shadow-md active:scale-95"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
