const CTA = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="font-display text-4xl md:text-5xl font-bold">Ready for a better morning?</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">Join 50,000+ professionals who start their day with Briefly. Zero ads, zero algorithmic bias, just pure clarity.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <input className="min-w-[300px] rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Enter your email address" type="email" />
          <button className="bg-primary text-white font-bold px-8 py-3 rounded-lg hover:brightness-110 shadow-lg">Join Free</button>
        </div>
        <p className="text-xs text-slate-500">Weekly or Daily options available. Unsubscribe anytime.</p>
      </div>
    </section>
  );
};

export default CTA;
