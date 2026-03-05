import { useState } from "react";
import API from "../api/api";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import ChatBox from "../components/ChatBox";

const INDIAN_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)" },
  { code: "as", label: "অসমীয়া (Assamese)" },
  { code: "ur", label: "اردو (Urdu)" },
];

const PdfSummary = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("en");
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const usableHeight = pageHeight - 20;
      let srcY = 0;
      while (srcY < imgHeight) {
        pdf.addImage(imgData, "JPEG", 10, 10 - srcY, imgWidth, imgHeight);
        srcY += usableHeight;
        if (srcY < imgHeight) pdf.addPage();
      }
      pdf.save(`PDF-Summary-${new Date().toISOString().split("T")[0]}.pdf`);
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
      const msg = err.response?.data?.message || err.message || "Failed to summarize PDF. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedLang = INDIAN_LANGUAGES.find((l) => l.code === language);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-light">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">PDF Summarizer</h1>
            <p className="text-slate-600 text-base sm:text-lg">Upload any PDF document and let our AI distill it into a concise summary.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 sm:p-12 text-center hover:border-primary transition-colors cursor-pointer group relative">
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

              {/* Language Selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="material-symbols-outlined text-base text-primary">translate</span>
                  Summary Language
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
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

          {summary && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 p-6 sm:p-8 pb-4 sm:pb-4 gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Executive Summary</h2>
                    {language !== "en" && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-xs">translate</span>
                        {selectedLang?.label}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <><div className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"></div> Generating...</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">download</span> Download PDF</>
                  )}
                </button>
              </div>
              <div id="pdf-content" className="p-6 sm:p-10 pt-6">
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-sans text-lg">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>

              {/* Chat Interface */}
              <ChatBox contextText={summary} sourceName="PDF Document" language={language} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfSummary;
