import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCategories } from '../context/CategoryContext';
import { useScrollToFooter } from '../hooks/useScrollToFooter';
import {
  ShoppingCart, Heart, User, Search, Menu, X,
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
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const searchRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const scrollToFooter = (e) => {
    scrollFooter(e);
    setMenuOpen(false); // Close mobile menu if open
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);

      if (window.innerWidth <= 992 && !menuOpen && !searchOpen) {
        if (window.scrollY > 50) {
          setVisible(false);
        }

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          setVisible(true);
        }, 250);
      } else {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [menuOpen, searchOpen]);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setSearchOpen(false);
    setVisible(true);
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
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${!visible ? 'navbar-hidden' : ''}`}>

      <div className="navbar-inner container">
        {/* Left: Hamburger menu for mobile */}
        <div className="navbar-left">
          <button
            className="navbar-icon-btn navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
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
          
          <Link
            to="/about"
            className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            Our Story
          </Link>
          <Link
            to="/foundation"
            className={`navbar-link ${location.pathname === '/foundation' ? 'active' : ''}`}
          >
            Foundation
          </Link>
          <Link
            to="/careers"
            className={`navbar-link ${location.pathname === '/careers' ? 'active' : ''}`}
          >
            Careers
          </Link>

          <Link
            to="/contact-us"
            className={`navbar-link ${location.pathname === '/contact-us' ? 'active' : ''}`}
          >
            Contact Us
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="navbar-right">
          <button
            className="navbar-icon-btn hide-on-mobile"
            onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 100); }}
            aria-label="Search"
          >
            <Search size={22} strokeWidth={1.5} />
          </button>

          <Link to="/wishlist" className="navbar-icon-btn navbar-badge-wrap hide-on-mobile" aria-label="Wishlist">
            <Heart size={22} strokeWidth={1.5} />
            {wishlistItems.length > 0 && <span className="navbar-badge">{wishlistItems.length}</span>}
          </Link>

          <Link
            to="/explore"
            className="navbar-icon-btn mobile-search-btn"
            aria-label="Saranga Space Search"
          >
            <Search size={22} strokeWidth={1.5} />
          </Link>

          <Link to="/cart" className="navbar-icon-btn navbar-badge-wrap" aria-label="Cart">
            <ShoppingCart size={22} strokeWidth={1.5} />
            <span className="navbar-badge">{cartCount}</span>
          </Link>

          {isAuthenticated && isAdmin() && (
            <Link to="/admin" className="navbar-icon-btn navbar-admin-btn hide-on-mobile" title="Admin Panel" aria-label="Admin Panel">
              <ShieldCheck size={22} strokeWidth={1.5} />
            </Link>
          )}

          {isAuthenticated ? (
            <Link to="/profile" className="navbar-icon-btn navbar-user-btn hide-on-mobile" aria-label="Profile">
              <User size={22} strokeWidth={1.5} />
            </Link>
          ) : (
            <Link to="/auth/login" className="navbar-icon-btn hide-on-mobile" aria-label="Sign In">
              <User size={22} strokeWidth={1.5} />
            </Link>
          )}

          {/* Hamburger has been moved to the left */}
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
            <Link to="/about" className="mobile-nav-link">Our Story</Link>
            <Link to="/foundation" className="mobile-nav-link">Foundation</Link>
            <Link to="/careers" className="mobile-nav-link">Careers</Link>
            
            {/* Added Cart & Wishlist inside mobile menu */}
            <Link to="/cart" className="mobile-nav-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>My Cart</span>
              <span className="navbar-badge" style={{ position: 'static', display: 'inline-flex', background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>{cartCount}</span>
            </Link>
            <Link to="/wishlist" className="mobile-nav-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>My Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="navbar-badge" style={{ position: 'static', display: 'inline-flex', background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>{wishlistItems.length}</span>
              )}
            </Link>

            <Link to="/contact-us" className="mobile-nav-link">Contact Us</Link>
            <div className="navbar-dropdown-divider" style={{ margin: '16px 0' }}></div>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="mobile-nav-link">My Profile</Link>
                <Link to="/profile/orders" className="mobile-nav-link">My Orders</Link>
                {isAdmin() && <Link to="/admin" className="mobile-nav-link">Admin Panel</Link>}
                <button className="mobile-nav-link mobile-logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/auth/login" className="btn btn-primary btn-block mt-16" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '30px', textDecoration: 'none' }}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
