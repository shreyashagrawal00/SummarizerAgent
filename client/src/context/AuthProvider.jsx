import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextInstance";
import API from "../api/api";

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Clean up the URL securely
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("token") || urlParams.get("refreshToken")) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUser = async () => {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data);
        } catch (err) {
          console.error("Failed to fetch user profile", err);
          if (err.response?.status === 401) {
            logout();
          }
        }
      };
      fetchUser();
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

