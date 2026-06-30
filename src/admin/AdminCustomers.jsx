import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Pencil, Trash2, Search, Store } from 'lucide-react';
import './Invoices.css';

const EMPTY_CUSTOMER = {
  shop_name: '', owner_name: '', address_line1: '', address_line2: '',
  city: '', state: '', pincode: '', gst_number: '',
  drug_license: '', phone: '', email: '', contact_person: ''
};

export default function AdminCustomers() {
  const toast = useToast();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_CUSTOMER);

  useEffect(() => {
    fetchCustomers();
  }, [searchQ]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/invoices/customers?q=${encodeURIComponent(searchQ)}`);
      setCustomers(res.data || []);
    } catch (err) {
      toast.show('Error fetching customers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cust) => {
    setForm(cust);
    setEditingId(cust.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer profile?')) return;
    try {
      await api.delete(`/admin/invoices/customers/${id}`);
      toast.show('Customer profile deleted', 'success');
      fetchCustomers();
    } catch (err) {
      toast.show('Failed to delete customer', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/invoices/customers/${editingId}`, form);
        toast.show('Customer details updated', 'success');
      } else {
        await api.post('/admin/invoices/customers', form);
        toast.show('Customer profile created', 'success');
      }
      setShowForm(false);
      setForm(EMPTY_CUSTOMER);
      setEditingId(null);
      navigate('/admin/customers');
      fetchCustomers();
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to save customer', 'error');
    }
  };

  return (
    <div className="page-fade-in invoices-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Customer Billing Profiles</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_CUSTOMER); setEditingId(null); setShowForm(true); }}>
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: '100%' }}>
          <h2 className="admin-form-title">{editingId ? 'Edit Customer Details' : 'New Customer Profile'}</h2>
          
          <div className="invoice-grid-2">
            <div className="form-group">
              <label>Shop / Firm Name *</label>
              <input type="text" className="form-input" required value={form.shop_name} onChange={e => setForm({...form, shop_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Owner Name</label>
              <input type="text" className="form-input" value={form.owner_name || ''} onChange={e => setForm({...form, owner_name: e.target.value})} />
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
              <label>GSTIN Number</label>
              <input type="text" className="form-input" placeholder="e.g. 29AKAAB0205Q1Z1" value={form.gst_number || ''} onChange={e => setForm({...form, gst_number: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Drug License Number</label>
              <input type="text" className="form-input" placeholder="e.g. 21-KA-B32-167791" value={form.drug_license || ''} onChange={e => setForm({...form, drug_license: e.target.value})} />
            </div>
          </div>

          <div className="invoice-grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="text" className="form-input" required value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input type="text" className="form-input" placeholder="Name of rep/manager" value={form.contact_person || ''} onChange={e => setForm({...form, contact_person: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary">Save Customer</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, color: 'var(--text-light)' }} />
              <input type="text" className="form-input" style={{ paddingLeft: 36, width: 260 }} placeholder="Search shops, owners, phone..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{customers.length} customers</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Shop / Owner Name</th>
                  <th>Billing Address</th>
                  <th>Contact Details</th>
                  <th>GSTIN / Drug License</th>
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
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>
                      No customers found matching your search.
                    </td>
                  </tr>
                ) : (
                  customers.map(cust => (
                    <tr key={cust.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-h)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Store size={14} style={{ color: 'var(--primary)' }} /> {cust.shop_name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Owner: {cust.owner_name || '—'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>
                          {cust.address_line1}, {cust.address_line2 ? cust.address_line2 + ', ' : ''}{cust.city}, {cust.state} - {cust.pincode}
                        </div>
                      </td>
                      <td>
                        <div>{cust.phone}</div>
                        {cust.email && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cust.email}</div>}
                        {cust.contact_person && <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Rep: {cust.contact_person}</div>}
                      </td>
                      <td>
                        <div><strong style={{ fontSize: '0.75rem' }}>GSTIN:</strong> {cust.gst_number || '—'}</div>
                        {cust.drug_license && <div style={{ marginTop: 2 }}><strong style={{ fontSize: '0.75rem' }}>DL:</strong> {cust.drug_license}</div>}
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button className="btn btn-secondary btn-xs" onClick={() => handleEdit(cust)}>
                            <Pencil size={12} />
                          </button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(cust.id)}>
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
