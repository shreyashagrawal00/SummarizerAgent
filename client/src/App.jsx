import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NewsFeed from './pages/NewsFeed'
import GmailFeed from './pages/GmailFeed'
import Dashboard from './pages/Dashboard'
import PdfSummary from './pages/PdfSummary'
import YoutubeSummary from './pages/YoutubeSummary'
import WebSummary from './pages/WebSummary'

function App() {
  return (
    <Router>
      <div className="antialiased min-h-screen">
        <div className="relative flex min-h-screen w-full flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/feed" element={<NewsFeed />} />
              <Route path="/gmail" element={<GmailFeed />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pdf" element={<PdfSummary />} />
              <Route path="/youtube" element={<YoutubeSummary />} />
              <Route path="/web" element={<WebSummary />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  )
}


export default App
