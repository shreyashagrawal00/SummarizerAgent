# Briefly (SummarizerAgent) 🚀

**Briefly** is a high-performance, AI-driven information processing hub designed to eliminate content overload. It transforms long-form content—from YouTube videos and PDFs to news feeds and emails—into actionable, high-quality summaries in seconds.

Built with a "Premium-First" philosophy, Briefly combines a sleek, responsive interface with powerful AI models to help you stay informed without the fatigue.

---

## ✨ Features that Empower You

### 📺 YouTube Video Intelligence
No more scrubbing through hour-long videos. Drop a link and get a structured, point-by-point summary of the key takeaways, saving you hours of playback time.

### 📄 Deep PDF Analysis & Chat
Upload technical papers, reports, or books. Briefly doesn't just summarize; it lets you **Chat with your Document**. Ask questions, extract specific data points, and download your AI-generated insights back to PDF.

### 🌐 Webpage Distillation
Found a long-read article or a complex blog post? Paste the URL and get a clean, distilled version of the main arguments and conclusions instantly.

### 📧 Gmail Inbox Digest
Connect your Google account to scan your recent emails. Get a unified summary of your latest conversations so you know exactly what needs your attention before you even open your inbox.

### 📰 Live Global Intel Feed
Stay ahead of the curve with a real-time news engine. Browse global headlines and selectively summarize the stories that matter to you.

### 🔐 Secure & Seamless
- **Enterprise-Grade Auth:** Secure login via Google OAuth 2.0 or traditional JWT-based accounts.
- **Smart Theme:** Intelligent Dark/Light mode switching (now defaulting to Light for a clean start).
- **Responsive by Design:** Fully optimized for mobile, tablet, and desktop workflows.

---

## 🛠️ The Technology Behind Briefly

Briefly is built on a modern **MERN+AI** stack, engineered for scalability and speed.

### Frontend
- **Framework:** React 19 + Vite (for lightning-fast builds)
- **Styling:** Tailwind CSS v4 (Modern, utility-first design)
- **State & Routing:** React Router v7 & Context API
- **Utilities:** Axios (API), jsPDF (Exports), react-markdown (Rendering)

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB Atlas (Cloud-native data)
- **Security:** Helmet, CORS (configured for Vercel/Render), Express Rate Limit
- **Auth:** Passport.js (Google Strategy) & JWT

### AI & Integrations
- **LLM Orchestration:** OpenRouter (Mistral/Free models) & Google Gemini API
- **Data Sources:** NewsData.io (Live News), Supadata (Web/YouTube Scraping)

---

## 🚀 Speed Run: Setting Up Locally

Get your own instance of Briefly up and running in minutes.

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- API Keys: Google Cloud (OAuth), OpenRouter/Gemini, NewsData, Supadata.

### 2. Environment Configuration
Create a `.env` file in the `/server` directory:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_token_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
OPENROUTER_API_KEY=your_key
NEWS_API_KEY=your_key
YOUTUBE_API_KEY=your_key
SUPADATA_API_KEY=your_key
```

### 3. Ignition
From the root directory:

**Backend:**
```bash
cd server && npm install && npm run dev
```

**Frontend:**
```bash
cd client && npm install && npm run dev
```

Visit `http://localhost:5173` and start condensing the world!

---

## 🌍 Deployment

Briefly is pre-configured for the modern cloud:
- **Client:** Optimized for [Vercel](https://vercel.com)
- **Server:** Ready for [Render](https://render.com) or Heroku
- **Database:** Fully compatible with [MongoDB Atlas](https://mongodb.com/atlas)

---

Developed with ❤️ by [Your Name/GitHub Handle]
