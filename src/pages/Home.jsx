import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { Leaf, Plus, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import './Home.css';

const getComboImageUrl = (combo) => {
  const name = (combo.name || combo.title || '').trim().toLowerCase();
  if (name.includes('dandruff')) {
    return '/images/combos/Anti Dandruff Kit.png';
  }
  if (name.includes('baby')) {
    return '/images/combos/Baby Combo.png';
  }
  if (name.includes('hair')) {
    return '/images/combos/Hair Growth Kit.png';
  }
  if (combo.image_url) {
    return getImageUrl(combo.image_url);
  }
  return '/images/logo.png';
};

export default function Home() {
  const { categories, loading: catLoading } = useCategories();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentWhatWeDoSlide, setCurrentWhatWeDoSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWhatWeDoSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.state?.scrollToFooter) {
      window.history.replaceState({}, document.title);
      setTimeout(() => {
        const footer = document.getElementById('footer');
        if (footer) {
          footer.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [location]);
  
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeBottomSlide, setActiveBottomSlide] = useState(0);

  const banners = [
    { src: '/images/banner/T_Banner 01.png', link: '/product/119' }, // Argan Shampoo
    { src: '/images/banner/T_Banner 02.png', link: '/product/136' }, // Charcoal and Vitamin C Foaming Facewash
    { src: '/images/banner/T_Banner 03.png', link: '/product/130' }, // Tea Tree and Neem Foaming Facewash
    { src: '/images/banner/T_Banner 04.png', link: '/product/196' }, // Intimate Wash
    { src: '/images/banner/T_Banner 05.png', link: '/product/117' }, // Hibiscus Chickpea Shampoo
    { src: '/images/banner/T_Banner 06.png', link: '/product/137' }, // Alovera Gel
    { src: '/images/banner/T_Banner 07.png', link: '/product/123' }  // Pomegranate Lip Balm
  ];

  const bottomBanners = [
    { src: '/images/banner/B_Banner 01.png', link: '/product/152' }, // Kumkumadi Taila
    { src: '/images/banner/B_Banner 02.png', link: '/product/188' }, // Eye Brow Oil
    { src: '/images/banner/B_Banner 03.png', link: '/product/189' }, // Vitamin C Serum
    { src: '/images/banner/B_Banner 04.png', link: '/product/164' }, // Hair Pack
    { src: '/images/banner/B_Banner 05.png', link: '/product/191' }, // Beard Growth Oil
    { src: '/images/banner/B_Banner 06.png', link: '/product/156' }  // Blueberry & Vitamin C Face Pack
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextBottomSlide = () => {
    setActiveBottomSlide((prev) => (prev + 1) % bottomBanners.length);
  };

  const prevBottomSlide = () => {
    setActiveBottomSlide((prev) => (prev - 1 + bottomBanners.length) % bottomBanners.length);
  };

  useEffect(() => {
    const topTimer = setInterval(() => {
      nextSlide();
    }, 4500);
    const bottomTimer = setInterval(() => {
      nextBottomSlide();
    }, 4500);
    return () => {
      clearInterval(topTimer);
      clearInterval(bottomTimer);
    };
  }, []);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    if (product.stock_quantity <= 0) { toast.warning('This product is out of stock'); return; }
    
    const result = await addToCart(product.id, 1);
    if (result.success !== false) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    await toggleWishlist(product.id);
    const inWishlist = isInWishlist(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleAddComboToCart = async (e, combo) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    const items = combo.items || combo.products || [];
    if (items.length === 0) {
      toast.warning('This combo has no items.');
      return;
    }
    
    try {
      let addedAny = false;
      for (const item of items) {
        const res = await addToCart(item.product_id || item.id, item.quantity || 1);
        if (res.success !== false) {
          addedAny = true;
        }
      }
      if (addedAny) {
        toast.success(`${combo.name || combo.title} added to cart!`);
      } else {
        toast.error('Failed to add combo to cart.');
      }
    } catch (err) {
      console.error('Error adding combo to cart:', err);
      toast.error('Failed to add combo to cart.');
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [prodRes, newRes, bestRes, comboRes] = await Promise.all([
        api.get(`${ENDPOINTS.PRODUCTS}?limit=8`),
        api.get(`${ENDPOINTS.PRODUCTS}?new_arrivals=true`),
        api.get('/products/best-sellers'),
        api.get(ENDPOINTS.COMBOS)
      ]);

      if (prodRes.data) {
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.products || []));
      }

      if (newRes.data) {
        setNewArrivals(Array.isArray(newRes.data) ? newRes.data : (newRes.data.products || []));
      }

      if (bestRes.data) {
        const bestData = bestRes.data.products || bestRes.data;
        setBestSellers(Array.isArray(bestData) ? bestData : []);
      }

      if (comboRes.data) {
        setCombos(Array.isArray(comboRes.data) ? comboRes.data : []);
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
    }
    setLoading(false);
  };

  return (
    <div className="home page-fade-in">
      {/* ── LUXURY AYURVEDA HERO BANNER ── */}
      <section className="hero-ayurveda">
        <div className="hero-ayurveda-content">
          <img src="/images/logo.png" alt="Saranga Logo" className="hero-ayurveda-logo" />

          <img src="/images/name.png" alt="Saranga Ayurveda" className="hero-ayurveda-name-img" />
          <h2 className="hero-specialist-title">Trusted Experts in</h2>
          
          <div className="categories-overlay-card" style={{ width: '100%', marginTop: '30px' }}>
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
          </div>
        </div>
      </section>

      {/* ── TOP HERO BANNER SLIDESHOW ── */}
      <section className="home-top-banner-slider-sec" style={{ width: '100%', overflow: 'hidden', position: 'relative', margin: 0, padding: 0 }}>
        <div className="home-top-banner-slider-container" style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
          {banners.map((banner, idx) => (
            <div 
              key={idx} 
              className={`home-slide ${idx === activeSlide ? 'active' : ''}`}
              style={{
                position: idx === 0 ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: idx === 0 ? 'auto' : '100%',
                opacity: idx === activeSlide ? 1 : 0,
                transition: 'opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                zIndex: idx === activeSlide ? 2 : 1,
                pointerEvents: idx === activeSlide ? 'auto' : 'none'
              }}
            >
              <Link to={banner.link} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img 
                  src={banner.src} 
                  alt={`Banner ${idx + 1}`} 
                  style={{ width: '100%', height: 'auto', display: 'block' }} 
                />
              </Link>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button 
            className="home-slideshow-arrow arrow-left" 
            onClick={prevSlide}
            aria-label="Previous Slide"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 10,
              opacity: 1
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            className="home-slideshow-arrow arrow-right" 
            onClick={nextSlide}
            aria-label="Next Slide"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 10,
              opacity: 1
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators / Dots */}
          <div className="home-slideshow-dots" style={{ zIndex: 10 }}>
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={`home-slideshow-dot ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="new-arrivals-section" style={{ paddingTop: 0 }}>
        <div className="container-large">
          <div className="section-header-centered">
            <h2 className="section-title-flat">New Arrivals</h2>
            <p className="section-desc-ayur">
              Explore our newest hand-crafted formulations designed to bring traditional Ayurvedic wisdom to your modern lifestyle.
            </p>
          </div>

          {loading ? (
            <div className="new-arrivals-grid-custom">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: 200, height: 300, borderRadius: 22, background: '#efe7da', opacity: 0.6 }} />
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="new-arrivals-grid-custom">
              {newArrivals.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="new-arrival-card">
                  <div className="new-arrival-img-wrap">
                    <div className="new-arrival-leaves-dec">
                      <Leaf size={18} className="dec-leaf-1" />
                      <Leaf size={12} className="dec-leaf-2" />
                    </div>
                    <button 
                      className={`new-arrival-wishlist-btn ${isInWishlist(p.id) ? 'active' : ''}`}
                      onClick={(e) => handleWishlist(e, p)}
                    >
                      <Heart size={15} fill={isInWishlist(p.id) ? 'currentColor' : 'none'} />
                    </button>
                    <img src={getImageUrl(p.image_url)} alt={p.name} className="new-arrival-img" />
                    <div className="new-arrival-capsules-dec">
                      <span className="dec-capsule capsule-1" />
                      <span className="dec-capsule capsule-2" />
                    </div>
                  </div>
                  <div className="new-arrival-info">
                    <span className="new-arrival-category">
                      {p.category_name ? p.category_name.toUpperCase() : p.category ? p.category.toUpperCase() : 'CAPSULES'}
                    </span>
                    <h3 className="new-arrival-name">{p.name}</h3>
                    <div className="new-arrival-footer">
                      <span className="new-arrival-price">
                        ₹{p.price ? parseFloat(p.price).toFixed(2) : '0.00'}
                      </span>
                      <button 
                        className="new-arrival-add-btn"
                        onClick={(e) => handleAddToCart(e, p)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center" style={{ color: 'var(--text-light)', padding: '40px 0' }}>
              No new arrivals available.
            </p>
          )}

        </div>
      </section>

      {/* ── OUR BEST SELLERS ── */}
      <section className="new-arrivals-section" style={{ backgroundColor: '#FAF8F5', borderTop: '1px solid #efe7da', padding: '80px 0' }}>
        <div className="container-large">
          <div className="section-header-centered">
            <span className="section-subtitle-ayur">Customer Favorites</span>
            <h2 className="section-title-flat">Our Best Sellers</h2>
            <p className="section-desc-ayur">
              Explore our most loved and highly-rated products, chosen by our community for their exceptional quality and results.
            </p>
          </div>

          {loading ? (
            <div className="new-arrivals-grid-custom">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: 260, height: 420, borderRadius: 24, background: '#efe7da', opacity: 0.6, margin: '0 auto' }} />
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="best-sellers-scroll-row">
              {bestSellers.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="new-arrival-card" style={{ backgroundColor: '#F3EEE6', flexShrink: 0 }}>
                  <div className="new-arrival-img-wrap">
                    <img src={getImageUrl(p.image_url)} alt={p.name} className="new-arrival-img" />
                  </div>
                  <div className="new-arrival-info" style={{ backgroundColor: '#F3EEE6' }}>
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
              No best sellers available yet.
            </p>
          )}
        </div>
      </section>

      {/* ── COMBO OFFERS ── */}
      <section className="new-arrivals-section" style={{ paddingTop: 0, paddingBottom: '60px' }}>
        <div className="container-large">
          <div className="section-header-centered">
            <h2 className="section-title-flat">Combo Offers</h2>
            <p className="section-desc-ayur">
              Complete wellness sets curated by expert practitioners. Get comprehensive care and save more.
            </p>
          </div>

          {loading ? (
            <div className="combo-grid-home">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 260, borderRadius: 22 }} />
              ))}
            </div>
          ) : combos.length > 0 ? (
            <div className="combo-grid-home">
              {combos.map(combo => {
                const originalPrice = combo.subtotal || combo.original_price;
                const comboPrice = combo.total || combo.combo_price || combo.price;
                const discountVal = (originalPrice && comboPrice) ? (parseFloat(originalPrice) - parseFloat(comboPrice)) : (combo.discount_amount || combo.discount || 0);

                return (
                  <Link to={`/deals/combo/${combo.id}`} key={combo.id} className="new-arrival-card">
                    {parseFloat(discountVal) > 0 && (
                      <div className="combo-card-home-badge">
                        SAVE ₹{parseFloat(discountVal).toFixed(0)}
                      </div>
                    )}

                    <div className="new-arrival-img-wrap">
                      <div className="new-arrival-leaves-dec">
                        <Leaf size={18} className="dec-leaf-1" />
                        <Leaf size={12} className="dec-leaf-2" />
                      </div>

                      <img
                        src={getComboImageUrl(combo)}
                        alt={combo.name || combo.title}
                        className="new-arrival-img"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
                        loading="lazy"
                      />

                      <div className="new-arrival-capsules-dec">
                        <span className="dec-capsule capsule-1" />
                        <span className="dec-capsule capsule-2" />
                      </div>
                    </div>

                    <div className="new-arrival-info">
                      <span className="new-arrival-category">
                        COMBO PACK
                      </span>
                      <h3 className="new-arrival-name" title={combo.name || combo.title}>
                        {combo.name || combo.title}
                      </h3>
                      <div className="new-arrival-footer">
                        <span className="new-arrival-price" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          ₹{parseFloat(comboPrice || 0).toFixed(0)}
                          {originalPrice && parseFloat(originalPrice) > parseFloat(comboPrice || 0) && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textDecoration: 'line-through', fontWeight: 'normal', marginLeft: '2px' }}>
                              ₹{parseFloat(originalPrice).toFixed(0)}
                            </span>
                          )}
                        </span>
                        <button 
                          className="new-arrival-add-btn"
                          onClick={(e) => handleAddComboToCart(e, combo)}
                          title="Add combo to cart"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center" style={{ color: 'var(--text-light)', padding: '40px 0' }}>
              No combo offers available.
            </p>
          )}

        </div>
      </section>

      {/* ── BOTTOM BANNER SLIDESHOW ── */}
      <section className="home-bottom-banner-slider-sec" style={{ width: '100%', overflow: 'hidden', position: 'relative', margin: 0, padding: 0 }}>
        <div className="home-top-banner-slider-container" style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
          {bottomBanners.map((banner, idx) => (
            <div 
              key={idx} 
              className={`home-slide ${idx === activeBottomSlide ? 'active' : ''}`}
              style={{
                position: idx === 0 ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: idx === 0 ? 'auto' : '100%',
                opacity: idx === activeBottomSlide ? 1 : 0,
                transition: 'opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                zIndex: idx === activeBottomSlide ? 2 : 1,
                pointerEvents: idx === activeBottomSlide ? 'auto' : 'none'
              }}
            >
              <Link to={banner.link} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img 
                  src={banner.src} 
                  alt={`Bottom Banner ${idx + 1}`} 
                  style={{ width: '100%', height: 'auto', display: 'block' }} 
                />
              </Link>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button 
            className="home-slideshow-arrow arrow-left" 
            onClick={prevBottomSlide}
            aria-label="Previous Slide"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 10,
              opacity: 1
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            className="home-slideshow-arrow arrow-right" 
            onClick={nextBottomSlide}
            aria-label="Next Slide"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 10,
              opacity: 1
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators / Dots */}
          <div className="home-slideshow-dots" style={{ zIndex: 10 }}>
            {bottomBanners.map((_, idx) => (
              <button
                key={idx}
                className={`home-slideshow-dot ${idx === activeBottomSlide ? 'active' : ''}`}
                onClick={() => setActiveBottomSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY SECTION ── */}
      <section className="home-story-section">
        <div className="container">
          <div className="home-story-grid">
            <div className="home-story-text-col">
              <div className="home-story-label">
                <span>OUR STORY</span>
                <span className="home-story-label-line"></span>
              </div>
              
              <h2 className="home-story-title">
                Rooted in Ayurveda.<br />
                Guided by Purpose.
              </h2>

              <p className="home-story-desc">
                At Saranga Ayurveda, our story is one of passion, purpose and the timeless wisdom of Ayurveda. 
                It is a journey that began with a vision to bring authentic Ayurvedic wellness to the world.
              </p>

              <div className="home-story-action">
                <Link to="/about" className="btn btn-secondary home-story-btn">Read Our Story</Link>
              </div>
            </div>

            <div className="home-story-img-col">
              <div className="home-story-img-wrapper">
                <img 
                  src="/images/about-heritage-ashram.png" 
                  alt="Saranga Ayurveda Heritage Ashram" 
                  className="home-story-main-img" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ASSOCIATION SECTION ── */}
      <section className="association-section">
        <div className="assoc-content">
          <div className="assoc-brand">
            <img src="/images/logo.png" alt="Saranga Emblem" className="assoc-logo-emblem" />
            <img src="/images/name.png" alt="Saranga Ayurveda" className="assoc-logo-name" />
          </div>

          <p className="assoc-association-text">In association with</p>
          <h3 className="assoc-foundation-title">Saranga Anugraha Foundation</h3>
          <h2 className="assoc-support-title">needs your support</h2>

          <div className="assoc-actions">
            <Link to="/donate" className="assoc-donate-btn">DONATE</Link>
            <a href="#need-help" className="assoc-help-link">
              <span>I NEED HELP</span>
              <span className="assoc-arrow-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO SECTION ── */}
      <section className="home-what-we-do-section">
        <div className="container">
          <h2 className="home-what-we-do-title">What We Do</h2>
          <div className="home-what-we-do-grid">
            <div className={`home-what-we-do-card ${currentWhatWeDoSlide === 0 ? 'active' : ''}`}>
              <div className="home-what-we-do-img-wrapper">
                <img 
                  src="/images/foundation/card_1.png" 
                  alt="Provide Medical Care" 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x360?text=Card+1+Image'; }} 
                />
              </div>
              <div className="home-what-we-do-content">
                <h3 className="home-what-we-do-card-title">Provide Medical Care</h3>
                <p className="home-what-we-do-card-desc">Bringing Quality healthcare to those who need it most.</p>
              </div>
            </div>
            <div className={`home-what-we-do-card ${currentWhatWeDoSlide === 1 ? 'active' : ''}`}>
              <div className="home-what-we-do-img-wrapper">
                <img 
                  src="/images/foundation/card_2.png" 
                  alt="Educate Students" 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x360?text=Card+2+Image'; }} 
                />
              </div>
              <div className="home-what-we-do-content">
                <h3 className="home-what-we-do-card-title">Educate Students</h3>
                <p className="home-what-we-do-card-desc">Empowering minds today for a brighter tomorrow.</p>
              </div>
            </div>
            <div className={`home-what-we-do-card ${currentWhatWeDoSlide === 2 ? 'active' : ''}`}>
              <div className="home-what-we-do-img-wrapper">
                <img 
                  src="/images/foundation/card_3.png" 
                  alt="Helping Feed the Hungry" 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x360?text=Card+3+Image'; }} 
                />
              </div>
              <div className="home-what-we-do-content">
                <h3 className="home-what-we-do-card-title">Helping Feed the Hungry</h3>
                <p className="home-what-we-do-card-desc">Nourishing life with love and compassion.</p>
              </div>
            </div>
          </div>
          {/* Carousel dots for mobile */}
          <div className="home-what-we-do-dots">
            <span className={`dot ${currentWhatWeDoSlide === 0 ? 'active' : ''}`} onClick={() => setCurrentWhatWeDoSlide(0)} />
            <span className={`dot ${currentWhatWeDoSlide === 1 ? 'active' : ''}`} onClick={() => setCurrentWhatWeDoSlide(1)} />
            <span className={`dot ${currentWhatWeDoSlide === 2 ? 'active' : ''}`} onClick={() => setCurrentWhatWeDoSlide(2)} />
          </div>
        </div>
      </section>
    </div>
  );
}
