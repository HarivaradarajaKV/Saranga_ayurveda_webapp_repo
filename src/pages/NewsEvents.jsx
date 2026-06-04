import { Link } from 'react-router-dom';
import './Foundation.css';

export default function NewsEvents() {
  const events = [
    {
      id: 1,
      title: 'Free Ayurvedic Medical Camp',
      date: 'June 15, 2026',
      description: 'Providing free wellness consultations and herbal medicines to communities in need.'
    },
    {
      id: 2,
      title: 'Herbal Plantation Drive',
      date: 'July 04, 2026',
      description: 'Join us in planting rare medicinal herbs to preserve our traditional heritage.'
    },
    {
      id: 3,
      title: 'Community Health Awareness Seminars',
      date: 'August 12, 2026',
      description: 'Educating families on healthy living guidelines and seasonal preventive routines.'
    }
  ];

  return (
    <div className="foundation-page page-fade-in foundation-white-bg">
      <div className="foundation-container">
        {/* Top Navigation */}
        <div className="foundation-sub-nav">
          <Link to="/foundation/who-we-are" className="foundation-sub-nav-link">WHO WE ARE</Link>
          <Link to="/foundation/what-we-do" className="foundation-sub-nav-link">WHAT WE DO</Link>
          <Link to="/foundation/news-events" className="foundation-sub-nav-link active">NEWS & EVENTS</Link>
          <Link to="/foundation/get-involved" className="foundation-sub-nav-link">GET INVOLVED</Link>
        </div>

        {/* Content Section */}
        <div className="foundation-news-events">
          <div className="foundation-green-badge">
            <span>Updates</span>
          </div>

          <h1 className="foundation-section-heading">
            Our Latest Initiatives<br />And Community Work
          </h1>

          {/* Events Grid */}
          <div className="foundation-events-grid">
            {events.map((event) => (
              <div key={event.id} className="foundation-event-card">
                <span className="event-date">{event.date}</span>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
