import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingBag, Users, FolderOpen,
  Gift, Tag, Star, LogOut, Menu, X, Leaf, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import './Admin.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
  { to: '/admin/products', label: 'Products', icon: <Package size={18} /> },
  { to: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
  { to: '/admin/categories', label: 'Categories', icon: <FolderOpen size={18} /> },
  { to: '/admin/combos', label: 'Combo Deals', icon: <Gift size={18} /> },
  { to: '/admin/coupons', label: 'Coupons', icon: <Tag size={18} /> },
  { to: '/admin/reviews', label: 'Reviews', icon: <Star size={18} /> },
  { to: '/admin/new-arrivals', label: 'New Arrivals', icon: <Sparkles size={18} /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={16} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Saranga</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.6, letterSpacing: 2 }}>ADMIN</div>
          </div>
        </div>
        <nav className="admin-nav">
          {NAV.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-item ${isActive(item.to, item.exact) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.6 }}>Administrator</div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ flex: 1 }} />
          <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>← Back to Shop</Link>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
