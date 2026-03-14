import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import SummaryActions from "../components/SummaryActions";

const INDIAN_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "as", label: "অসমীয়া" },
  { code: "ur", label: "اردو" },
];

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);
  const [currentPageToken, setCurrentPageToken] = useState(null);
  const [language, setLanguage] = useState("en");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchNews = (pageToken = null) => {
    setIsLoading(true);
    const url = pageToken ? `/news?page=${pageToken}` : "/news";
    API.get(url)
      .then(res => {
        setArticles(res.data.articles.slice(0, 9));
        setNextPage(res.data.nextPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(err => console.error("Failed to fetch news feed", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNews();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleNextPage = () => {
    if (nextPage) {
      setPageHistory(prev => [...prev, currentPageToken]);
      const nextToken = nextPage;
      setCurrentPageToken(nextToken);
      fetchNews(nextToken);
    }
  };

  const handlePrevPage = () => {
    if (pageHistory.length > 0) {
      const newHistory = [...pageHistory];
      const prevToken = newHistory.pop();
      setPageHistory(newHistory);
      setCurrentPageToken(prevToken);
      fetchNews(prevToken);
    }
  };

  const summarizeArticle = async (article, index) => {
    setSummarizingId(index);
    setError(null);
    try {
      const res = await API.post("/news/summarize-one", { article, language });
      setActiveSummary({
        title: article.title,
        content: res.data.summary,
        language,
      });
    } catch (err) {
      console.error("Failed to summarize article", err);
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
    <div className="min-h-[calc(100vh-80px)] bg-background-light dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white transition-colors">Global Intel Feed</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">Verified global updates from 200+ trusted agencies, optimized for professional insight.</p>
            </div>
            {/* Language Selector */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">translate</span>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 text-base text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer shadow-sm"
                >
                  {INDIAN_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">expand_more</span>
              </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse transition-colors">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-100 rounded w-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <article key={index} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:shadow-none transition-all flex flex-col">
                <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  {article.image_url ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={article.image_url}
                      alt={article.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <span className="material-symbols-outlined text-4xl">image</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm dark:text-white">
                      {article.source_id || "Global"}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest">
                      {article.category?.[0] || article.keywords?.[0] || "Update"}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">
                      {new Date(article.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 transition-colors">
                    {article.description || article.content || "No description available for this article."}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-900 dark:text-slate-300 flex items-center gap-1 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      Read Full Article
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                    <button
                      onClick={() => summarizeArticle(article, index)}
                      disabled={summarizingId === index}
                      className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                    >
                      {summarizingId === index ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      )}
                      {language !== "en" ? INDIAN_LANGUAGES.find(l => l.code === language)?.label : "Summarize"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 transition-colors">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4 transition-colors">newspaper</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">No articles found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">Check back in a few minutes for the latest updates.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && (articles.length > 0 || pageHistory.length > 0) && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={pageHistory.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!nextPage}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {(activeSummary || error) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">auto_stories</span>
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white line-clamp-1 transition-colors">
                    {error ? "Summarization Error" : activeSummary?.title}
                  </h2>
                  {activeSummary?.language && activeSummary.language !== "en" && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-xs">translate</span>
                      {INDIAN_LANGUAGES.find(l => l.code === activeSummary.language)?.label}
                    </p>
                  )}
                </div>
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
                  <p className="text-slate-900 dark:text-white font-bold text-lg transition-colors">AI Quota Exceeded</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">Your AI API key has exceeded its limit. Please check your billing details to continue using AI summaries.</p>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error_outline</span>
                  <p className="text-slate-900 dark:text-white font-bold text-lg transition-colors">{error}</p>
                </div>
              ) : (
                <article className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xl leading-relaxed font-sans transition-colors">
                  <ReactMarkdown>{activeSummary?.content}</ReactMarkdown>
                </article>
              )}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 transition-colors">
              <div className="w-full sm:w-auto">
                <SummaryActions 
                  summary={activeSummary?.content} 
                  title={activeSummary?.title} 
                />
              </div>
              <button
                onClick={() => { setActiveSummary(null); setError(null); }}
                className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all shadow-md active:scale-95"
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
