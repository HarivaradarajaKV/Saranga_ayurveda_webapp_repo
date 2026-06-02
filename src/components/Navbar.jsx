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

      <div className="navbar-inner container">
        {/* Left: Empty spacer */}
        <div className="navbar-left">
        </div>

        {/* Center: Navigation Links */}
        <nav className="navbar-center">
          <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link
            to="/explore"
            className={`navbar-link ${location.pathname === '/explore' ? 'active' : ''}`}
          >
            Saranga Space
          </Link>
          
          <div
            className="navbar-link navbar-dropdown-trigger"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <span>Our Story</span>
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
          <button
            className="navbar-icon-btn"
            onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 100); }}
            aria-label="Search"
          >
            <Search size={22} strokeWidth={1.5} />
          </button>

          <Link to="/wishlist" className="navbar-icon-btn navbar-badge-wrap" aria-label="Wishlist">
            <Heart size={22} strokeWidth={1.5} />
            {wishlistItems.length > 0 && <span className="navbar-badge">{wishlistItems.length}</span>}
          </Link>

          <Link to="/cart" className="navbar-icon-btn navbar-badge-wrap" aria-label="Cart">
            <ShoppingCart size={22} strokeWidth={1.5} />
            <span className="navbar-badge">{cartCount}</span>
          </Link>

          {isAuthenticated && isAdmin() && (
            <Link to="/admin" className="navbar-icon-btn navbar-admin-btn" title="Admin Panel" aria-label="Admin Panel">
              <ShieldCheck size={22} strokeWidth={1.5} />
            </Link>
          )}

          {isAuthenticated ? (
            <Link to="/profile" className="navbar-icon-btn navbar-user-btn" aria-label="Profile">
              <User size={22} strokeWidth={1.5} />
            </Link>
          ) : (
            <Link to="/auth/login" className="navbar-icon-btn" aria-label="Sign In">
              <User size={22} strokeWidth={1.5} />
            </Link>
          )}

          <button
            className="navbar-icon-btn navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
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
            <Link to="/explore" className="mobile-nav-link">Saranga Space</Link>
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
