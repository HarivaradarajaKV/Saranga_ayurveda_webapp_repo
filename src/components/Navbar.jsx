import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCategories } from '../context/CategoryContext';
import { useScrollToFooter } from '../hooks/useScrollToFooter';
import {
  ShoppingCart, Heart, User, Search, Menu, X, ChevronDown,
  LogOut, Package, MapPin, Bell, ShieldCheck, Camera, MessageCircle
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollFooter = useScrollToFooter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  const scrollToFooter = (e) => {
    scrollFooter(e);
    setMenuOpen(false); // Close mobile menu if open
    setAboutOpen(false); // Close dropdown if open
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setAboutOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-track">
          <span>Together, we can build a better world. Every purchase you make helps a child, supports health, and creates real change.</span>
        </div>
      </div>

      <div className="navbar-inner container">
        {/* Left: Logo Image */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src="/images/logo.jpg" alt="Saranga Ayurveda Logo" className="navbar-logo-img" />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="navbar-center">
          <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <div
            className="navbar-link navbar-dropdown-trigger"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <span>Saranga Space</span>
            <ChevronDown size={14} className={`dropdown-chevron ${categoriesOpen ? 'rotated' : ''}`} />
            {categoriesOpen && (
              <div className="navbar-dropdown">
                <Link to="/explore" className="navbar-dropdown-item navbar-dropdown-all">
                  All Products
                </Link>
                <div className="navbar-dropdown-divider" />
                {categories.slice(0, 10).map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className="navbar-dropdown-item"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div
            className="navbar-link navbar-dropdown-trigger"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <span>About Us</span>
            <ChevronDown size={14} className={`dropdown-chevron ${aboutOpen ? 'rotated' : ''}`} />
            {aboutOpen && (
              <div className="navbar-dropdown">
                <Link to="/about" className="navbar-dropdown-item">Saranga Sampradaya</Link>
                <div className="navbar-dropdown-divider" />
                <Link to="/legal/privacy-policy" className="navbar-dropdown-item">Privacy Policy</Link>
                <Link to="/legal/terms" className="navbar-dropdown-item">Terms and Conditions</Link>
                <Link to="/legal/shipping" className="navbar-dropdown-item">Shipping Policy</Link>
                <div className="navbar-dropdown-divider" />
                <a href="#footer" className="navbar-dropdown-item" onClick={scrollToFooter}>Contact Us</a>
              </div>
            )}
          </div>

          <a 
            href="#footer" 
            onClick={scrollToFooter} 
            className={`navbar-link ${location.pathname === '#footer' ? 'active' : ''}`}
          >
            Contact Us
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="navbar-right">
          <div className="navbar-actions">
            <button
              className="navbar-icon-btn"
              onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 100); }}
              aria-label="Search"
            >
              <Search size={24} strokeWidth={1.5} />
            </button>

            <Link to="/wishlist" className="navbar-icon-btn navbar-badge-wrap" aria-label="Wishlist">
              <Heart size={24} strokeWidth={1.5} />
              {wishlistItems.length > 0 && <span className="navbar-badge">{wishlistItems.length}</span>}
            </Link>

            <Link to="/cart" className="navbar-icon-btn navbar-badge-wrap" aria-label="Cart">
              <ShoppingCart size={24} strokeWidth={1.5} />
              <span className="navbar-badge">{cartCount}</span>
            </Link>

            {isAuthenticated ? (
              <Link to="/profile" className="navbar-icon-btn navbar-user-btn" aria-label="Profile">
                <User size={24} strokeWidth={1.5} />
              </Link>
            ) : (
              <Link to="/auth/login" className="navbar-icon-btn" aria-label="Sign In">
                <User size={24} strokeWidth={1.5} />
              </Link>
            )}

            <button
              className="navbar-icon-btn navbar-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="navbar-social-mini">
            <a href="https://www.instagram.com/saranga_ayurveda" target="_blank" rel="noreferrer" className="mini-social-link instagram" title="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://www.whatsapp.com/channel/0029Vb76UKxL2ATwk9Z5Sd1z" target="_blank" rel="noreferrer" className="mini-social-link whatsapp" title="WhatsApp Channel">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.1-3.2-5.4-.3-8.3 2.4-11.1 2.4-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.3 5.7 23.7 9.1 31.7 11.7 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {searchOpen && (
        <div className="navbar-search-bar">
          <form className="navbar-search-form container" onSubmit={handleSearch}>
            <Search size={28} className="navbar-search-icon" />
            <input
              ref={searchRef}
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search products, categories..."
              className="navbar-search-input"
            />
            <button type="submit" className="btn btn-primary btn-lg">Search</button>
            <button type="button" className="navbar-icon-btn search-close-btn" onClick={() => setSearchOpen(false)}>
              <X size={28} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          <div className="container">
            <Link to="/" className="mobile-nav-link">Home</Link>
            <Link to="/explore" className="mobile-nav-link">Saranga Space (All Products)</Link>
            <Link to="/about" className="mobile-nav-link">Saranga Sampradaya</Link>
            <a href="#footer" className="mobile-nav-link" onClick={scrollToFooter}>Contact Us</a>
            <div className="navbar-dropdown-divider" style={{ margin: '16px 0' }}></div>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="mobile-nav-link">My Profile</Link>
                <Link to="/profile/orders" className="mobile-nav-link">My Orders</Link>
                {isAdmin() && <Link to="/admin" className="mobile-nav-link">Admin Panel</Link>}
                <button className="mobile-nav-link mobile-logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/auth/login" className="btn btn-primary btn-block mt-16">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
