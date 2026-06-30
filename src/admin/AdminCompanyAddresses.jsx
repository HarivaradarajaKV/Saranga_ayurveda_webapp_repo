import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Pencil, Trash2, CheckCircle, MapPin } from 'lucide-react';
import './Invoices.css';

const EMPTY_ADDRESS = {
  company_name: '', address_line1: '', address_line2: '',
  city: '', state: '', pincode: '', gst_number: '',
  drug_license: '', phone: '', email: '', is_default: false
};

export default function AdminCompanyAddresses() {
  const toast = useToast();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/invoices/company-addresses');
      setAddresses(res.data || []);
    } catch (err) {
      toast.show('Error fetching company addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr) => {
    setForm(addr);
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/admin/invoices/company-addresses/${id}/default`);
      toast.show('Default company address updated', 'success');
      fetchAddresses();
    } catch (err) {
      toast.show('Failed to set default address', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company address?')) return;
    try {
      await api.delete(`/admin/invoices/company-addresses/${id}`);
      toast.show('Company address deleted', 'success');
      fetchAddresses();
    } catch (err) {
      toast.show('Failed to delete address', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/invoices/company-addresses/${editingId}`, form);
        toast.show('Company address updated', 'success');
      } else {
        await api.post('/admin/invoices/company-addresses', form);
        toast.show('Company address created', 'success');
      }
      setShowForm(false);
      setForm(EMPTY_ADDRESS);
      setEditingId(null);
      navigate('/admin/company-addresses');
      fetchAddresses();
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to save address', 'error');
    }
  };

  return (
    <div className="page-fade-in invoices-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Company Addresses</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_ADDRESS); setEditingId(null); setShowForm(true); }}>
            <Plus size={16} /> Add Address
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: '100%' }}>
          <h2 className="admin-form-title">{editingId ? 'Edit Company Address' : 'New Company Address'}</h2>
          
          <div className="invoice-grid-2">
            <div className="form-group">
              <label>Company Name *</label>
              <input type="text" className="form-input" required value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>GST Number *</label>
              <input type="text" className="form-input" required placeholder="e.g. 29ACWPI1750R1ZN" value={form.gst_number} onChange={e => setForm({...form, gst_number: e.target.value})} />
            </div>
          </div>

          <div className="invoice-grid-2">
            <div className="form-group">
              <label>Address Line 1 *</label>
              <input type="text" className="form-input" required value={form.address_line1} onChange={e => setForm({...form, address_line1: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Address Line 2</label>
              <input type="text" className="form-input" value={form.address_line2 || ''} onChange={e => setForm({...form, address_line2: e.target.value})} />
            </div>
          </div>

          <div className="invoice-grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="form-group">
              <label>City *</label>
              <input type="text" className="form-input" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input type="text" className="form-input" required value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input type="text" className="form-input" required value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} />
            </div>
          </div>

          <div className="invoice-grid-2">
            <div className="form-group">
              <label>Drug License Number(s)</label>
              <input type="text" className="form-input" placeholder="e.g. DL-12345, DL-67890" value={form.drug_license || ''} onChange={e => setForm({...form, drug_license: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" className="form-input" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>

          <div className="invoice-grid-2">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 30 }}>
              <input type="checkbox" id="is_default" checked={form.is_default} onChange={e => setForm({...form, is_default: e.target.checked})} />
              <label htmlFor="is_default" style={{ margin: 0, cursor: 'pointer' }}>Set as Default Address</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary">Save Address</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="admin-table-wrap">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Company Details</th>
                  <th>GST / DL Numbers</th>
                  <th>Contact info</th>
                  <th>Default</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                      <div className="spinner" style={{ margin: 'auto' }} />
                    </td>
                  </tr>
                ) : addresses.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>
                      No company addresses found. Add your first address to start billing.
                    </td>
                  </tr>
                ) : (
                  addresses.map(addr => (
                    <tr key={addr.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-h)' }}>{addr.company_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          {addr.address_line1}, {addr.address_line2 ? addr.address_line2 + ', ' : ''}{addr.city}, {addr.state} - {addr.pincode}
                        </div>
                      </td>
                      <td>
                        <div><strong style={{ fontSize: '0.75rem' }}>GST:</strong> {addr.gst_number}</div>
                        {addr.drug_license && <div style={{ marginTop: 2 }}><strong style={{ fontSize: '0.75rem' }}>DL:</strong> {addr.drug_license}</div>}
                      </td>
                      <td>
                        <div>{addr.phone || '—'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{addr.email || '—'}</div>
                      </td>
                      <td>
                        {addr.is_default ? (
                          <span className="tag-status finalized" style={{ gap: 4 }}>
                            <CheckCircle size={10} /> Default
                          </span>
                        ) : (
                          <button className="btn btn-secondary btn-xs" onClick={() => handleSetDefault(addr.id)}>
                            Set Default
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button className="btn btn-secondary btn-xs" onClick={() => handleEdit(addr)}>
                            <Pencil size={12} />
                          </button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(addr.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
