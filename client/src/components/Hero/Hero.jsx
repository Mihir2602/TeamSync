/* eslint-disable prettier/prettier */
// src/components/Hero/Hero.jsx
import { useEffect, useState } from 'react';
import './Hero.css';

const Hero = ({ onGetStarted }) => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Hackathon', 'Contests', 'Hiring', 'Learning'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Track your <span className="rotating-word">{words[currentWord]}</span> journey
        </h1>
        <p className="hero-subtitle">
          Structured progress tracking for teams - DSA, Development & Learning updates in one place
        </p>
        <div className="hero-cta">
          <button 
            className="cta-primary" 
            onClick={onGetStarted}
            aria-label="Get started with TeamSync"
          >
            Get Started
          </button>
          <button 
            className="cta-secondary"
            aria-label="View demo of TeamSync"
            
          >
            See Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;