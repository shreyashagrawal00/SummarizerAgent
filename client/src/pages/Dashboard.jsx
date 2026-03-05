import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function Dashboard() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const usableHeight = pageHeight - 20;
      let srcY = 0;
      while (srcY < imgHeight) {
        const sliceH = Math.min(imgHeight - srcY, usableHeight);
        pdf.addImage(imgData, "JPEG", 10, 10 - srcY, imgWidth, imgHeight);
        srcY += usableHeight;
        if (srcY < imgHeight) pdf.addPage();
      }
      pdf.save(`Morning-Brief-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);

      // Fetch user profile
      API.get("/auth/me")
        .then(res => setUser(res.data))
        .catch(err => console.error("Failed to fetch user profile", err));

      API.get("/news/summary")
        .then(res => setSummary(res.data.summary))
        .catch(err => {
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
          {/* Sidebar / Info */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <h3 className="font-display text-xl font-bold mb-4 dark:text-white transition-colors">Your Account</h3>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
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

            <div className="bg-primary rounded-2xl p-6 shadow-lg text-white">
              <h3 className="font-bold text-lg mb-2">Daily Digest</h3>
              <p className="text-sm text-white/80 mb-4">Your personalized summary of the world's most important news, curated just for you.</p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                AI-Powered
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] flex flex-col transition-colors">
              <div className="border-b border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight transition-colors">Today's Morning Brief</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 capitalize text-sm transition-colors">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-400">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>

              <div id="pdf-content" className="p-6 md:p-12 flex-1">
                {isLoading ? (
                  <div className="space-y-8 animate-pulse">
                    <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2 transition-colors"></div>
                    <div className="space-y-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full transition-colors"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full transition-colors"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 transition-colors"></div>
                    </div>
                    <div className="h-48 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full border border-slate-100 dark:border-slate-800 transition-colors"></div>
                  </div>
                ) : (
                  <article className="prose prose-slate dark:prose-invert max-w-none transition-colors">
                    <div className="font-sans text-xl leading-relaxed text-slate-800 dark:text-slate-300 transition-colors">
                      {summary === "AI_QUOTA_ERROR" ? (
                        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                          <span className="material-symbols-outlined text-4xl text-amber-500 mb-2 transition-colors">warning_amber</span>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">AI Summary Temporarily Unavailable</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-4 transition-colors">You have exceeded your OpenAI API quota. Please check your billing details.</p>
                          <button
                            onClick={() => navigate("/feed")}
                            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all"
                          >
                            Read Raw News Feed Instead
                          </button>
                        </div>
                      ) : (
                        summary ? <ReactMarkdown>{summary}</ReactMarkdown> : "No summary available for today yet. Please check back later."
                      )}
                    </div>
                  </article>
                )}
              </div>

              {!isLoading && (
                <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between transition-colors">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors">Generated by Briefly AI • Based on 15+ trusted sources</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloading}
                      className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading ? (
                        <><div className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"></div> Saving...</>
                      ) : (
                        <><span className="material-symbols-outlined text-sm">download</span> PDF</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

