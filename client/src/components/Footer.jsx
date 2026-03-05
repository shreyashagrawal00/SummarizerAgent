const Footer = () => {
  return (
    <footer className="bg-black border-t border-slate-800 py-8 text-slate-300">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
            <h2 className="font-display text-xl font-bold">Briefly</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-4">
            Empowering busy professionals with the knowledge they need to navigate the world, without the noise.
          </p>
          <div className="flex gap-4">
            <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">rss_feed</span></a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">© 2026 Briefly Publishing Group Inc. All rights reserved.</p>
          <p className="text-xs text-slate-400 italic">Designed for clarity, read with intention.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
