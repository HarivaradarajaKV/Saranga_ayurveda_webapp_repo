import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api, { ENDPOINTS } from '../../api/api';
import { Plus, Trash2, MapPin } from 'lucide-react';

export default function Addresses() {
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone_number: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAddresses(); }, []);
  const fetchAddresses = async () => {
    api.get(ENDPOINTS.ADDRESSES)
      .then(res => setAddresses(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(ENDPOINTS.ADDRESSES, form);
      await fetchAddresses();
      setShowForm(false);
      setForm({ full_name: '', phone_number: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India' });
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(ENDPOINTS.ADDRESS(id));
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(ENDPOINTS.ADDRESS_DEFAULT(id));
      await fetchAddresses();
      toast.success('Default address updated');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="page-content page-fade-in">
      <div className="container-sm">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Saved Addresses</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Address
          </button>
        </div>

        {showForm && (
          <form className="card card-body mb-16" onSubmit={handleAdd}>
            <h3 style={{ marginBottom: 16 }}>New Address</h3>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" required value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Address Line 1</label><input className="form-input" required value={form.address_line1} onChange={e => setForm(p => ({ ...p, address_line1: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Address Line 2</label><input className="form-input" value={form.address_line2} onChange={e => setForm(p => ({ ...p, address_line2: e.target.value }))} /></div>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">City</label><input className="form-input" required value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">State</label><input className="form-input" required value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Pincode</label><input className="form-input" required maxLength={6} value={form.postal_code} onChange={e => setForm(p => ({ ...p, postal_code: e.target.value.replace(/\D/g, '') }))} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {loading ? <div className="loading-center"><div className="spinner" /></div> :
          addresses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><MapPin size={28} /></div>
              <h3>No saved addresses</h3>
              <p>Add your first delivery address</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {addresses.map(addr => (
                <div key={addr.id} className="card card-body address-card-list">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>{addr.full_name}</span>
                      {addr.is_default && <span className="badge badge-primary">Default</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state} - {addr.postal_code}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 4 }}>{addr.phone_number}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {!addr.is_default && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleSetDefault(addr.id)}>Set Default</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(addr.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}
