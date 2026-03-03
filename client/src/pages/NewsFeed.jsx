import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);
  const [currentPageToken, setCurrentPageToken] = useState(null);
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
      const res = await API.post("/news/summarize-one", { article });
      setActiveSummary({
        title: article.title,
        content: res.data.summary
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
    <div className="min-h-[calc(100vh-64px)] bg-background-light">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="font-display text-4xl font-bold text-slate-900">Global Intel Feed</h1>
          <p className="text-slate-500 mt-2">Verified global updates from 200+ trusted agencies, optimized for professional insight.</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm animate-pulse">
                <div className="aspect-video bg-slate-100"></div>
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
              <article key={index} className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
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
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
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
                  <h3 className="font-display text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-6">
                    {article.description || article.content || "No description available for this article."}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-900 flex items-center gap-1 hover:text-primary transition-colors"
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
                      Summarize
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">newspaper</span>
            <h3 className="text-xl font-bold text-slate-900">No articles found</h3>
            <p className="text-slate-500 mt-2">Check back in a few minutes for the latest updates.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && (articles.length > 0 || pageHistory.length > 0) && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={pageHistory.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!nextPage}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">auto_stories</span>
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
                  <p className="text-slate-500 mt-2">Your OpenAI API key has exceeded its limit. Please check your billing details to continue using AI summaries.</p>
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
