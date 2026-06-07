import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../../api/api';
import { ArrowLeft, Package, Clock, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import './Profile.css';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(ENDPOINTS.ORDER(id))
      .then(res => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-content loading-center"><div className="spinner" /></div>;
  if (!order) return (
    <div className="page-content container empty-state" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <h3>Order not found</h3>
      <Link to="/profile/orders" className="btn-solid-green" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 16 }}>My Orders</Link>
    </div>
  );

  const isCancelled = order.status === 'cancelled';
  const statusIdx = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status);

  return (
    <div className="page-content page-fade-in account-page">
      <div className="container relative-container" style={{ maxWidth: '800px' }}>
        
        {/* Back Link */}
        <Link to="/profile/orders" className="profile-mobile-back-header" style={{ display: 'flex', marginBottom: 20 }}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          <span>Back to Orders</span>
        </Link>

        {/* Title */}
        <div className="account-header-section" style={{ marginBottom: 28 }}>
          <h1 className="account-title font-serif-main">Order #{order.id}</h1>
          <p className="account-subtitle">
            Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </p>
        </div>

        {/* Status Tracker */}
        <div className="dashboard-content-panel" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #FAF7F2', paddingBottom: 16 }}>
            <h3 className="panel-title font-serif-main" style={{ margin: 0, border: 'none', padding: 0 }}>Order Status</h3>
            <span 
              className="order-status-badge" 
              style={{ 
                backgroundColor: isCancelled ? '#FEF2F2' : '#EAF5EC', 
                color: isCancelled ? '#EF4444' : '#2E5D34',
                fontSize: '0.85rem',
                padding: '6px 16px'
              }}
            >
              {order.status}
            </span>
          </div>
          
          {isCancelled ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#ef4444', background: '#FEF2F2', borderRadius: 12, fontWeight: 500 }}>
              This order has been cancelled.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '12px 0' }}>
              {STATUS_STEPS.map((s, i) => (
                <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 8, zIndex: 2 }}>
                  <div 
                    style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      background: i <= statusIdx ? '#2E5D34' : '#EAE5D9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justify: 'center',
                      justifyContent: 'center',
                      color: '#ffffff', 
                      fontSize: '0.9rem', 
                      fontWeight: 700,
                      border: '4px solid #ffffff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                    }}
                  >
                    {i <= statusIdx ? '✓' : i + 1}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '0.78rem', 
                      textTransform: 'capitalize', 
                      fontWeight: i === statusIdx ? 700 : 500, 
                      color: i <= statusIdx ? '#2E5D34' : '#7a8273' 
                    }}
                  >
                    {s}
                  </div>
                </div>
              ))}
              {/* Connector line behind dots */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '30px', 
                  left: '12%', 
                  right: '12%', 
                  height: 2, 
                  background: '#EAE5D9', 
                  zIndex: 1 
                }} 
              />
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '30px', 
                  left: '12%', 
                  width: `${(statusIdx / (STATUS_STEPS.length - 1)) * 76}%`, 
                  height: 2, 
                  background: '#2E5D34', 
                  zIndex: 1,
                  transition: 'width 0.3s ease'
                }} 
              />
            </div>
          )}
        </div>

        {/* Ordered Items */}
        <div className="dashboard-content-panel" style={{ marginBottom: 24 }}>
          <h3 className="panel-title font-serif-main" style={{ marginBottom: 16 }}>Items Ordered</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(order.items || []).map((item, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 16, 
                  paddingBottom: 16, 
                  borderBottom: i < (order.items.length - 1) ? '1px solid #FAF7F2' : 'none' 
                }}
              >
                <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: '1px solid #EAE5D9', flexShrink: 0, background: '#ffffff' }}>
                  <img 
                    src={getImageUrl(item.image_url)} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={e => e.target.src = 'https://via.placeholder.com/72'} 
                  />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 600, color: '#2c3327' }}>
                    {item.name || item.product_name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#7a8273' }}>Qty: {item.quantity}</p>
                </div>
                <div style={{ fontWeight: 700, color: '#2E5D34', fontSize: '1.05rem' }}>
                  ₹{parseFloat(item.price || 0).toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery & Summary Column-Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: order.address ? '1.2fr 1fr' : '1fr', gap: 24 }}>
          
          {/* Left: Delivery Details */}
          {order.address && (
            <div className="dashboard-content-panel">
              <h3 className="panel-title font-serif-main" style={{ marginBottom: 16 }}>Delivery Address</h3>
              <div style={{ fontSize: '0.9rem', color: '#555555', lineHeight: 1.6, textAlign: 'left' }}>
                <strong style={{ color: '#2c3327', fontSize: '1rem' }}>{order.address.full_name}</strong>
                <p style={{ margin: '6px 0' }}>
                  {order.address.address_line1}
                  {order.address.address_line2 ? `, ${order.address.address_line2}` : ''}<br />
                  {order.address.city}, {order.address.state} - {order.address.postal_code}
                </p>
                <span style={{ fontSize: '0.82rem', color: '#7a8273' }}>Phone: {order.address.phone_number}</span>
              </div>
            </div>
          )}

          {/* Right: Price Details */}
          <div className="dashboard-content-panel">
            <h3 className="panel-title font-serif-main" style={{ marginBottom: 16 }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#555555' }}>
                <span>Subtotal</span>
                <span>₹{parseFloat(order.total_amount || 0).toFixed(0)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#2E5D34', fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-₹{parseFloat(order.discount_amount).toFixed(0)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#555555' }}>
                <span>Delivery</span>
                <span>{parseFloat(order.delivery_charge || 0) === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span>
              </div>
              <div style={{ height: 1, background: '#EAE5D9', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: '#2E5D34' }}>
                <span>Total Paid</span>
                <span>₹{parseFloat(order.total_amount || 0).toFixed(0)}</span>
              </div>
              {order.payment_id && (
                <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#7a8273', textAlign: 'left' }}>
                  Payment ID: {order.payment_id}
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
