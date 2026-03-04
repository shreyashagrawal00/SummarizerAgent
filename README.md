# SummarizerAgent 🚀

**SummarizerAgent** is an intelligent, AI-powered web application designed to help you process information faster. It connects to your daily workflows (documents, news, and emails) and uses advanced language models to generate concise, readable summaries.

---

## 🌟 Key Features

*   **PDF Summarization:** Upload long PDF documents and instantly receive a structured summary using advanced AI models. Download the generated summary back to PDF.
*   **Gmail Integration:** Securely connect your Google Account to view and summarize your recent inbox emails. Never miss an important detail in long email threads.
*   **Global Intel Feed:** Stay updated with real-time global news (powered by NewsData.io). Pick any article and let the AI generate a quick digest so you don't have to read the whole piece.
*   **Secure Authentication:** End-to-end secure login using Google OAuth 2.0 and JWT (JSON Web Tokens).
*   **Modern, Responsive UI:** A beautiful, intuitive, and mobile-friendly interface built with React and styled with Tailwind CSS.

---

## 🛠️ Tech Stack & Technologies Used

This project follows a modern **MERN-style** architecture (MongoDB, Express, React, Node.js) with several third-party integrations.

### Frontend
*   **Framework:** [React 19](https://react.dev/) built with [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Routing:** [React Router v7](https://reactrouter.com/)
*   **Data Fetching:** [Axios](https://axios-http.com/)
*   **Markdown Rendering:** `react-markdown` (for rendering structured AI output)
*   **PDF Generation:** `jsPDF` & `html2canvas` (for exporting summaries)

### Backend
*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
*   **Authentication:** 
    *   [Passport.js](http://www.passportjs.org/) (Google OAuth 2.0)
    *   [JSON Web Tokens (JWT)](https://jwt.io/)
*   **File Uploads:** `multer` (for handling PDF uploads to memory)
*   **PDF Parsing:** `pdf-parse` (for extracting text from uploaded PDFs)
*   **Security & Optimization:** `helmet` (HTTP headers), `cors`, `express-rate-limit`

### Third-Party APIs & AI Services
*   **Google APIs:** Google Identity (OAuth) and Gmail API (Read-only access)
*   **LLM Provider:** [OpenRouter](https://openrouter.ai/) (Utilizing models like `mistralai/mistral-7b-instruct:free`) & Google Gemini API.
*   **News API:** [NewsData.io](https://newsdata.io/) (for fetching live global news articles)

---

## 🚀 Getting Started (Local Development)

To run this project locally, follow these steps:

### Prerequisites
*   Node.js (v18+ recommended)
*   A local MongoDB instance or a free MongoDB Atlas Cloud cluster
*   API Keys for Google Cloud (OAuth), OpenRouter (or Gemini), and NewsData.io

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/SummarizerAgent.git
cd SummarizerAgent
```

### 2. Set up the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add the following variables:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/summarizer_agent

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_string
REFRESH_SECRET=your_super_secret_refresh_string

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
CLIENT_URL=http://localhost:5173

# API Keys
NEWS_API_KEY=your_newsdata_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
# GEMINI_API_KEY=your_gemini_api_key (Optional)
```
Start the backend server:
```bash
npm run dev
```

### 3. Set up the Frontend (in a new terminal)
```bash
cd ../client
npm install
```
Start the frontend development server:
```bash
npm run dev
```

The application should now be running! The frontend will be available at `http://localhost:5173` and it will automatically talk to the backend at `http://localhost:5001`.

---

## 🌐 Deployment Overview

The application is configured to be easily deployed to modern cloud providers:
*   **Frontend:** Designed for deployment on [Vercel](https://vercel.com/) or Netlify.
*   **Backend:** Designed for deployment on [Render.com](https://render.com/), Heroku, or DigitalOcean Apps.
*   **Database:** Utilizing [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a live cloud database.

*(Remember to update the `CLIENT_URL` on the backend, the `VITE_API_URL` on the frontend, and the Authorized URIs in the Google Cloud Console when moving to production!)*
