import Header from './components/Header'
import Hero from './components/Hero'
import Stories from './components/Stories'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'

function App() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <Stories />
          <Features />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
