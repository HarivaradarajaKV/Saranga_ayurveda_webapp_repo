import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Sparkles, Heart, HandHeart } from 'lucide-react';
import SEO from '../components/SEO';
import './About.css';

export default function About() {
  return (
    <div className="about-page page-fade-in">
      <SEO 
        title="Our Story | About Us"
        description="Learn about Saranga Ayurveda's heritage. Discover how we prepare organic beauty, haircare, and skin formulations based on authentic ancient Ayurveda in Bengaluru."
        keywords="Saranga Ayurveda Bengaluru, Ayurvedic heritage, authentic ayurveda, organic beauty brand, natural wellness story"
        canonicalPath="/about"
      />
      <div className="container about-container">
        {/* Breadcrumbs */}
        <div className="about-breadcrumbs">
          <Link to="/">Home</Link> <span>/</span> <span className="active">Our Story</span>
        </div>

        {/* ── SECTION 1: HERO ── */}
        <div className="about-section about-hero-section">
          <div className="about-text-col">
            <div className="about-section-label">OUR STORY</div>
            <h1 className="about-section-title font-serif-main">Rooted in Ayurveda.<br />Made for You.</h1>
            <div className="story-heart-separator">
              <span className="story-heart-line"></span>
              <span className="story-heart-icon">♥</span>
              <span className="story-heart-line"></span>
            </div>
            <p className="about-section-paragraph hero-para">
              At Saranga Ayurveda, we blend ancient wisdom with modern living to create pure, natural and effective wellness solutions for every day.
            </p>
          </div>
          <div className="about-img-col">
            <div className="about-image-wrapper">
              <img src="/images/about-hero.png" alt="Mortar and pestle" />
            </div>
          </div>
        </div>

        {/* ── SECTION 2: ALL ABOUT ── */}
        <div className="about-section about-all-about-section">
          <div className="about-text-col">
            <div className="about-section-label">
              <span>WHO WE ARE</span>
              <div className="label-underline"></div>
            </div>
            <h2 className="about-section-title">All About Saranga Ayurveda</h2>
            <p className="about-section-paragraph">
              At Saranga Ayurveda, we believe that true wellness begins with harmony between the body, mind, and nature. Founded with a vision to make Ayurveda accessible for everyone, every day, we blend age-old traditions with modern science to craft herbal remedies that support holistic health and natural healing.
            </p>
            <p className="about-section-paragraph">
              Based in Bengaluru, our formulations are inspired by classical Ayurvedic texts and prepared with ethically sourced herbs, ensuring purity, potency, and sustainability. From immunity boosters to skincare and lifestyle wellness, our products are designed to bring the timeless benefits of Ayurveda into your daily routine.
            </p>
            <p className="about-section-paragraph font-italic">
              Join us on a journey toward balanced living—where nature nurtures, and wellness is a way of life.
            </p>
          </div>
          <div className="about-img-col">
            <div className="about-image-wrapper">
              <img src="/images/about-heritage-ashram.png" alt="Amla and Ashwagandha oil" />
            </div>
          </div>
        </div>

        {/* ── SECTION 3: CONNECTING PEOPLE ── */}
        <div className="about-section about-connecting-section">
          <div className="about-img-col">
            <div className="about-image-wrapper">
              <img src="/images/about-community-gathering.png" alt="Copper bowl with green leaves" />
            </div>
          </div>
          <div className="about-text-col">
            <div className="about-section-label">
              <span>OUR MISSION</span>
              <div className="label-underline"></div>
            </div>
            <h2 className="about-section-title">Connecting People</h2>
            <p className="about-section-paragraph">
              At Saranga Ayurveda, we're more than just an Ayurvedic brand — we're a community rooted in care, connection, and the healing power of nature. Our mission is simple: to bring Ayurveda into your life in ways that feel personal, practical, and profoundly nurturing.
            </p>
            <p className="about-section-paragraph">
              Born in Bengaluru and inspired by centuries of wisdom, our handcrafted products are created not just to heal, but to connect — you with yourself, your well-being, and the natural world around you. Whether you're starting your wellness journey or continuing a lifelong practice, we're here to walk with you every step of the way.
            </p>
            <p className="about-section-paragraph font-italic">
              Because at Saranga, Ayurveda isn't just a tradition — it's a relationship.
            </p>
          </div>
        </div>

        {/* ── SECTION 4: THIS IS US ── */}
        <div className="about-section about-this-is-us-section">
          <div className="about-text-col">
            <div className="about-section-label">
              <span>OUR ESSENCE</span>
              <div className="label-underline"></div>
            </div>
            <h2 className="about-section-title">This Is Us</h2>
            <p className="about-section-paragraph">
              We are Saranga Ayurveda — a humble blend of tradition, care, and community.
            </p>
            <p className="about-section-paragraph">
              Rooted in ancient Ayurvedic wisdom and nurtured by nature, we create wellness solutions that speak to real people and real lives.
            </p>
            <p className="about-section-paragraph">
              We're not here to sell a product. We're here to share a way of living — one that honors balance, celebrates connection, and restores harmony in everyday life.
            </p>
            <p className="about-section-paragraph">
              With every herb we blend and every remedy we offer, our purpose is to help you feel seen, supported, and whole.
            </p>
            <p className="about-section-paragraph">
              This is us. And we're here for you — naturally.
            </p>
          </div>
          <div className="about-img-col">
            <div className="about-image-wrapper">
              <img src="/images/about-us-leaves.png" alt="Green leaves branch close-up" />
            </div>
          </div>
        </div>

        {/* ── CORE VALUES BAR ── */}
        <div className="about-values-bar">
          <div className="value-item">
            <div className="value-icon-wrap">
              <Leaf size={24} />
            </div>
            <h4 className="value-title">ROOTED IN TRADITION</h4>
            <p className="value-subtitle">Inspired by classical Ayurvedic wisdom.</p>
          </div>
          <div className="value-item">
            <div className="value-icon-wrap">
              <Sparkles size={24} />
            </div>
            <h4 className="value-title">PURE & EFFECTIVE</h4>
            <p className="value-subtitle">Crafted with clean, potent ingredients.</p>
          </div>
          <div className="value-item">
            <div className="value-icon-wrap">
              <HandHeart size={24} />
            </div>
            <h4 className="value-title">ETHICALLY SOURCED</h4>
            <p className="value-subtitle">Responsibly sourced for people and planet.</p>
          </div>
          <div className="value-item">
            <div className="value-icon-wrap">
              <Heart size={24} />
            </div>
            <h4 className="value-title">MADE FOR YOU</h4>
            <p className="value-subtitle">Thoughtful formulations for everyday wellness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
