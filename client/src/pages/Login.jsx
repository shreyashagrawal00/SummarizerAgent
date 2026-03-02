import { useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";

import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.accessToken, res.data.refreshToken);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  };



  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input onChange={(e) => setEmail(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />
      <button>Login</button>
    </form>
  );
}