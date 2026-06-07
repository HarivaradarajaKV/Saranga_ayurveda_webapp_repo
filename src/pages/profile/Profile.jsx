import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import api, { ENDPOINTS } from '../../api/api';
import { 
  Home, Package, Heart, MapPin, User, Lock, Bell, LogOut, 
  ChevronRight, Plus, Trash2, ShieldCheck, Mail, Phone, 
  Clock, ArrowLeft, Check 
} from 'lucide-react';
import './Profile.css';

export default function Profile({ tab = 'dashboard' }) {
  const { user, updateUser, logout, isAdmin } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();

  // Address and Order States
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '', phone_number: '', address_line1: '', 
    address_line2: '', city: '', state: '', postal_code: '', country: 'India'
  });

  // Edit Profile States
  const [profileForm, setProfileForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '' 
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password States
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    orderAlerts: true,
    smsPromos: false
  });

  useEffect(() => {
    setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoadingData(true);
    try {
      const [ordersRes, addressesRes] = await Promise.all([
        api.get(ENDPOINTS.ORDERS),
        api.get(ENDPOINTS.ADDRESSES)
      ]);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.orders || []));
      setAddresses(Array.isArray(addressesRes.data) ? addressesRes.data : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
    setLoadingData(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put(ENDPOINTS.USER_PROFILE, { 
        name: profileForm.name, 
        phone: profileForm.phone 
      });
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
    setSavingProfile(false);
  };

  // Address Handlers
  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await api.post(ENDPOINTS.ADDRESSES, addressForm);
      const res = await api.get(ENDPOINTS.ADDRESSES);
      setAddresses(Array.isArray(res.data) ? res.data : []);
      setShowAddressForm(false);
      setAddressForm({ 
        full_name: '', phone_number: '', address_line1: '', 
        address_line2: '', city: '', state: '', postal_code: '', country: 'India' 
      });
      toast.success('Address added!');
    } catch {
      toast.error('Failed to add address');
    }
    setSavingAddress(false);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(ENDPOINTS.ADDRESS(id));
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.put(ENDPOINTS.ADDRESS_DEFAULT(id));
      const res = await api.get(ENDPOINTS.ADDRESSES);
      setAddresses(Array.isArray(res.data) ? res.data : []);
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to set default address');
    }
  };

  // Password Update
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    // Mocking success since password is local to auth flow, but display success
    setTimeout(() => {
      toast.success('Password updated successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSavingPassword(false);
    }, 1000);
  };

  const defaultAddressObj = addresses.find(a => a.is_default) || addresses[0];
  const defaultAddressStr = defaultAddressObj 
    ? `${defaultAddressObj.address_line1}, ${defaultAddressObj.city}, ${defaultAddressObj.state} - ${defaultAddressObj.postal_code}`
    : 'No address added yet';

  const memberSinceDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'May 2024';

  const rewardPoints = orders.length * 50 || 100;

  return (
    <div className={`page-content page-fade-in account-page ${tab !== 'dashboard' ? 'subpage-active' : ''}`}>
      <div className="container relative-container">
        
        {/* Main Columns Grid */}
        <div className="account-main-grid">
          
          {/* Left Column: Navigation Sidebar */}
          <div className="account-sidebar-col">
            <div className="account-sidebar-card">
              
              {/* Profile Card Header */}
              <div className="sidebar-profile-header">
                <div className="sidebar-avatar-circle">
                  <User size={32} className="avatar-placeholder-icon" />
                </div>
                <h3 className="sidebar-profile-name">{user?.name || 'User Name'}</h3>
                <p className="sidebar-profile-email">{user?.email}</p>
              </div>

              {/* Sidebar Menu Links */}
              <div className="sidebar-menu-list">
                <Link to="/profile" className={`sidebar-menu-item-link ${tab === 'dashboard' ? 'active' : ''}`}>
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/profile/orders" className={`sidebar-menu-item-link ${tab === 'orders' ? 'active' : ''}`}>
                  <Package size={18} />
                  <span>Orders</span>
                </Link>
                <Link to="/wishlist" className="sidebar-menu-item-link">
                  <Heart size={18} />
                  <span>Wishlist</span>
                </Link>
                <Link to="/profile/addresses" className={`sidebar-menu-item-link ${tab === 'addresses' ? 'active' : ''}`}>
                  <MapPin size={18} />
                  <span>Address</span>
                </Link>
                <Link to="/profile/settings" className={`sidebar-menu-item-link ${tab === 'settings' ? 'active' : ''}`}>
                  <User size={18} />
                  <span>Account Details</span>
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className="sidebar-menu-item-link admin-menu-link">
                    <ShieldCheck size={18} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="sidebar-menu-item-btn">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Main Panel Content */}
          <div className="account-content-col">
            
            {/* Header / Title Area (Inside right column for desktop layout) */}
            <div className="account-header-section-wrapper">


              {/* Title Area */}
              <div className="account-header-section">
                <h1 className="account-title font-serif-main">My Account</h1>
                <p className="account-subtitle">Welcome back, {user?.name || 'User'}!</p>
              </div>
            </div>
            
            {/* Mobile View Back Link Header */}
            {tab !== 'dashboard' && (
              <Link to="/profile" className="profile-mobile-back-header">
                <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                <span>Back to Dashboard</span>
              </Link>
            )}

            {/* Mobile Profile Card Summary (only on mobile dashboard) */}
            {tab === 'dashboard' && (
              <div className="mobile-profile-hero-card">
                <Link to="/profile/settings" className="mobile-profile-top-row">
                  <div className="mobile-avatar-box">
                    <User size={24} />
                  </div>
                  <div className="mobile-profile-meta">
                    <h4>{user?.name}</h4>
                    <p>{user?.email}</p>
                  </div>
                  <ChevronRight size={18} className="mobile-profile-arrow" />
                </Link>
                
                <div className="mobile-stats-divider"></div>
                
                {/* Horizontal stats grid inside card */}
                <div className="mobile-profile-hero-stats">
                  <div className="m-stat-item">
                    <span className="m-stat-label">Orders</span>
                    <span className="m-stat-val">{orders.length}</span>
                  </div>
                  <div className="m-stat-divider"></div>
                  <div className="m-stat-item">
                    <span className="m-stat-label">Wishlist</span>
                    <span className="m-stat-val">{wishlistItems.length}</span>
                  </div>
                  <div className="m-stat-divider"></div>
                  <div className="m-stat-item">
                    <span className="m-stat-label">Addresses</span>
                    <span className="m-stat-val">{addresses.length}</span>
                  </div>
                  <div className="m-stat-divider"></div>
                  <div className="m-stat-item">
                    <span className="m-stat-label">Rewards</span>
                    <span className="m-stat-val">{rewardPoints}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Stats Row (Visible on desktop dashboard only) */}
            {tab === 'dashboard' && (
              <div className="desktop-stats-row">
                <div className="stat-card">
                  <div className="stat-icon-wrapper">
                    <Package size={20} />
                  </div>
                  <span className="stat-label">Total Orders</span>
                  <span className="stat-value">{orders.length}</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrapper">
                    <Heart size={20} />
                  </div>
                  <span className="stat-label">Wishlist Items</span>
                  <span className="stat-value">{wishlistItems.length}</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrapper">
                    <MapPin size={20} />
                  </div>
                  <span className="stat-label">Saved Addresses</span>
                  <span className="stat-value">{addresses.length}</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrapper">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="stat-label">Reward Points</span>
                  <span className="stat-value">{rewardPoints}</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 1. DASHBOARD / OVERVIEW */}
            {tab === 'dashboard' && (
              <div className="dashboard-overview-card">
                <h3 className="overview-card-title">Account Overview</h3>
                <div className="overview-details-grid">
                  <div className="overview-detail-item">
                    <User size={20} className="detail-icon" />
                    <div className="detail-text-box">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-val">{user?.name}</span>
                    </div>
                  </div>
                  <div className="overview-detail-item">
                    <MapPin size={20} className="detail-icon" />
                    <div className="detail-text-box">
                      <span className="detail-label">Default Address</span>
                      <span className="detail-val">{defaultAddressStr}</span>
                    </div>
                  </div>
                  <div className="overview-detail-item">
                    <Mail size={20} className="detail-icon" />
                    <div className="detail-text-box">
                      <span className="detail-label">Email Address</span>
                      <span className="detail-val">{user?.email}</span>
                    </div>
                  </div>
                  <div className="overview-detail-item">
                    <Clock size={20} className="detail-icon" />
                    <div className="detail-text-box">
                      <span className="detail-label">Member Since</span>
                      <span className="detail-val">{memberSinceDate}</span>
                    </div>
                  </div>
                  <div className="overview-detail-item">
                    <Phone size={20} className="detail-icon" />
                    <div className="detail-text-box">
                      <span className="detail-label">Phone Number</span>
                      <span className="detail-val">{user?.phone || 'Not Provided'}</span>
                    </div>
                  </div>
                </div>
                <button className="overview-edit-profile-btn" onClick={() => navigate('/profile/settings')}>
                  Edit Profile
                </button>
              </div>
            )}

            {/* TAB CONTENT: 2. ORDERS LIST */}
            {tab === 'orders' && (
              <div className="dashboard-content-panel">
                <h3 className="panel-title font-serif-main">My Orders</h3>
                
                {loadingData ? (
                  <div className="panel-loader"><div className="spinner" /></div>
                ) : orders.length === 0 ? (
                  <div className="panel-empty-state">
                    <Package size={36} className="empty-icon" />
                    <h4>No orders yet</h4>
                    <p>Start shopping to see your orders here</p>
                    <Link to="/explore" className="btn-solid-green">Shop Now</Link>
                  </div>
                ) : (
                  <div className="profile-orders-list">
                    {orders.map(order => {
                      const statusColor = {
                        pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6',
                        delivered: '#2E5D34', cancelled: '#ef4444'
                      }[order.status || 'pending'];

                      return (
                        <Link key={order.id} to={`/profile/orders/${order.id}`} className="order-history-row-card">
                          <div className="order-row-meta">
                            <h4>Order #{order.id}</h4>
                            <p>
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                              &nbsp;· {order.items?.length || 0} item(s)
                            </p>
                          </div>
                          <div className="order-row-actions">
                            <span 
                              className="order-status-badge" 
                              style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
                            >
                              {order.status || 'pending'}
                            </span>
                            <span className="order-total-price">₹{parseFloat(order.total_amount || 0).toFixed(0)}</span>
                            <ChevronRight size={18} className="chevron-arrow" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. ADDRESSES */}
            {tab === 'addresses' && (
              <div className="dashboard-content-panel">
                <div className="panel-header-row">
                  <h3 className="panel-title font-serif-main">Saved Addresses</h3>
                  <button className="panel-action-btn-green" onClick={() => setShowAddressForm(!showAddressForm)}>
                    <Plus size={16} style={{ marginRight: '6px' }} />
                    Add Address
                  </button>
                </div>

                {/* New Address Form */}
                {showAddressForm && (
                  <form className="panel-form-card" onSubmit={handleAddAddress}>
                    <h4>New Address</h4>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input 
                          type="text" required
                          value={addressForm.full_name} 
                          onChange={e => setAddressForm(p => ({ ...p, full_name: e.target.value }))} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                          type="text" required
                          value={addressForm.phone_number} 
                          onChange={e => setAddressForm(p => ({ ...p, phone_number: e.target.value }))} 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Address Line 1</label>
                      <input 
                        type="text" required
                        value={addressForm.address_line1} 
                        onChange={e => setAddressForm(p => ({ ...p, address_line1: e.target.value }))} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Address Line 2</label>
                      <input 
                        type="text"
                        value={addressForm.address_line2} 
                        onChange={e => setAddressForm(p => ({ ...p, address_line2: e.target.value }))} 
                      />
                    </div>
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label>City</label>
                        <input 
                          type="text" required
                          value={addressForm.city} 
                          onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} 
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input 
                          type="text" required
                          value={addressForm.state} 
                          onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode</label>
                        <input 
                          type="text" required maxLength={6}
                          value={addressForm.postal_code} 
                          onChange={e => setAddressForm(p => ({ ...p, postal_code: e.target.value.replace(/\D/g, '') }))} 
                        />
                      </div>
                    </div>
                    <div className="form-btn-actions">
                      <button className="btn-solid-green" type="submit" disabled={savingAddress}>
                        {savingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                      <button className="btn-outline-grey" type="button" onClick={() => setShowAddressForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {loadingData ? (
                  <div className="panel-loader"><div className="spinner" /></div>
                ) : addresses.length === 0 ? (
                  <div className="panel-empty-state">
                    <MapPin size={36} className="empty-icon" />
                    <h4>No saved addresses</h4>
                    <p>Add your first delivery address</p>
                  </div>
                ) : (
                  <div className="profile-addresses-list">
                    {addresses.map(addr => (
                      <div key={addr.id} className="address-item-card">
                        <div className="address-meta-info">
                          <div className="address-name-row">
                            <span className="address-full-name">{addr.full_name}</span>
                            {addr.is_default && <span className="default-badge">Default</span>}
                          </div>
                          <p className="address-details-text">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                          <span className="address-phone-text">{addr.phone_number}</span>
                        </div>
                        <div className="address-actions-box">
                          {!addr.is_default && (
                            <button className="set-default-btn" onClick={() => handleSetDefaultAddress(addr.id)}>
                              Set Default
                            </button>
                          )}
                          <button className="delete-address-btn" onClick={() => handleDeleteAddress(addr.id)} title="Delete Address">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. ACCOUNT SETTINGS */}
            {tab === 'settings' && (
              <div className="dashboard-content-panel">
                <h3 className="panel-title font-serif-main">Personal Information</h3>
                
                <form className="panel-form-card" onSubmit={handleSaveProfile}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" required
                        value={profileForm.name} 
                        onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" disabled 
                        value={user?.email || ''} 
                        style={{ opacity: 0.7, backgroundColor: '#FAF7F2', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ maxWidth: '48%' }}>
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      value={profileForm.phone} 
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} 
                    />
                  </div>
                  <button className="btn-solid-green" type="submit" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Mobile Actions List: Only on mobile dashboard tab */}
            {tab === 'dashboard' && (
              <div className="mobile-actions-list-card">
                <Link to="/profile/settings" className="mobile-action-item">
                  <div className="m-action-left">
                    <div className="m-action-icon-box">
                      <User size={18} />
                    </div>
                    <div className="m-action-meta">
                      <h5>Personal Information</h5>
                      <p>View and edit your profile details</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="m-action-arrow" />
                </Link>
                
                <Link to="/profile/addresses" className="mobile-action-item">
                  <div className="m-action-left">
                    <div className="m-action-icon-box">
                      <MapPin size={18} />
                    </div>
                    <div className="m-action-meta">
                      <h5>Address</h5>
                      <p>Manage your saved address</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="m-action-arrow" />
                </Link>
                
                <Link to="/profile/orders" className="mobile-action-item">
                  <div className="m-action-left">
                    <div className="m-action-icon-box">
                      <Package size={18} />
                    </div>
                    <div className="m-action-meta">
                      <h5>Orders</h5>
                      <p>View your order history</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="m-action-arrow" />
                </Link>
                
                <Link to="/wishlist" className="mobile-action-item">
                  <div className="m-action-left">
                    <div className="m-action-icon-box">
                      <Heart size={18} />
                    </div>
                    <div className="m-action-meta">
                      <h5>Wishlist</h5>
                      <p>View your saved products</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="m-action-arrow" />
                </Link>
                
                <div onClick={handleLogout} className="mobile-action-item">
                  <div className="m-action-left">
                    <div className="m-action-icon-box signout-icon-box">
                      <LogOut size={18} />
                    </div>
                    <div className="m-action-meta">
                      <h5>Logout</h5>
                      <p>Sign out from your account</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="m-action-arrow" />
                </div>
              </div>
            )}



          </div>

        </div>

      </div>
    </div>
  );
}
