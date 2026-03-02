import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/useAuth";

export default function Dashboard() {
  const [summary, setSummary] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      API.get("/news/summary")
        .then(res => setSummary(res.data.summary))
        .catch(err => console.error("Failed to fetch summary", err));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <div>Please login to view the dashboard.</div>;

  return (
    <div>
      <pre>{summary}</pre>
      <Logout />
    </div>
  );
}

export const Logout = () => {
  const { logout } = useAuth();
  return <button onClick={logout}>Logout</button>;
};

