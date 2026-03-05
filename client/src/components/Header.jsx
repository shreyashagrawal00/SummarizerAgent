import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-black backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer text-white" onClick={() => navigate("/")}>
          {!logoError ? (
            <img
              src="/logo.png"
              alt="Briefly"
              className="h-12 w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <>
              <span className="material-symbols-outlined text-primary text-4xl">auto_stories</span>
              <h2 className="font-display text-3xl font-bold tracking-tight">Briefly</h2>
            </>
          )}
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
              <button
                onClick={() => navigate("/youtube")}
                className="text-base font-bold text-slate-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                YouTube
              </button>
              <button
                onClick={() => navigate("/web")}
                className="text-base font-bold text-slate-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                Web
              </button>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="material-symbols-outlined text-xl">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-white text-base font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all shadow-md hidden sm:block"
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
                className="bg-primary text-white text-base font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all shadow-md hidden sm:block"
              >
                Get Started
              </button>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-6 gap-6">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => { navigate("/feed"); setIsMobileMenuOpen(false); }}
                  className="text-lg font-bold text-slate-300 hover:text-white transition-colors text-left"
                >
                  Feed
                </button>
                <button
                  onClick={() => { navigate("/gmail"); setIsMobileMenuOpen(false); }}
                  className="text-lg font-bold text-slate-300 hover:text-white transition-colors text-left"
                >
                  Gmail
                </button>
                <button
                  onClick={() => { navigate("/pdf"); setIsMobileMenuOpen(false); }}
                  className="text-lg font-bold text-slate-300 hover:text-white transition-colors text-left"
                >
                  PDF Summary
                </button>
                <button
                  onClick={() => { navigate("/youtube"); setIsMobileMenuOpen(false); }}
                  className="text-lg font-bold text-slate-300 hover:text-white transition-colors text-left"
                >
                  YouTube
                </button>
                <button
                  onClick={() => { navigate("/web"); setIsMobileMenuOpen(false); }}
                  className="text-lg font-bold text-slate-300 hover:text-white transition-colors text-left"
                >
                  Web
                </button>
                <button
                  onClick={() => { navigate("/dashboard"); setIsMobileMenuOpen(false); }}
                  className="text-lg font-bold text-primary transition-colors text-left block sm:hidden"
                >
                  Dashboard
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
                  className="text-lg font-bold text-slate-300 hover:text-white transition-colors text-left"
                >
                  Sign in
                </button>
                <button
                  onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
                  className="text-lg font-bold text-primary transition-colors text-left sm:hidden"
                >
                  Get Started
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};


export default Header;
