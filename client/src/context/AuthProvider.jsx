import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextInstance";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const hasLocalToken = !!localStorage.getItem("accessToken");
    const hasUrlToken = !!new URLSearchParams(window.location.search).get("token");
    return hasLocalToken || hasUrlToken;
  });

  useEffect(() => {
    // Handle token from URL (e.g., after Google Login)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem("accessToken", token);
      setIsAuthenticated(true);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
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

