import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Hero from '../components/Hero'
import Stories from '../components/Stories'
import Features from '../components/Features'
import CTA from '../components/CTA'

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Hero />
      <Stories />
      <Features />
      <CTA />
    </>
  )
}

export default Home
