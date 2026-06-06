import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: Info and Download App */}
          <div className="footer-col info-col">
            
            <div className="footer-download-section">
              <h4 className="footer-section-title">Download App</h4>
              <div className="footer-badge-container">
                <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="footer-badge-link">
                  <img src="/images/google-play-badge.svg" alt="Get it on Google Play" className="footer-badge-img" />
                </a>
                <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" className="footer-badge-link">
                  <img src="/images/app-store-badge.svg" alt="Download on the App Store" className="footer-badge-img" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Connect With Us */}
          <div className="footer-col">
            <h4 className="footer-col-title">Connect With Us</h4>
            <ul className="footer-links-list">
              <li><a href="https://www.instagram.com/saranga_ayurveda" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://www.facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
            </ul>
          </div>

          {/* Column 4: Let Us Help You */}
          <div className="footer-col">
            <h4 className="footer-col-title">Let Us Help You</h4>
            <ul className="footer-links-list">
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/profile/orders">My Orders</Link></li>
              <li><Link to="/profile/orders">Track My Order</Link></li>
            </ul>
          </div>

          {/* Column 5: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/explore">Trending</Link></li>
              <li><Link to="/contact-us">Contact Us</Link></li>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/careers">Internships</Link></li>
            </ul>
          </div>

          {/* Column 6: Support Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/legal/terms">Terms & Conditions</Link></li>
              <li><Link to="/legal/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/legal/shipping">Shipping and Delivery Policy</Link></li>
              <li><Link to="/legal/refund">Return/Cancellation Policy</Link></li>
              <li><Link to="/legal/refund">Refund Policy</Link></li>
              <li><Link to="/faqs">FAQs</Link></li>
              <li><Link to="/help">Help</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom copyright */}
        <div className="footer-bottom-copyright">
          <p>© 2026 by Saranga Ayurveda. All Rights Reserved</p>
          <p className="footer-made-in">Proudly Made In India</p>
        </div>
      </div>
    </footer>
  );
}
