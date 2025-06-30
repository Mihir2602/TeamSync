/* eslint-disable prettier/prettier */
// src/components/Header/Header.jsx
import { useState } from 'react';
import './Header.css';
const Header = ({ onAuthClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleAuthClick = (mode) => {
    setIsMenuOpen(false);
    onAuthClick(mode);
  };
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <a href="/" className="logo">
            <img 
              src="/myLogo.jpg" 
              alt="TeamSync Logo" 
              className="logo-image"
            />
            <span className="logo-text">TeamSync</span>
          </a>
         
          <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-list">
              <li>
                <button
                  className="nav-link"
                  onClick={() => handleAuthClick('register')}
                  aria-label="Register for TeamSync"
                >
                  Register
                </button>
              </li>
              <li>
                <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </a>
              </li>
              <li>
                <button
                  className="nav-link"
                  onClick={() => handleAuthClick('login')}
                  aria-label="Login to TeamSync"
                >
                  Login
                </button>
              </li>
            </ul>
          </nav>
         
          <button
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;