import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <h1 className="footer-main-title">Saranga Ayurveda</h1>
        
        <div className="footer-layout">
          {/* Newsletter Column */}
          <div className="footer-col newsletter-col">
            <h3 className="footer-sub-title">Step Into a World of Ayurveda</h3>
            <p className="footer-text">We'll tell you about monthly drops and Skin care tips. No spam, we promise.</p>
            
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" required />
              <div className="newsletter-checkbox">
                <input type="checkbox" id="subscribe" required />
                <label htmlFor="subscribe">Yes, subscribe me to your newsletter.</label>
              </div>
              <button type="submit" className="join-btn">Join Now</button>
            </form>
          </div>

          {/* Links Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Helpful Links</h4>
            <ul className="footer-link-list">
              <li><Link to="/legal/terms">Terms & Conditions</Link></li>
              <li><Link to="/legal/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/legal/refund">Refund Policy</Link></li>
              <li><Link to="/legal/shipping">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <ul className="footer-link-list">
              <li><a href="mailto:sarangaconsumershelp@gmail.com">sarangaconsumershelp@gmail.com</a></li>
              <li><a href="tel:+919008145980">+91 9008145980</a></li>
              <li><span style={{ fontSize: '0.9rem', color: '#333', fontWeight: 500 }}>Saranga Ayurveda, Bengaluru, India</span></li>
            </ul>
            
            <div className="footer-social-wrap" style={{ marginTop: 24 }}>
              <a href="https://www.instagram.com/saranga_ayurveda" target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: 8 }}>Instagram</a>
              <a href="https://www.whatsapp.com/channel/0029Vb76UKxL2ATwk9Z5Sd1z" target="_blank" rel="noreferrer">WhatsApp Channel</a>
            </div>
          </div>
        </div>

        <div className="footer-copyright-area">
          <p>© 2025 by Saranga Ayurveda</p>
          <p className="developed-by">Developed and Maintained by Curiospry Technologies Pvt Ltd</p>
        </div>
      </div>
    </footer>
  );
}
