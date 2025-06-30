/* eslint-disable prettier/prettier */
// src/components/Footer/Footer.jsx
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="logo">
              <img 
              src="/myLogo.jpg" 
              alt="TeamSync Logo" 
              className="logo-image"
            />
              <span className="logo-text">TeamSync</span>
            </div>
            <p className="footer-description">
              Structured progress tracking for hackathon teams, helping you replace WhatsApp updates with a dedicated platform.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Twitter">Twitter</a>
              <a href="#" aria-label="LinkedIn">LinkedIn</a>
              <a href="#" aria-label="GitHub">GitHub</a>
              <a href="#" aria-label="Instagram">Instagram</a>
            </div>
          </div>
          
          <div className="footer-col">
            <h3 className="footer-heading">Product</h3>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#demo">Demo</a></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3 className="footer-heading">Company</h3>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3 className="footer-heading">Resources</h3>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Partners</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {new Date().getFullYear()} TeamSync. All rights reserved.
          </div>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;