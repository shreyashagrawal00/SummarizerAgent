import { useEffect, useState } from "react";
import API from "../api/api";

export default function Dashboard() {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    API.get("/news/summary")
      .then(res => setSummary(res.data.summary));
  }, []);

  return <pre>{summary}</pre>;
}

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Logout = () => {
  const { logout } = useContext(AuthContext);
  return <button onClick={logout}>Logout</button>;
};