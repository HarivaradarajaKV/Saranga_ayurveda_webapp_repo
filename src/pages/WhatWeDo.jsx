import { Link } from 'react-router-dom';
import './Foundation.css';

export default function WhatWeDo() {
  return (
    <div className="foundation-page page-fade-in foundation-white-bg">
      <div className="foundation-container">
        {/* Top Navigation */}
        <div className="foundation-sub-nav">
          <Link to="/foundation/who-we-are" className="foundation-sub-nav-link">WHO WE ARE</Link>
          <Link to="/foundation/what-we-do" className="foundation-sub-nav-link active">WHAT WE DO</Link>
          <Link to="/foundation/news-events" className="foundation-sub-nav-link">NEWS & EVENTS</Link>
          <Link to="/foundation/get-involved" className="foundation-sub-nav-link">GET INVOLVED</Link>
        </div>

        {/* Content Section */}
        <div className="foundation-what-we-do">
          <div className="foundation-green-badge">
            <span>What We Do</span>
          </div>

          <h1 className="foundation-section-heading">
            Providing Hope And Help<br />During Challenging Times
          </h1>

          <div className="foundation-learn-more-row">
            <a href="#learn-more" className="foundation-help-link">
              <span>LEARN MORE</span>
              <span className="foundation-arrow-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </span>
            </a>
          </div>

          <div className="foundation-cards-grid">
            <div className="foundation-outline-card">
              <img 
                src="/images/foundation/card_1.png" 
                alt="Card 1" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x360?text=Card+1+Image'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '39px', display: 'block' }}
              />
            </div>
            <div className="foundation-outline-card">
              <img 
                src="/images/foundation/card_2.png" 
                alt="Card 2" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x360?text=Card+2+Image'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '39px', display: 'block' }}
              />
            </div>
            <div className="foundation-outline-card">
              <img 
                src="/images/foundation/card_3.png" 
                alt="Card 3" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x360?text=Card+3+Image'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '39px', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
