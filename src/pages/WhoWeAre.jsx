import { Link } from 'react-router-dom';
import './Foundation.css';

export default function WhoWeAre() {
  return (
    <div className="foundation-page page-fade-in foundation-white-bg">
      <div className="foundation-container">
        {/* Top Navigation */}
        <div className="foundation-sub-nav">
          <Link to="/foundation/who-we-are" className="foundation-sub-nav-link active">WHO WE ARE</Link>
          <Link to="/foundation/what-we-do" className="foundation-sub-nav-link">WHAT WE DO</Link>
          <Link to="/foundation/news-events" className="foundation-sub-nav-link">NEWS & EVENTS</Link>
          <Link to="/foundation/get-involved" className="foundation-sub-nav-link">GET INVOLVED</Link>
        </div>

        {/* Content Section: Text Block */}
        <div className="foundation-text-content">
          <Link to="/foundation" className="foundation-back-logo">
            <img src="/images/logo.png" alt="Saranga Logo" className="foundation-mini-logo" />
          </Link>
          
          <p className="foundation-para font-medium">
            Saranga Anugraha Foundation was established with a clear purpose
          </p>
          <p className="foundation-para">
            to bring authentic Ayurvedic healing and compassionate social support to people who truly need it but cannot afford it.
          </p>
          
          <p className="foundation-para">
            In today's fast-paced world, many individuals suffer from chronic illnesses, stress, lifestyle disorders,<br />
            and financial limitations that prevent them from accessing quality healthcare.
          </p>
          
          <p className="foundation-para">
            The foundation was born from the belief that: Healthcare should be a right, not a privilege.
          </p>
          
          <p className="foundation-para">
            Ayurveda has the power to restore wellbeing naturally. No individual should be left helpless due to financial difficulties.
          </p>
          
          <p className="foundation-para">
            The foundation is built on compassion, community support, and the values of traditional healing blended with modern care.
          </p>

          <p className="foundation-para">
            We are Saranga Ayurveda—a humble blend of tradition, care, and community.<br />
            Rooted in ancient Ayurvedic wisdom and guided by the rhythms of nature,<br />
            we craft wellness solutions that speak to real people and real lives. We're not here just to offer products.
          </p>
          
          <p className="foundation-para">
            We're here to share a way of living—one that honors balance, celebrates connection, and restores harmony in everyday moments.<br />
            With every herb we source and every remedy we create, our purpose is simple: to help you feel seen, supported, and whole.
          </p>

          <p className="foundation-para">
            Because true wellness is not just about healing the body—it's about nurturing the mind, uplifting the spirit, and reconnecting with nature.
          </p>

          <p className="foundation-para-bold">
            This is us. And we're here for you—naturally.
          </p>
        </div>
      </div>
    </div>
  );
}
