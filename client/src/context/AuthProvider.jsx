import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextInstance";
import API from "../api/api";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    const urlRefreshToken = urlParams.get("refreshToken");

    if (urlToken) {
      localStorage.setItem("accessToken", urlToken);
      if (urlRefreshToken) localStorage.setItem("refreshToken", urlRefreshToken);
      return true;
    }

    return !!localStorage.getItem("accessToken");
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Clean up URL after reading tokens (handles both login and Gmail link redirects)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("token") || urlParams.get("refreshToken")) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      API.get("/auth/me")
        .then((res) => setUser(res.data))
        .catch((err) => {
          console.error("Failed to fetch user profile", err);
          if (err.response?.status === 401) logout();
        });
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};