import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextInstance";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const hasLocalToken = !!localStorage.getItem("accessToken");
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    const urlRefreshToken = urlParams.get("refreshToken");

    if (urlToken) {
      localStorage.setItem("accessToken", urlToken);
      if (urlRefreshToken) localStorage.setItem("refreshToken", urlRefreshToken);
      return true;
    }

    return hasLocalToken;
  });

  useEffect(() => {
    // Clean up the URL securely
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("token") || urlParams.get("refreshToken")) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

