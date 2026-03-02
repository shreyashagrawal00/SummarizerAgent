const Footer = () => {
  return (
    <footer className="bg-black border-t border-slate-800 py-16 text-slate-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
              <h2 className="font-display text-xl font-bold">Briefly</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">
              Empowering busy professionals with the knowledge they need to navigate the world, without the noise.
            </p>
            <div className="flex gap-4">
              <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">rss_feed</span></a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a className="hover:text-primary transition-colors" href="#">Daily Brief</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Weekly Review</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Custom Topics</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Mobile App</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Media Kit</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Ethics Code</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">© 2023 Briefly Publishing Group Inc. All rights reserved.</p>
          <p className="text-xs text-slate-400 italic">Designed for clarity, read with intention.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
