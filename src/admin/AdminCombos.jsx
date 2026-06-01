import { useState, useEffect } from 'react';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Pencil, X } from 'lucide-react';

const EMPTY = { name: '', description: '', combo_price: '', original_price: '' };

export default function AdminCombos() {
  const toast = useToast();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    api.get(ENDPOINTS.ADMIN_COMBOS_ALL || ENDPOINTS.ADMIN_COMBOS)
      .then(res => { const d = res.data; setCombos(Array.isArray(d) ? d : (d?.combos || [])); })
      .catch(() => setCombos([])).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(ENDPOINTS.ADMIN_COMBO(editing), form);
        toast.success('Combo updated!');
      } else {
        await api.post(ENDPOINTS.ADMIN_COMBOS, form);
        toast.success('Combo created!');
      }
      setShowForm(false); setForm(EMPTY); setEditing(null); fetch();
    } catch { toast.error('Failed to save combo'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this combo?')) return;
    try {
      await api.delete(ENDPOINTS.ADMIN_COMBO(id));
      setCombos(prev => prev.filter(c => c.id !== id));
      toast.success('Combo deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Combo Deals</h1>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); }}>
          <Plus size={16} /> Add Combo
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Combo' : 'New Combo'}</div>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Combo Price (₹) *</label><input type="number" className="form-input" required value={form.combo_price} onChange={e => setForm(p => ({ ...p, combo_price: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Original Price (₹)</label><input type="number" className="form-input" value={form.original_price} onChange={e => setForm(p => ({ ...p, original_price: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Combo Price</th><th>Original Price</th><th>Savings</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
                : combos.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(c.combo_price || c.price || 0).toFixed(0)}</td>
                    <td>{c.original_price ? `₹${parseFloat(c.original_price).toFixed(0)}` : '—'}</td>
                    <td style={{ color: 'var(--success)' }}>
                      {c.original_price ? `₹${(parseFloat(c.original_price) - parseFloat(c.combo_price || c.price || 0)).toFixed(0)}` : '—'}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => { setForm({ name: c.name, description: c.description || '', combo_price: String(c.combo_price || c.price || ''), original_price: String(c.original_price || '') }); setEditing(c.id); setShowForm(true); }}><Pencil size={13} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><Trash2 size={13} /></button>
                      </div>
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
