import { Link } from 'react-router-dom';
import './Foundation.css';

export default function GetInvolved() {
  return (
    <div className="foundation-page page-fade-in">
      <div className="foundation-container">
        {/* Top Navigation */}
        <div className="foundation-sub-nav">
          <Link to="/foundation/who-we-are" className="foundation-sub-nav-link">WHO WE ARE</Link>
          <Link to="/foundation/what-we-do" className="foundation-sub-nav-link">WHAT WE DO</Link>
          <Link to="/foundation/news-events" className="foundation-sub-nav-link">NEWS & EVENTS</Link>
          <Link to="/foundation/get-involved" className="foundation-sub-nav-link active">GET INVOLVED</Link>
        </div>

        {/* Content Section */}
        <div className="foundation-get-involved">
          <div className="foundation-orange-badge">
            <span>Take Action</span>
          </div>

          <h1 className="foundation-section-heading">
            Join Us In Making<br />A Difference
          </h1>

          {/* Actions */}
          <div className="foundation-actions-row">
            <button className="foundation-volunteer-btn" onClick={() => alert('Thank you for your interest! We will contact you soon.')}>
              VOLUNTEER NOW
            </button>
            <a href="#learn-more" className="foundation-help-link">
              <span>LEARN MORE</span>
              <span className="foundation-arrow-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
