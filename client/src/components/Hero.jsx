import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 border-b border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Today's brief is ready
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.1] tracking-tight text-slate-900">
              Your world in <br /><span className="italic text-primary">two pages.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed">
              We distill the top 15 news stories from 200+ global sources into concise, high-quality summaries delivered to your inbox every morning. No fluff, just the facts.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white text-base font-bold px-8 py-4 rounded-lg hover:brightness-110 transition-all shadow-lg flex items-center gap-2"
            >
              Start Reading Now
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border border-slate-300 bg-white text-slate-900 text-base font-bold px-8 py-4 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
        <div className="relative lg:pl-10">
          <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-8 border-white bg-white rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="p-8 space-y-6">
              <div className="border-b-2 border-slate-900 pb-4">
                <h3 className="font-display text-3xl font-bold">The Morning Brief</h3>
                <p className="text-sm font-medium uppercase tracking-widest text-slate-500 mt-1">October 24, 2023</p>
              </div>
              <div className="space-y-4">
                <div className="w-full h-48 bg-slate-100 rounded"></div>
                <h4 className="font-display text-xl font-bold leading-tight">1. Global Markets React to New Energy Infrastructure Bill</h4>
                <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-primary pl-4">
                  Summary: Stocks rallied as the historic $400B green energy proposal passed the senate. Analysts expect a shift in long-term manufacturing trends across the Midwest.
                </p>
                <div className="h-[1px] w-full bg-slate-200"></div>
                <h4 className="font-display text-xl font-bold leading-tight">2. Breakthrough in Solid-State Battery Tech</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Summary: A joint venture in Kyoto has achieved 1,000 miles of range in standard EV chassis tests. Commercial availability projected by late 2026.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
