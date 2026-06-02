import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useCategories } from '../context/CategoryContext';
import ProductCard from '../components/ProductCard';
import { Leaf } from 'lucide-react';
import './Home.css';

const FOUR_STEP = [
  { title: 'Roopam', subtitle: 'Outer Beauty & Radiance', img: '/images/routine/roopam.jpg' },
  { title: 'Gunam', subtitle: 'Inner Beauty & Wellness', img: '/images/routine/gunam.jpg' },
  { title: 'Holistic Care', subtitle: 'Mind, Body & Spirit', img: '/images/routine/holistic.jpg' },
  { title: 'Vayastyag', subtitle: 'Lasting Beauty & Grace', img: '/images/routine/vayastyag.jpg' },
];

export default function Home() {
  const { categories, loading: catLoading } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    '/images/hero/hero_slide_1.jpg',
    '/images/hero/hero_slide_2.jpg',
    '/images/hero/hero_slide_3.jpg',
    '/images/hero/hero_slide_4.jpg',
  ];

  const bannerImages = [
    '/images/banner/banner_1.jpg',
    '/images/banner/banner_2.jpg',
  ];

  const [bannerSlide, setBannerSlide] = useState(0);

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  const bannerRef = useRef(null);
  const [bannerPhase, setBannerPhase] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!bannerRef.current) return;
      const rect = bannerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = -rect.top / (rect.height - viewportHeight);

      if (progress < 0.2) setBannerPhase(0);
      else if (progress < 0.6) setBannerPhase(1);
      else setBannerPhase(2);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [donationAmount, setDonationAmount] = useState('');

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get(`${ENDPOINTS.PRODUCTS}?new_arrivals=true&limit=8`);
      if (prodRes.data) {
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.products || []));
      }
    } catch { }
    setLoading(false);
  };

  return (
    <div className="home page-fade-in">
      {/* ── LUXURY AYURVEDA HERO BANNER ── */}
      <section className="hero-ayurveda">
        <div className="hero-ayurveda-content">
          <img src="/images/logo.png" alt="Saranga Logo" className="hero-ayurveda-logo" />

          <img src="/images/name.png" alt="Saranga Ayurveda" className="hero-ayurveda-name-img" />
          <h2 className="hero-specialist-title">We're Specialist in</h2>
          {/*<-- we need change--->*/}
        </div>
      </section>

      {/* ── CATEGORIES OVERLAY SECTION ── */}
      <section className="categories-overlay-container">
        <div className="container">
          <div className="categories-overlay-card">
            {!catLoading && categories.length > 0 && (
              <div className="categories-overlay-grid">
                {categories.map((cat) => (
                  <Link to={`/category/${cat.id}`} key={cat.id} className="category-overlay-item">
                    <div className="category-overlay-img-wrap">
                      {cat.image_url ? (
                        <img src={getImageUrl(cat.image_url)} alt={cat.name} className="category-overlay-img" />
                      ) : (
                        <div className="category-overlay-fallback">
                          <Leaf size={36} />
                        </div>
                      )}
                    </div>
                    <span className="category-overlay-name">{cat.name.toUpperCase()}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom Row of 4 Features */}
            <div className="features-divider" />
            <div className="hero-features-row">
              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <Leaf size={22} />
                </div>
                <div className="hero-feature-text">
                  <h3>Ayurvedic & Natural</h3>
                  <p>Clean, safe & effective</p>
                </div>
              </div>
              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <div className="hero-feature-text">
                  <h3>Holistic Care</h3>
                  <p>For every stage of life</p>
                </div>
              </div>
              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /></svg>
                </div>
                <div className="hero-feature-text">
                  <h3>Sustainable & Ethical</h3>
                  <p>Good for you, good for Earth</p>
                </div>
              </div>
              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <div className="hero-feature-text">
                  <h3>Trusted & Authentic</h3>
                  <p>Rooted in Ayurveda</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NATURE'S WELLNESS COLLECTION ── */}
      <section className="new-arrivals-section">
        <div className="container-large">
          <div className="section-header-centered">
            <span className="section-subtitle-ayur">Premium Selection</span>
            <h2 className="section-title-flat">Nature's Wellness Collection</h2>
            <p className="section-desc-ayur">
              Discover our premium selection of luxury Ayurvedic formulations, hand-crafted to restore balance and nurture your body naturally.
            </p>
          </div>

          {loading ? (
            <div className="new-arrivals-grid-custom">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: 260, height: 420, borderRadius: 24, background: '#efe7da', opacity: 0.6, margin: '0 auto' }} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="new-arrivals-grid-custom">
              {products.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="new-arrival-card">
                  <div className="new-arrival-img-wrap">
                    <img src={getImageUrl(p.image_url)} alt={p.name} className="new-arrival-img" />
                  </div>
                  <div className="new-arrival-info">
                    <h3 className="new-arrival-name">{p.name.toUpperCase()}</h3>
                    <span className="new-arrival-category">
                      {p.category_name ? p.category_name.toUpperCase() : p.category ? p.category.toUpperCase() : 'CAPSULES'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center" style={{ color: 'var(--text-light)', padding: '40px 0' }}>
              No products available yet.
            </p>
          )}
        </div>
      </section>

      {/* ── FOUR STEP ROUTINE ── */}
      <section className="four-step-section section-padding">
        <div className="container">
          <h2 className="section-title-center">Saranga's Four Step Routine</h2>
          <div className="four-step-grid">
            {FOUR_STEP.map((step, i) => (
              <div key={i} className="four-step-card">
                <img src={step.img} alt={step.title} className="four-step-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUY GENUINE BANNER (SCROLL-TRIGGERED) ── */}
      <div className="genuine-banner-sticky-wrapper" ref={bannerRef}>
        <section className="genuine-banner sticky-banner">
          <div className="container genuine-banner-inner">
            <div className="genuine-banner-text">
              <h2 className="banner-title-clean">Buy genuine Ayurveda products online and embrace a healthier, more natural lifestyle.</h2>
              <p className="banner-subtitle-clean">Ayurveda in INDIA</p>
              <Link to="/explore" className="banner-link-clean">SHOP SUBSCRIPTIONS</Link>
            </div>
            <div className="genuine-banner-carousel">
              {bannerImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Banner ${idx + 1}`}
                  className={`genuine-banner-img ${idx + 1 <= bannerPhase ? 'active' : ''}`}
                  style={{ zIndex: idx + 1 }}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
      {/* ── FOUNDATION SECTION ── */}
      <section className="foundation-section section-padding">
        <div className="container">
          <div className="foundation-upper">
            <div className="foundation-info">
              <h2 className="foundation-title">Saranga Anugraha Foundation</h2>
              <p className="foundation-desc">Saranga Anugraha Foundation was established with a clear purpose — to bring authentic Ayurvedic healing and compassionate social support to people who truly need it but cannot afford it.</p>
              <p className="foundation-desc">In today’s fast-paced world, many individuals suffer from chronic illnesses, stress, lifestyle disorders, and financial limitations that prevent them from accessing quality healthcare.</p>
              <div className="foundation-beliefs">
                <p>The foundation was born from the belief that:</p>
                <ul>
                  <li>Healthcare should be a right, not a privilege.</li>
                  <li>Ayurveda has the power to restore wellbeing naturally.</li>
                  <li>No individual should be left helpless due to financial difficulties.</li>
                </ul>
              </div>
            </div>

            <div className="foundation-form-card">
              <h3>Your Contribution to Needy</h3>
              <form className="foundation-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First name *</label>
                    <input type="text" placeholder="First name" required />
                  </div>
                  <div className="form-group">
                    <label>Last name *</label>
                    <input type="text" placeholder="Last name" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" placeholder="Email" required />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <div className="phone-input-wrap">
                      <span className="phone-flag">🇮🇳</span>
                      <input type="tel" placeholder="Phone" required />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Donation *</label>
                  <div className="donation-presets">
                    <button type="button" className={donationAmount === '1000' ? 'active' : ''} onClick={() => setDonationAmount('1000')}>₹1,000</button>
                    <button type="button" className={donationAmount === '2000' ? 'active' : ''} onClick={() => setDonationAmount('2000')}>₹2,000</button>
                    <button type="button" className={donationAmount === '3000' ? 'active' : ''} onClick={() => setDonationAmount('3000')}>₹3,000</button>
                  </div>
                  <input
                    type="number"
                    placeholder="Enter Custom Amount"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="custom-amount-input"
                  />
                </div>
                <button type="submit" className="donate-btn">Donate</button>
              </form>
            </div>
          </div>

          <div className="foundation-lower">
            <div className="foundation-image">
              <img src="/images/foundation/foundation_main.jpg" alt="Foundation Activity" />
            </div>
            <div className="foundation-about">
              <p className="foundation-tagline">The foundation is built on compassion, community support, and the values of traditional healing blended with modern care.</p>
              <p>We are Saranga Ayurveda—a humble blend of tradition, care, and community. Rooted in ancient Ayurvedic wisdom and guided by the rhythms of nature, we craft wellness solutions that speak to real people and real lives.</p>
              <p>We’re not here just to offer products. We’re here to share a way of living—one that honors balance, celebrates connection, and restores harmony in everyday moments. With every herb we source and every remedy we create, our purpose is simple: to help you feel seen, supported, and whole. Because true wellness is not just about healing the body—it’s about nurturing the mind, uplifting the spirit, and reconnecting with nature. This is us. And we’re here for you—naturally.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
