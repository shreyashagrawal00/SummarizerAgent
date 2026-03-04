import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-black backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer text-white" onClick={() => navigate("/")}>
          <span className="material-symbols-outlined text-primary text-4xl">auto_stories</span>
          <h2 className="font-display text-3xl font-bold tracking-tight">Briefly</h2>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          {isAuthenticated && (
            <>
              <button
                onClick={() => navigate("/feed")}
                className="text-base font-bold text-slate-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                Feed
              </button>
              <button
                onClick={() => navigate("/gmail")}
                className="text-base font-bold text-slate-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                Gmail
              </button>
              <button
                onClick={() => navigate("/pdf")}
                className="text-base font-bold text-slate-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                PDF Summary
              </button>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-white text-base font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all shadow-md"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="hidden sm:block text-base font-bold px-5 py-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-primary text-white text-base font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all shadow-md"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};


export default Header;
