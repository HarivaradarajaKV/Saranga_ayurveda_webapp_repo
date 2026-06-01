import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { Package, ShoppingBag, Users, Star, TrendingUp, DollarSign } from 'lucide-react';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(ENDPOINTS.ADMIN_STATS),
      api.get(`${ENDPOINTS.ADMIN_ORDERS}?limit=5`)
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data);
      const data = ordersRes.data;
      setRecentOrders(Array.isArray(data) ? data.slice(0, 5) : (data?.orders || []).slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { label: 'Total Products', value: stats.total_products || stats.products || 0, icon: <Package size={20} />, color: '#694d21', bg: '#fdf3e6' },
    { label: 'Total Orders', value: stats.total_orders || stats.orders || 0, icon: <ShoppingBag size={20} />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Total Users', value: stats.total_users || stats.users || 0, icon: <Users size={20} />, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Revenue (₹)', value: `₹${parseFloat(stats.total_revenue || stats.revenue || 0).toFixed(0)}`, icon: <DollarSign size={20} />, color: '#22c55e', bg: '#f0fff4' },
  ] : [];

  const STATUS_COLORS = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard Overview</h1>
      </div>

      {loading ? (
        <div className="admin-stats-grid">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
        </div>
      ) : (
        <div className="admin-stats-grid">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="admin-stat-value">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3 style={{ fontWeight: 700, color: 'var(--text)' }}>Recent Orders</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>No orders yet</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>#{order.id}</td>
                  <td>{order.user_name || order.email || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(order.total_amount || 0).toFixed(0)}</td>
                  <td>
                    <span style={{ background: (STATUS_COLORS[order.status] || '#999') + '20', color: STATUS_COLORS[order.status] || '#999', padding: '3px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
