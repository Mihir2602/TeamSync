/* eslint-disable prettier/prettier */
// src/pages/LandingPage.jsx
import { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import AuthModal from '../components/auth/AuthModal';
import FeatureCard from '../components/FeatureCard/FeatureCard';
import Testimonials from '../components/Testimonials/Testimonials';
import Footer from '../components/Footer/Footer';
import './LandingPage.css';

const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Load Vimeo player script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const features = [
    {
      icon: '📊',
      title: 'Structured Updates',
      description: 'Categorized posts with tags & attachments'
    },
    {
      icon: '📈',
      title: 'Progress Analytics',
      description: 'Visual dashboards with team metrics'
    },
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description: 'Set and monitor personal/team objectives'
    },
    {
      icon: '⚡',
      title: 'Real-time Collaboration',
      description: 'Notifications & activity feeds'
    }
  ];

  return (
    <div className="landing-page">
      <Header 
        onAuthClick={(mode) => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }} 
      />
      
      <main>
        <Hero onGetStarted={() => {
          setAuthMode('register');
          setIsAuthModalOpen(true);
        }} />
        
        <section className="features-section" id="features">
          <div className="container">
            <h2 className="section-title">Why Teams Choose TeamSync</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        <Testimonials />
        
        <section className="tech-stack">
          <div className="container">
            <h2 className="section-title">Built With Modern Technologies</h2>
            <div className="badges">
              <span className="badge">MERN Stack</span>
              <span className="badge">MongoDB Atlas</span>
              <span className="badge">React 18</span>
              <span className="badge">Node.js</span>
              <span className="badge">JWT Auth</span>
            </div>
          </div>
        </section>

        <section className="demo-video" id="demo">
          <div className="container">
            <h2 className="section-title">See TeamSync in Action</h2>
            <div className="video-container">
              <iframe 
                src="https://player.vimeo.com/video/1096093686?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&title=0&byline=0&portrait=0&controls=0&muted=1" 
                frameBorder="0" 
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                title="TeamSync Demo"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </div>
        </section>
        
        <section className="contact-section" id="contact">
          <div className="container">
            <h2 className="section-title">Get In Touch</h2>
            <div className="contact-content">
              <p>Have questions about TeamSync? Our team is ready to help!</p>
              <a href="mailto:contact@teamsync.app" className="contact-email">
                contact@teamsync.app
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default LandingPage;