import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Pencil, X } from 'lucide-react';

const EMPTY_COUPON = { code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_uses: '', expires_at: '', is_active: true };

export default function AdminCoupons() {
  const toast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    api.get(ENDPOINTS.ADMIN_COUPONS)
      .then(res => { const d = res.data; setCoupons(Array.isArray(d) ? d : (d?.coupons || [])); })
      .catch(() => setCoupons([])).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(ENDPOINTS.ADMIN_COUPONS, form);
      toast.success('Coupon created!');
      setShowForm(false); setForm(EMPTY_COUPON); fetch();
    } catch { toast.error('Failed to create coupon'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(ENDPOINTS.ADMIN_COUPON(id));
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const F = ({ label, name, type = 'text', options }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {options ? (
        <select className="form-input form-select" value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} className="form-input" value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} />
      )}
    </div>
  );

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Coupons</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add Coupon</button>
      </div>
      {showForm && (
        <form className="admin-form mb-16" onSubmit={handleAdd}>
          <div className="admin-form-title">New Coupon</div>
          <div className="grid-2">
            <F label="Coupon Code" name="code" />
            <F label="Discount Type" name="discount_type" options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed Amount (₹)' }]} />
            <F label="Discount Value" name="discount_value" type="number" />
            <F label="Min Order Amount (₹)" name="min_order_amount" type="number" />
            <F label="Max Uses" name="max_uses" type="number" />
            <F label="Expires At" name="expires_at" type="date" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Coupon'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="admin-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
                : coupons.map(c => (
                  <tr key={c.id}>
                    <td><code style={{ background: 'var(--surface)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{c.code}</code></td>
                    <td style={{ textTransform: 'capitalize' }}>{c.discount_type}</td>
                    <td>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                    <td>{c.min_order_amount ? `₹${c.min_order_amount}` : '—'}</td>
                    <td>{c.used_count || 0}/{c.max_uses || '∞'}</td>
                    <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td><span className={`badge ${c.is_active !== false ? 'badge-success' : 'badge-danger'}`}>{c.is_active !== false ? 'Active' : 'Inactive'}</span></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><Trash2 size={13} /></button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
