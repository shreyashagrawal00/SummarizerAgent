import { useState } from "react";
import API from "../api/api";
import ReactMarkdown from "react-markdown";
import ChatBox from "../components/ChatBox";
import SummaryActions from "../components/SummaryActions";
import SkeletonLoader from "../components/SkeletonLoader";
import { downloadSummaryAsPdf } from "../utils/downloadPdf";
import { INDIAN_LANGUAGES } from "../utils/languages";



const PdfSummary = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("en");
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = () => {
    if (!summary) return;
    setDownloading(true);
    try {
      const title = file ? `Summary: ${file.name.replace(".pdf", "")}` : "PDF Summary";
      downloadSummaryAsPdf(
        summary,
        title,
        `PDF-Summary-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloading(false);
    }
  };

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
    formData.append("language", language);

    try {
      const res = await API.post("/pdf/summarize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Upload error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to summarize PDF. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedLang = INDIAN_LANGUAGES.find((l) => l.code === language);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-light dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="text-center space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white transition-colors">
              PDF Summarizer
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg transition-colors">
              Upload any PDF document and let our AI distill it into a concise summary.
            </p>
          </div>

          {/* ── Upload form ─────────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-8 transition-colors">
            <form onSubmit={handleUpload} className="space-y-6">

              {/* Drop zone */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-12 text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer group relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                    upload_file
                  </span>
                  <div className="space-y-1">
                    <p className="text-slate-900 dark:text-white font-semibold transition-colors">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                      PDF files up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Language selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  <span className="material-symbols-outlined text-base text-primary">translate</span>
                  Summary Language
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                  >
                    {INDIAN_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
                    expand_more
                  </span>
                </div>
                {language !== "en" && (
                  <p className="text-xs text-primary/80 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Summary will be generated in {selectedLang?.label}
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!file || loading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!file || loading
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    : "bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20"
                  }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    Analyzing Document{language !== "en" ? ` in ${selectedLang?.label}` : ""}...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generate Summary{language !== "en" ? ` in ${selectedLang?.label}` : ""}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Skeleton Loader ──────────────────────────────────────────────── */}
          {loading && (
             <div className="w-full text-left bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-12 border border-primary/20 shadow-sm transition-colors mt-8">
               <div className="flex items-center gap-3 mb-4">
                   <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                   <p className="text-sm font-bold text-primary dark:text-blue-300">
                     Analyzing Document{language !== "en" ? ` in ${selectedLang?.label}` : ""}...
                   </p>
               </div>
               <SkeletonLoader lines={6} />
             </div>
          )}

          {/* ── Summary result ───────────────────────────────────────────────── */}
          {summary && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

              {/* Result header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 pb-4 gap-4 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white transition-colors">
                      Executive Summary
                    </h2>
                    {language !== "en" && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-xs">translate</span>
                        {selectedLang?.label}
                      </p>
                    )}
                  </div>
                </div>

                <SummaryActions 
                  summary={summary} 
                  onDownloadPdf={handleDownloadPDF} 
                  downloadingPdf={downloading} 
                  title={file ? `Summary: ${file.name.replace(".pdf", "")}` : "PDF Summary"}
                  language={language}
                />
              </div>

              {/* Summary body */}
              <div className="p-6 sm:p-10 pt-6">
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-lg transition-colors">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>

              {/* Chat interface */}
              <ChatBox contextText={summary} sourceName="PDF Document" language={language} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfSummary;