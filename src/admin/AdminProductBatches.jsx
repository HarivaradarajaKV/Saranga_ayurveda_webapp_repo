import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Pencil, Layers, Calendar, AlertTriangle } from 'lucide-react';
import './Invoices.css';

const EMPTY_BATCH = {
  batch_number: '', expiry_date: '', mrp: '', selling_price: '', stock_quantity: ''
};

export default function AdminProductBatches() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [batches, setBatches] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_BATCH);

  useEffect(() => {
    // Load products list
    api.get(ENDPOINTS.ADMIN_PRODUCTS)
      .then(res => {
        const d = res.data;
        const list = Array.isArray(d) ? d : (d?.products || []);
        setProducts(list);
        if (list.length > 0) {
          setSelectedProductId(String(list[0].id));
        }
      })
      .catch(() => toast.show('Failed to load products list', 'error'))
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchBatches(selectedProductId);
    } else {
      setBatches([]);
    }
  }, [selectedProductId]);

  const fetchBatches = async (productId) => {
    setLoadingBatches(true);
    try {
      const res = await api.get(`/admin/invoices/products/${productId}/batches`);
      setBatches(res.data || []);
    } catch (err) {
      toast.show('Failed to load product batches', 'error');
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleEdit = (batch) => {
    setForm({
      batch_number: batch.batch_number,
      expiry_date: batch.expiry_date ? batch.expiry_date.split('T')[0] : '',
      mrp: String(batch.mrp),
      selling_price: String(batch.selling_price),
      stock_quantity: String(batch.stock_quantity)
    });
    setEditingId(batch.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return;
    
    try {
      const payload = {
        ...form,
        mrp: parseFloat(form.mrp) || 0.00,
        selling_price: parseFloat(form.selling_price) || 0.00,
        stock_quantity: parseInt(form.stock_quantity) || 0
      };

      if (editingId) {
        await api.put(`/admin/invoices/products/batches/${editingId}`, payload);
        toast.show('Batch updated successfully', 'success');
      } else {
        await api.post(`/admin/invoices/products/${selectedProductId}/batches`, payload);
        toast.show('New batch created successfully', 'success');
      }
      setShowForm(false);
      setForm(EMPTY_BATCH);
      setEditingId(null);
      fetchBatches(selectedProductId);
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to save batch details', 'error');
    }
  };

  const getSelectedProduct = () => {
    return products.find(p => String(p.id) === selectedProductId);
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const isLowStock = (qty) => {
    return qty <= 10;
  };

  return (
    <div className="page-fade-in invoices-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Product Batch Management</h1>
        {selectedProductId && !showForm && (
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_BATCH); setEditingId(null); setShowForm(true); }}>
            <Plus size={16} /> Add Batch
          </button>
        )}
      </div>

      <div className="invoice-card" style={{ padding: 18, marginBottom: 12 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Select Product to Manage Batches</label>
          {loadingProducts ? (
            <div>Loading products...</div>
          ) : (
            <select className="form-select" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
              <option value="">-- Choose Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selectedProductId && (
        <>
          {showForm ? (
            <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: '100%' }}>
              <h2 className="admin-form-title">
                {editingId ? `Edit Batch for ${getSelectedProduct()?.name}` : `New Batch for ${getSelectedProduct()?.name}`}
              </h2>

              <div className="invoice-grid-2">
                <div className="form-group">
                  <label>Batch Number *</label>
                  <input type="text" className="form-input" required placeholder="e.g. BATCH-A01" value={form.batch_number} onChange={e => setForm({...form, batch_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input type="date" className="form-input" required value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
                </div>
              </div>

              <div className="invoice-grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="form-group">
                  <label>Maximum Retail Price (MRP) *</label>
                  <input type="number" step="0.01" className="form-input" required placeholder="0.00" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Wholesale Rate (Selling Price) *</label>
                  <input type="number" step="0.01" className="form-input" required placeholder="0.00" value={form.selling_price} onChange={e => setForm({...form, selling_price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Initial / Available Stock *</label>
                  <input type="number" className="form-input" required placeholder="0" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary">Save Batch Details</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="admin-table-wrap">
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Batch number</th>
                      <th>Expiry date</th>
                      <th>MRP</th>
                      <th>Wholesale Rate</th>
                      <th>Stock Quantity</th>
                      <th>Alerts</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBatches ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                          <div className="spinner" style={{ margin: 'auto' }} />
                        </td>
                      </tr>
                    ) : batches.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>
                          No batches found for this product. Click "Add Batch" to record stock.
                        </td>
                      </tr>
                    ) : (
                      batches.map(batch => {
                        const expired = isExpired(batch.expiry_date);
                        const lowStock = isLowStock(batch.stock_quantity);
                        return (
                          <tr key={batch.id}>
                            <td style={{ fontWeight: 700, color: 'var(--text-h)' }}>
                              <Layers size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--primary)' }} />
                              {batch.batch_number}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                                {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('en-IN') : '—'}
                              </div>
                            </td>
                            <td>₹{parseFloat(batch.mrp).toFixed(2)}</td>
                            <td>₹{parseFloat(batch.selling_price).toFixed(2)}</td>
                            <td style={{ fontWeight: 600 }}>
                              <span style={{ color: lowStock ? '#b91c1c' : 'inherit' }}>
                                {batch.stock_quantity}
                              </span>
                            </td>
                            <td>
                              {expired && (
                                <span className="tag-status cancelled" style={{ gap: 4, padding: '2px 8px' }}>
                                  <AlertTriangle size={10} /> Expired
                                </span>
                              )}
                              {!expired && lowStock && (
                                <span className="tag-status draft" style={{ gap: 4, padding: '2px 8px', background: '#fef3c7', color: '#d97706' }}>
                                  <AlertTriangle size={10} /> Low Stock
                                </span>
                              )}
                              {!expired && !lowStock && (
                                <span style={{ color: '#16a34a', fontSize: '0.8rem' }}>Good</span>
                              )}
                            </td>
                            <td>
                              <div className="admin-table-actions">
                                <button className="btn btn-secondary btn-xs" onClick={() => handleEdit(batch)}>
                                  <Pencil size={12} /> Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
