import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      API.get("/news")
        .then(res => setArticles(res.data.articles))
        .catch(err => console.error("Failed to fetch news feed", err))
        .finally(() => setIsLoading(false));
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="font-display text-4xl font-bold text-slate-900">Global News Feed</h1>
          <p className="text-slate-500 mt-2">The latest updates from 200+ trusted global sources, delivered raw and unfiltered.</p>
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
      </div>
    </div>
  );
}
