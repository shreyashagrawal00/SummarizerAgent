const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-background-light/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
          <h2 className="font-display text-2xl font-bold tracking-tight">Briefly</h2>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">How it works</a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Archive</a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Pricing</a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">About</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-semibold px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors">Sign in</button>
          <button className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:brightness-110 transition-all shadow-sm">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
