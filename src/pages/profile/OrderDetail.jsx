import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../../api/api';
import { ArrowLeft, Package } from 'lucide-react';

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
  if (!order) return <div className="page-content container empty-state"><h3>Order not found</h3><Link to="/profile/orders" className="btn btn-primary">My Orders</Link></div>;

  const isCancelled = order.status === 'cancelled';
  const statusIdx = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status);

  return (
    <div className="page-content page-fade-in">
      <div className="container-sm">
        <Link to="/profile/orders" className="btn btn-ghost btn-sm mb-16"><ArrowLeft size={16} /> Back to Orders</Link>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 6 }}>Order #{order.id}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        </p>

        {/* Status tracker */}
        <div className="card card-body" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>Order Status</h3>
            <span className={`badge ${isCancelled ? 'badge-danger' : 'badge-primary'}`} style={{textTransform: 'capitalize'}}>
              {order.status}
            </span>
          </div>
          
          {isCancelled ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--danger)', background: '#fff5f5', borderRadius: 8 }}>
              This order has been cancelled.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STATUS_STEPS.map((s, i) => (
                <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= statusIdx ? 'var(--primary)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    {i <= statusIdx ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'capitalize', fontWeight: i === statusIdx ? 700 : 400, color: i <= statusIdx ? 'var(--primary)' : 'var(--text-light)' }}>{s}</div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ position: 'absolute', width: '25%', height: 2, background: i < statusIdx ? 'var(--primary)' : 'var(--border)', marginTop: 14 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card card-body" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Items</h3>
          {(order.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', background: 'var(--surface)', flexShrink: 0 }}>
                <img src={getImageUrl(item.image_url)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = 'https://via.placeholder.com/64'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.name || item.product_name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(item.price || 0).toFixed(0)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card card-body">
          <h3 style={{ marginBottom: 14 }}>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{parseFloat(order.total_amount || 0).toFixed(0)}</span></div>
          {order.discount_amount > 0 && <div className="summary-row summary-row-green"><span>Discount</span><span>-₹{parseFloat(order.discount_amount).toFixed(0)}</span></div>}
          <div className="summary-row"><span>Delivery</span><span>{parseFloat(order.delivery_charge || 0) === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span></div>
          <div className="summary-divider" />
          <div className="summary-total"><span>Total Paid</span><span>₹{parseFloat(order.total_amount || 0).toFixed(0)}</span></div>
          {order.payment_id && <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-light)' }}>Payment ID: {order.payment_id}</div>}
        </div>

        {/* Address */}
        {order.address && (
          <div className="card card-body" style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 10 }}>Delivery Address</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong>{order.address.full_name}</strong><br />
              {order.address.address_line1}{order.address.address_line2 ? `, ${order.address.address_line2}` : ''}<br />
              {order.address.city}, {order.address.state} - {order.address.postal_code}<br />
              {order.address.phone_number}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
