import { useState } from "react";
import API from "../api/api";

const PdfSummary = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid PDF file.");
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setSummary("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await API.post("/pdf/summarize", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to summarize PDF. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-display text-4xl font-bold text-slate-900">PDF Summarizer</h1>
          <p className="text-slate-600 text-lg">Upload any PDF document and let our AI distill it into a concise summary.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer group relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-4">
                <span className="material-symbols-outlined text-5xl text-slate-300 group-hover:text-primary transition-colors">
                  upload_file
                </span>
                <div className="space-y-1">
                  <p className="text-slate-900 font-semibold">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-slate-500 text-sm">PDF files up to 10MB</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!file || loading
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20"
                }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  Analyzing Document...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate Summary
                </>
              )}
            </button>
          </form>
        </div>

        {summary && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined text-primary">description</span>
              <h2 className="font-display text-xl font-bold text-slate-900">Executive Summary</h2>
            </div>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfSummary;
