import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { downloadSummaryAsPdf } from "../utils/downloadPdf";

export default function Dashboard() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = () => {
    if (!summary || summary === "AI_QUOTA_ERROR") return;
    setDownloading(true);
    try {
      const dateStr = new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
      downloadSummaryAsPdf(
        summary,
        `Morning Brief — ${dateStr}`,
        `Morning-Brief-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      API.get("/news/summary")
        .then((res) => setSummary(res.data.summary))
        .catch((err) => {
          console.error("Failed to fetch summary", err);
          if (err.response?.data?.message === "AI Quota Exceeded") {
            setSummary("AI_QUOTA_ERROR");
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-light dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Account card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <h3 className="font-display text-xl font-bold mb-4 dark:text-white transition-colors">Your Account</h3>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl text-primary">person</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white transition-colors">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{user?.email || "Member"}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Daily digest promo */}
            <div className="bg-primary rounded-2xl p-5 shadow-lg text-white">
              <h3 className="font-bold text-base mb-1.5">Daily Digest</h3>
              <p className="text-xs text-white/80 mb-3">
                Your personalized summary of the world's most important news, curated just for you.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                AI-Powered
              </div>
            </div>

            {/* AI Toolkit */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <h3 className="font-display text-xl font-bold mb-4 dark:text-white transition-colors">AI Toolkit</h3>
              <div className="space-y-3">
                {[
                  { path: "/youtube", icon: "smart_display", label: "YouTube Summary", sub: "Extract insights from videos", color: "red" },
                  { path: "/web",     icon: "language",      label: "Webpage Summary", sub: "Summarize long articles",      color: "blue" },
                  { path: "/pdf",     icon: "description",   label: "PDF Summary",     sub: "Analyze long documents",       color: "purple" },
                ].map(({ path, icon, label, sub, color }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-${color}-500/50 hover:bg-${color}-50 dark:hover:bg-${color}-950/20 text-slate-700 dark:text-slate-300 transition-all group text-left`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center text-${color}-600 dark:text-${color}-500 group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-xl">{icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <main className="flex-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] flex flex-col transition-colors">

              {/* Card header */}
              <div className="border-b border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight transition-colors">
                    Today's Morning Brief
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 capitalize text-sm transition-colors">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
                <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-12 flex-1">
                {isLoading ? (
                  <div className="space-y-8 animate-pulse">
                    <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2 transition-colors"></div>
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full transition-colors"></div>
                      ))}
                    </div>
                    <div className="h-48 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors"></div>
                  </div>
                ) : (
                  <article className="prose prose-slate dark:prose-invert max-w-none transition-colors">
                    <div className="font-sans text-xl leading-relaxed text-slate-800 dark:text-slate-300 transition-colors">
                      {summary === "AI_QUOTA_ERROR" ? (
                        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                          <span className="material-symbols-outlined text-4xl text-amber-500 mb-2">warning_amber</span>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">
                            AI Summary Temporarily Unavailable
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-4 transition-colors">
                            You have exceeded your AI API quota. Please check your billing details.
                          </p>
                          <button
                            onClick={() => navigate("/feed")}
                            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all"
                          >
                            Read Raw News Feed Instead
                          </button>
                        </div>
                      ) : summary ? (
                        <ReactMarkdown>{summary}</ReactMarkdown>
                      ) : (
                        "No summary available for today yet. Please check back later."
                      )}
                    </div>
                  </article>
                )}
              </div>

              {/* Footer / download */}
              {!isLoading && summary && summary !== "AI_QUOTA_ERROR" && (
                <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between transition-colors">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors">
                    Generated by Briefly AI • Based on 15+ trusted sources
                  </p>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading ? (
                      <>
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}