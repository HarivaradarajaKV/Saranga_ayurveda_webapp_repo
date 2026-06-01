import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api/api';
import { Package, ChevronRight } from 'lucide-react';

const STATUS_COLORS = {
  pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6',
  delivered: '#22c55e', cancelled: '#ef4444',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(ENDPOINTS.ORDERS)
      .then(res => setOrders(Array.isArray(res.data) ? res.data : (res.data?.orders || [])))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-content page-fade-in">
      <div className="container-sm">
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 28 }}>My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={32} /></div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <Link to="/explore" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map(order => (
              <Link key={order.id} to={`/profile/orders/${order.id}`} className="card card-body" style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Order #{order.id}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      &nbsp;· {order.items?.length || 0} item(s)
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status], padding: '4px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {order.status || 'pending'}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(order.total_amount || 0).toFixed(0)}</span>
                    <ChevronRight size={18} color="var(--text-light)" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
