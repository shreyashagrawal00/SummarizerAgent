import { useState, useRef, useEffect } from "react";
import API from "../api/api";
import ReactMarkdown from "react-markdown";

export default function ChatBox({ contextText, sourceName, language = "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Ask me anything about the **${sourceName}** you just summarized!` }
  ]);
  const [input, setInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!input.trim() || !contextText) return;

    const userQuestion = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userQuestion }]);
    setIsAsking(true);

    try {
      // Send the entire conversation history (excluding the very first system-like message)
      const history = messages.slice(1);

      const res = await API.post("/chat/ask", {
        contextText,
        question: userQuestion,
        language,
        history
      });

      setMessages(prev => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: err.response?.data?.message === "AI Quota Exceeded"
          ? "⚠️ AI Quota Exceeded. Please check billing."
          : "❌ Sorry, I failed to get an answer. Please try again."
      }]);
    } finally {
      setIsAsking(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-lg shadow-slate-900/20 hover:-translate-y-1 hover:shadow-xl transition-all z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8"
      >
        <span className="material-symbols-outlined text-2xl">forum</span>
        <span className="font-bold pr-2 hidden sm:inline">Ask Questions</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[calc(100%-3rem)] sm:w-[400px] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-12">
      {/* Header */}
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined">robot_2</span>
          <h3 className="font-bold font-display">Chat with Document</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 px-4 ${msg.role === "user"
              ? "bg-slate-900 text-white rounded-tr-none"
              : "bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none prose prose-p:my-1 prose-sm"
              }`}>
              {msg.role === "user" ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
            </div>
          </div>
        ))}
        {isAsking && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-none p-3 px-4 shadow-sm flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.15s]"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.3s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleAsk} className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isAsking}
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isAsking}
          className="bg-slate-900 text-white p-2 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </form>
    </div>
  );
}
