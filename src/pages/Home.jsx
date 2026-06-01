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
      const prodRes = await api.get(`${ENDPOINTS.PRODUCTS}?limit=8`);
      if (prodRes.data) {
        setProducts(Array.isArray(prodRes.data) ? prodRes.data.slice(0, 4) : (prodRes.data?.products || []).slice(0, 4));
      }
    } catch { }
    setLoading(false);
  };

  return (
    <div className="home page-fade-in">
      {/* ── SPLIT HERO ── */}
      <section className="hero-split">
        <div className="hero-split-left">
          <img src="/images/hero/hero_main.jpg" alt="Ayurvedic Products" className="hero-split-img" />
          <div className="hero-left-overlay">
            <p className="hero-left-text">
              Experience the power of traditional plant-based medicine with our curated range of Ayurvedic oils and supplements.
            </p>
          </div>
        </div>
        <div className="hero-split-right">
          <div className="hero-carousel-container">
            {carouselImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Slide ${idx + 1}`}
                className={`hero-carousel-img ${idx === currentSlide ? 'active' : ''}`}
              />
            ))}
            <div className="hero-carousel-overlay">
              {/* Removed redundant logo and text as requested */}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHATS ON YOUR MIND ── */}
      <section className="container section-padding">
        <h2 className="section-title-center">Whats On Your Mind ?</h2>
        {!catLoading && categories.length > 0 && (
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link to={`/category/${cat.id}`} key={cat.id} className="category-circle-item">
                <div className="category-circle-img-wrap">
                  {cat.image_url ? (
                    <img src={getImageUrl(cat.image_url)} alt={cat.name} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--text-light)' }}>
                      <Leaf size={32} />
                    </div>
                  )}
                </div>
                <span className="category-circle-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="container section-padding">
        <div className="section-header-flat">
          <h2 className="section-title-flat">New Arrivals</h2>
          <Link to="/explore" className="section-link-flat">SHOP ALL</Link>
        </div>

        {loading ? (
          <div className="products-grid-skeleton">
            {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 400, borderRadius: 0 }} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="new-arrivals-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-center" style={{ color: 'var(--text-light)', padding: '40px 0' }}>
            No products available yet.
          </p>
        )}
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
