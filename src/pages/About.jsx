import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <img 
          src="/images/about-hero.jpg" 
          alt="Saranga Ayurveda Heritage" 
          className="about-hero-img"
        />
      </section>

      {/* Page Header */}
      <header className="about-page-header container">
        <h1 className="about-main-title">Saranga Sampradaya</h1>
      </header>

      {/* Content Section */}
      <section className="about-content container">
        <div className="about-section">
          <h2>All About Saranga Ayurveda</h2>
          <p>
            At Saranga Ayurveda, we believe that true wellness begins with harmony between the body, mind, and nature. 
            Founded with a vision to make Ayurveda accessible for everyone, every day, we blend age-old traditions 
            with modern science to craft herbal remedies that support holistic health and natural healing.
          </p>
          <p>
            Based in Bengaluru, our formulations are inspired by classical Ayurvedic texts and prepared with 
            ethically sourced herbs, ensuring purity, potency, and sustainability. From immunity boosters to 
            skincare and lifestyle wellness, our products are designed to bring the timeless benefits of 
            Ayurveda into your daily routine.
          </p>
          <p>
            Join us on a journey toward balanced living—where nature nurtures, and wellness is a way of life.
          </p>
        </div>

        <div className="about-section">
          <h2>Connecting People</h2>
          <p>
            At Saranga Ayurveda, we’re more than just an Ayurvedic brand — we’re a community rooted in care, 
            connection, and the healing power of nature. Our mission is simple: to bring Ayurveda into your 
            life in ways that feel personal, practical, and profoundly nurturing.
          </p>
          <p>
            Born in Bengaluru and inspired by centuries of wisdom, our handcrafted products are created not 
            just to heal, but to connect — you with yourself, your well-being, and the natural world around 
            you. Whether you’re starting your wellness journey or continuing a lifelong practice, we’re 
            here to walk with you every step of the way.
          </p>
          <p>
            Because at Saranga, Ayurveda isn’t just a tradition — it’s a relationship.
          </p>
        </div>

        <div className="about-section">
          <h2>This Is Us</h2>
          <p>
            We are Saranga Ayurveda — a humble blend of tradition, care, and community.
            Rooted in ancient Ayurvedic wisdom and nurtured by nature, we create wellness solutions that 
            speak to real people and real lives.
          </p>
          <p>
            We’re not here to sell a product. We’re here to share a way of living — one that honors balance, 
            celebrates connection, and restores harmony in everyday life.
            With every herb we blend and every remedy we offer, our purpose is to help you feel seen, 
            supported, and whole.
          </p>
          <p>
            This is us. And we’re here for you — naturally.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
