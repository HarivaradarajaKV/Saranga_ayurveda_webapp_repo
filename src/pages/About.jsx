import React from 'react';
import { Leaf, Sparkles, Heart, ShieldCheck, Mountain, Sprout, Globe, Droplet, Sun, Users } from 'lucide-react';
import SEO from '../components/SEO';
import './About.css';

export default function About() {
  return (
    <div className="story-page page-fade-in">
      <SEO 
        title="Our Story | Saranga Ayurveda"
        description="Learn about Saranga Ayurveda's heritage. Discover how we source raw materials from Himalayas to deliver you the Best."
        keywords="Saranga Ayurveda, Ayurvedic heritage, authentic ayurveda, natural wellness story, Himalayan herbs"
        canonicalPath="/about"
      />
      
      {/* ── SECTION 1: HERO ── */}
      <section className="story-hero-section" id="our-story">
        <div className="story-hero-overlay"></div>
        <div className="story-container">
          <div className="story-hero-content">
            <div className="story-section-label">
              <span className="story-label-text">OUR STORY</span>
              <span className="story-label-leaf">🍃</span>
            </div>
            
            <h1 className="story-hero-title font-serif-main">
              Sourced raw materials<br />
              from Himalayas to<br />
              deliver you <span className="italic-serif-highlight">the Best.</span>
            </h1>

            {/* Inline Image on Mobile, Background on Desktop */}
            <div className="story-hero-image-box">
              <img 
                src="/images/Our Story images/OS_01_Sourced_US.webp" 
                alt="Sourced Raw Materials" 
                className="story-hero-inline-img"
                loading="eager"
                fetchpriority="high"
              />
            </div>

            <div className="story-separator-heart">
              <span className="story-heart-line"></span>
              <span className="story-heart-icon">♥</span>
              <span className="story-heart-line"></span>
            </div>

            <p className="story-hero-description">
              At Saranga Ayurveda, nature is our greatest healer and the Himalayas are our purest source. We travel to the highest altitudes to bring back the finest, most potent raw materials for you.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: ROOTED IN NATURE ── */}
      <section className="story-rooted-section">
        <div className="story-container">
          <div className="story-rooted-grid">
            <div className="story-rooted-image-box">
              <img 
                src="/images/Our Story images/OS_02_Rooted in Nature_US.webp" 
                alt="Rooted in Nature" 
                className="story-rooted-img"
                loading="lazy"
              />
            </div>
            
            <div className="story-rooted-content-box">
              <h2 className="story-rooted-title font-serif-main">
                Rooted in <span className="italic-serif-highlight">Nature.</span><br />
                Driven by <span className="italic-serif-highlight">Purpose.</span>
              </h2>

              <div className="story-separator-heart-left">
                <span className="story-heart-line"></span>
                <span className="story-heart-icon">♥</span>
                <span className="story-heart-line"></span>
              </div>

              <p className="story-rooted-text">
                Our journey began with a simple belief - that true wellness comes from the purity of nature and the wisdom of Ayurveda. This belief takes us to the untouched regions of the Himalayas, where we source powerful herbs and minerals, ethically and sustainably.
              </p>

              {/* 4 Badges Grid */}
              <div className="story-badges-grid">
                <div className="story-badge-item">
                  <div className="story-badge-circle">
                    <Mountain size={20} strokeWidth={1.5} />
                  </div>
                  <span className="story-badge-text">Sourced from Himalayas</span>
                </div>

                <div className="story-badge-item">
                  <div className="story-badge-circle">
                    <Sprout size={20} strokeWidth={1.5} />
                  </div>
                  <span className="story-badge-text">100% Natural & Pure</span>
                </div>

                <div className="story-badge-item">
                  <div className="story-badge-circle">
                    <Leaf size={20} strokeWidth={1.5} />
                  </div>
                  <span className="story-badge-text">Backed by Ayurvedic Wisdom</span>
                </div>

                <div className="story-badge-item">
                  <div className="story-badge-circle">
                    <Globe size={20} strokeWidth={1.5} />
                  </div>
                  <span className="story-badge-text">Ethical & Sustainable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: OUR PROCESS ── */}
      <section className="story-process-section" id="our-process">
        <div className="story-container">
          <div className="story-process-header">
            <div className="story-section-label centered">
              <span className="story-label-text">OUR PROCESS</span>
              <span className="story-label-leaf">🍃</span>
            </div>
            <h2 className="story-process-title font-serif-main">
              From the Himalayas to <span className="italic-serif-highlight">You</span>
            </h2>
          </div>

          {/* Desktop Timeline flow */}
          <div className="story-desktop-timeline-wrap">
            <div className="story-timeline-container">
              <div className="story-timeline-line"></div>
              <div className="story-timeline-steps">
                <div className="story-timeline-step-icon-wrap"><div className="story-step-circle"><Sprout size={18} /></div></div>
                <div className="story-timeline-step-icon-wrap"><div className="story-step-circle"><Leaf size={18} /></div></div>
                <div className="story-timeline-step-icon-wrap"><div className="story-step-circle"><ShieldCheck size={18} /></div></div>
                <div className="story-timeline-step-icon-wrap"><div className="story-step-circle"><Sparkles size={18} /></div></div>
                <div className="story-timeline-step-icon-wrap"><div className="story-step-circle"><Heart size={18} /></div></div>
              </div>
            </div>

            <div className="story-process-grid">
              <div className="story-process-card">
                <div className="story-process-img-box"><img src="/images/Our Story images/1 Handpicked_US.webp" alt="Handpicked" loading="lazy" /></div>
                <h4 className="story-process-card-title">1. Handpicked</h4>
                <p className="story-process-card-desc">We handpick the finest herbs at high altitudes.</p>
              </div>
              <div className="story-process-card">
                <div className="story-process-img-box"><img src="/images/Our Story images/2 Naturally Dried_US.webp" alt="Naturally Dried" loading="lazy" /></div>
                <h4 className="story-process-card-title">2. Naturally Dried</h4>
                <p className="story-process-card-desc">Carefully dried using traditional methods to retain maximum potency.</p>
              </div>
              <div className="story-process-card">
                <div className="story-process-img-box"><img src="/images/Our Story images/3 Quality Assured_US.webp" alt="Quality Assured" loading="lazy" /></div>
                <h4 className="story-process-card-title">3. Quality Assured</h4>
                <p className="story-process-card-desc">Stringent quality checks ensure purity and authenticity.</p>
              </div>
              <div className="story-process-card">
                <div className="story-process-img-box"><img src="/images/Our Story images/4 Expertly Processed_US.webp" alt="Expertly Processed" loading="lazy" /></div>
                <h4 className="story-process-card-title">4. Expertly Processed</h4>
                <p className="story-process-card-desc">Processed in our GMP certified facilities with Ayurvedic expertise.</p>
              </div>
              <div className="story-process-card">
                <div className="story-process-img-box"><img src="/images/Our Story images/5 Delivered to you_US.webp" alt="Delivered to You" loading="lazy" /></div>
                <h4 className="story-process-card-title">5. Delivered to You</h4>
                <p className="story-process-card-desc">Delivered to your doorstep, bringing the best of Himalayas to you.</p>
              </div>
            </div>
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="story-mobile-timeline">
            {/* Step 1 */}
            <div className="story-mobile-timeline-item">
              <div className="story-mobile-step-img">
                <img src="/images/Our Story images/1 Handpicked_US.webp" alt="Handpicked" loading="lazy" />
              </div>
              <div className="story-mobile-step-line-col">
                <div className="story-mobile-step-circle">
                  <Sprout size={16} />
                </div>
                <div className="story-mobile-step-connector"></div>
              </div>
              <div className="story-mobile-step-content">
                <h4 className="story-mobile-step-title">1. Handpicked</h4>
                <p className="story-mobile-step-desc">We handpick the finest herbs at high altitudes.</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="story-mobile-timeline-item">
              <div className="story-mobile-step-img">
                <img src="/images/Our Story images/2 Naturally Dried_US.webp" alt="Naturally Dried" loading="lazy" />
              </div>
              <div className="story-mobile-step-line-col">
                <div className="story-mobile-step-circle">
                  <Leaf size={16} />
                </div>
                <div className="story-mobile-step-connector"></div>
              </div>
              <div className="story-mobile-step-content">
                <h4 className="story-mobile-step-title">2. Naturally Dried</h4>
                <p className="story-mobile-step-desc">Carefully dried using traditional methods to retain maximum potency.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="story-mobile-timeline-item">
              <div className="story-mobile-step-img">
                <img src="/images/Our Story images/3 Quality Assured_US.webp" alt="Quality Assured" loading="lazy" />
              </div>
              <div className="story-mobile-step-line-col">
                <div className="story-mobile-step-circle">
                  <ShieldCheck size={16} />
                </div>
                <div className="story-mobile-step-connector"></div>
              </div>
              <div className="story-mobile-step-content">
                <h4 className="story-mobile-step-title">3. Quality Assured</h4>
                <p className="story-mobile-step-desc">Stringent quality checks ensure purity and authenticity.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="story-mobile-timeline-item">
              <div className="story-mobile-step-img">
                <img src="/images/Our Story images/4 Expertly Processed_US.webp" alt="Expertly Processed" loading="lazy" />
              </div>
              <div className="story-mobile-step-line-col">
                <div className="story-mobile-step-circle">
                  <Sparkles size={16} />
                </div>
                <div className="story-mobile-step-connector"></div>
              </div>
              <div className="story-mobile-step-content">
                <h4 className="story-mobile-step-title">4. Expertly Processed</h4>
                <p className="story-mobile-step-desc">Processed in our GMP certified facilities with Ayurvedic expertise.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="story-mobile-timeline-item">
              <div className="story-mobile-step-img">
                <img src="/images/Our Story images/5 Delivered to you_US.webp" alt="Delivered to You" loading="lazy" />
              </div>
              <div className="story-mobile-step-line-col">
                <div className="story-mobile-step-circle">
                  <Heart size={16} />
                </div>
              </div>
              <div className="story-mobile-step-content">
                <h4 className="story-mobile-step-title">5. Delivered to You</h4>
                <p className="story-mobile-step-desc">Delivered to your doorstep, bringing the best of Himalayas to you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: OUR PROMISE BANNER ── */}
      <section className="story-promise-section" id="our-promise">
        <div className="story-container">
          <div className="story-promise-banner">
            {/* Circle with Tree Icon overlaid exactly where the printed circle is */}
            <div className="story-promise-circle-overlay">
              <svg className="story-promise-tree-svg" width="36" height="36" viewBox="0 0 100 100">
                <circle cx="50" cy="40" r="22" fill="#2E5D34" opacity="0.15" />
                <path d="M50,70 L50,55 M50,58 L42,50 M50,62 L58,54 M50,50 L40,40 M50,50 L60,40 M50,45 L45,35 M50,45 L55,35" stroke="#2E5D34" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="40" cy="40" r="6" fill="#2E5D34" />
                <circle cx="60" cy="40" r="6" fill="#2E5D34" />
                <circle cx="45" cy="35" r="5" fill="#2E5D34" />
                <circle cx="55" cy="35" r="5" fill="#2E5D34" />
                <circle cx="50" cy="28" r="7" fill="#2E5D34" />
                <circle cx="35" cy="48" r="5" fill="#2E5D34" />
                <circle cx="65" cy="48" r="5" fill="#2E5D34" />
                <path d="M50,70 L46,75 M50,70 L54,75 M50,70 L50,76" stroke="#2E5D34" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            
            <div className="story-promise-content">
              <h3 className="story-promise-title font-serif-main">Our Promise</h3>
              <p className="story-promise-text">
                We are committed to delivering the purest, most effective Ayurvedic products while honoring nature and empowering local communities.
              </p>
              
              <div className="story-separator-heart-center">
                <span className="story-heart-line"></span>
                <span className="story-heart-icon">♥</span>
                <span className="story-heart-line"></span>
              </div>

              <div className="story-promise-slogan">
                Pure by Nature. Purely for You.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOLISTIC QUOTE CARD ── */}
      <section className="story-quote-section">
        <div className="story-container">
          <div className="story-quote-banner">
            <div className="story-quote-overlay"></div>
            <div className="story-quote-content">
              <span className="story-quote-mark top">“</span>
              <h2 className="story-quote-text font-serif-main">
                From the purity<br />
                of Himalayas,<br />
                for your holistic<br />
                wellness.
              </h2>
              <span className="story-quote-mark bottom">”</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: WHY HIMALAYAS ── */}
      <section className="story-why-section">
        <div className="story-container">
          <div className="story-why-card">
            <h3 className="story-why-title font-serif-main">Why Himalayas?</h3>
            
            <div className="story-why-list">
              <div className="story-why-item">
                <div className="story-why-icon-circle">
                  <Leaf size={18} className="story-why-icon" />
                </div>
                <span className="story-why-text">Rich in biodiversity</span>
              </div>

              <div className="story-why-item">
                <div className="story-why-icon-circle">
                  <Droplet size={18} className="story-why-icon" />
                </div>
                <span className="story-why-text">Pure, unpolluted environment</span>
              </div>

              <div className="story-why-item">
                <div className="story-why-icon-circle">
                  <Sun size={18} className="story-why-icon" />
                </div>
                <span className="story-why-text">Ideal growing conditions for medicinal plants</span>
              </div>

              <div className="story-why-item">
                <div className="story-why-icon-circle">
                  <Users size={18} className="story-why-icon" />
                </div>
                <span className="story-why-text">Traditional knowledge & sustainable harvesting</span>
              </div>
            </div>

            <div className="story-why-badge">
              <div className="story-why-badge-icon">
                <Sprout size={18} />
              </div>
              <span className="story-why-badge-text">
                Experience the power of pure, natural, and authentic Ayurveda.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
