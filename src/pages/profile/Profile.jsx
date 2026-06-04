import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useScrollToFooter } from '../../hooks/useScrollToFooter';
import api, { ENDPOINTS } from '../../api/api';
import { Package, Heart, ShoppingCart, MapPin, HelpCircle, LogOut, ShieldCheck, Camera, Edit2, ChevronRight, Settings } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, updateUser, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();
  const scrollToFooter = useScrollToFooter();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    // Fetch total orders for stats
    api.get(ENDPOINTS.ORDERS)
      .then(res => {
        const orders = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
        setOrderCount(orders.length);
      })
      .catch(() => setOrderCount(0));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(ENDPOINTS.USER_PROFILE, { name: form.name, phone: form.phone });
      updateUser(res.data);
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch { toast.error('Failed to update profile'); }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isEditing) {
    return (
      <div className="profile-page-wrap page-fade-in profile-bg" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="container-sm">
          <div className="profile-header-edit">
            <h1 className="profile-title">Edit Profile</h1>
            <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
          <div className="card card-body">
            <form onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={form.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone (Optional)</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91..." />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-wrap page-fade-in profile-bg" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div className="container-sm profile-container">
        
        {/* Profile Header */}
        <div className="profile-card profile-header-card">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
              <span>Edit Profile</span>
              <Edit2 size={14} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="profile-card profile-stats-card">
          <div className="profile-stat">
            <div className="profile-stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
              <Package size={20} />
            </div>
            <div className="profile-stat-value">{orderCount}</div>
            <div className="profile-stat-label">Orders</div>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <div className="profile-stat-icon" style={{ backgroundColor: '#fce4ec', color: '#c2185b' }}>
              <Heart size={20} />
            </div>
            <div className="profile-stat-value">{wishlistItems.length}</div>
            <div className="profile-stat-label">Wishlist</div>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <div className="profile-stat-icon" style={{ backgroundColor: '#e8f5e8', color: '#388e3c' }}>
              <ShoppingCart size={20} />
            </div>
            <div className="profile-stat-value">{cartCount}</div>
            <div className="profile-stat-label">Cart</div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="profile-menu">
          <Link to="/profile/orders" className="profile-menu-item">
            <div className="profile-menu-icon" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
              <Package size={20} />
            </div>
            <div className="profile-menu-title">My Orders</div>
            <ChevronRight size={20} color="var(--text-light)" />
          </Link>
          
          <Link to="/profile/addresses" className="profile-menu-item">
            <div className="profile-menu-icon" style={{ backgroundColor: '#e8f5e8', color: '#388e3c' }}>
              <MapPin size={20} />
            </div>
            <div className="profile-menu-title">My Addresses</div>
            <ChevronRight size={20} color="var(--text-light)" />
          </Link>

          <Link to="/profile/settings" className="profile-menu-item">
            <div className="profile-menu-icon" style={{ backgroundColor: '#e8eaf6', color: '#3f51b5' }}>
              <Settings size={20} />
            </div>
            <div className="profile-menu-title">Settings</div>
            <ChevronRight size={20} color="var(--text-light)" />
          </Link>
          
          <div onClick={scrollToFooter} className="profile-menu-item" style={{ cursor: 'pointer' }}>
            <div className="profile-menu-icon" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
              <HelpCircle size={20} />
            </div>
            <div className="profile-menu-title">Support</div>
            <ChevronRight size={20} color="var(--text-light)" />
          </div>

          {isAdmin() && (
            <Link to="/admin" className="profile-menu-item">
              <div className="profile-menu-icon" style={{ backgroundColor: '#f3e5f5', color: '#8e24aa' }}>
                <ShieldCheck size={20} />
              </div>
              <div className="profile-menu-title">Admin Panel</div>
              <ChevronRight size={20} color="var(--text-light)" />
            </Link>
          )}
        </div>

        {/* Logout Button */}
        <div className="profile-logout-container">
          <button className="profile-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
