import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Search } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    api.get(ENDPOINTS.ADMIN_ORDERS)
      .then(res => { const d = res.data; setOrders(Array.isArray(d) ? d : (d?.orders || [])); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(ENDPOINTS.ADMIN_ORDER_STATUS(id), { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`Order status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !searchQ || String(o.id).includes(searchQ) || (o.user_name || '').toLowerCase().includes(searchQ.toLowerCase());
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders</h1>
      </div>
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, color: 'var(--text-light)' }} />
              <input className="form-input" style={{ paddingLeft: 36, width: 200 }} placeholder="Search order..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <select className="form-input form-select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
            </select>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} orders</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : filtered.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700 }}>#{order.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.user_name || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{order.email}</div>
                  </td>
                  <td>{order.items?.length || order.item_count || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(order.total_amount || 0).toFixed(0)}</td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <select
                      className="form-input form-select"
                      style={{ fontSize: '0.78rem', padding: '4px 30px 4px 8px', width: 130, background: (STATUS_COLORS[order.status] || '#999') + '20', color: STATUS_COLORS[order.status] || '#999', fontWeight: 700, border: 'none' }}
                      value={order.status || 'pending'}
                      onChange={e => updateStatus(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
