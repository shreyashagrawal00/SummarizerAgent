import { useState, useEffect } from "react";
import API from "../api/api";

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStories = async () => {
      try {
        const res = await API.get("/news/top-public");
        const articles = res.data.articles.slice(0, 3).map(article => ({
          category: article.category?.[0] || "Global",
          title: article.title,
          description: article.description || article.content || "No description available.",
          readTime: "2 min read",
          sources: article.source_id || "Multiple sources",
          image: article.image_url || "https://images.unsplash.com/photo-1585829365234-78d2b37da65e?q=80&w=2070&auto=format&fit=crop"
        }));
        setStories(articles);
      } catch (err) {
        console.error("Failed to fetch top stories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStories();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Today's Selected Stories</h2>
        <a className="text-primary font-bold flex items-center gap-1 hover:underline" href="/login">
          View Full Digest
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="aspect-video w-full overflow-hidden rounded-xl mb-4 bg-slate-100">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={story.image} alt={story.title} />
            </div>
            <div className="space-y-2">
              <span className="text-primary text-xs font-bold uppercase">{story.category}</span>
              <h3 className="font-display text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{story.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-3">{story.description}</p>
              <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {story.readTime}</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">source</span>
                  <span className="truncate max-w-[150px]">{story.sources}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stories;
