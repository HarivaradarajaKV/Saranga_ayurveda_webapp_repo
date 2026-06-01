import { useState, useEffect, useRef } from 'react';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

const EMPTY_PRODUCT = {
  name: '', description: '', price: '', offer_percentage: '0', category_id: '',
  stock_quantity: '', benefits: '', ingredients: '', usage_instructions: '',
  size: '', product_details: '', status: 'active',
};

export default function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageFile2, setImageFile2] = useState(null);
  const [imageFile3, setImageFile3] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    api.get(ENDPOINTS.CATEGORIES).then(res => {
      setCategories(Array.isArray(res.data) ? res.data : (res.data?.categories || []));
    }).catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    api.get(ENDPOINTS.ADMIN_PRODUCTS)
      .then(res => {
        const d = res.data;
        setProducts(Array.isArray(d) ? d : (d?.products || []));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  const openAddForm = () => { setForm(EMPTY_PRODUCT); setEditing(null); setImageFile(null); setImageFile2(null); setImageFile3(null); setShowForm(true); };
  const openEditForm = (p) => { setForm({ ...p, price: String(p.price), offer_percentage: String(p.offer_percentage || 0), stock_quantity: String(p.stock_quantity || 0), category_id: String(p.category_id || '') }); setEditing(p.id); setImageFile(null); setImageFile2(null); setImageFile3(null); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (imageFile2) fd.append('image2', imageFile2);
      if (imageFile3) fd.append('image3', imageFile3);

      if (editing) {
        await api.put(ENDPOINTS.ADMIN_PRODUCT(editing), fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post(ENDPOINTS.ADMIN_PRODUCTS, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      setShowForm(false);
      fetchProducts();
    } catch { toast.error('Failed to save product'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(ENDPOINTS.ADMIN_PRODUCT(id));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(searchQ.toLowerCase()));

  const F = ({ label, name, type = 'text', required, options }) => (
    <div className="form-group">
      <label className="form-label">{label}{required ? ' *' : ''}</label>
      {options ? (
        <select className="form-input form-select" value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} required={required}>
          <option value="">Select {label}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea className="form-input" rows={3} value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} style={{ resize: 'vertical' }} />
      ) : (
        <input type={type} className="form-input" value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} required={required} />
      )}
    </div>
  );

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Products</h1>
        <button className="btn btn-primary" onClick={openAddForm}><Plus size={16} /> Add Product</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</div>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <F label="Product Name" name="name" required />
                <F label="Category" name="category_id" options={categories.map(c => ({ value: c.id, label: c.name }))} required />
                <F label="Price (₹)" name="price" type="number" required />
                <F label="Offer %" name="offer_percentage" type="number" />
                <F label="Stock Quantity" name="stock_quantity" type="number" required />
                <F label="Size / Weight" name="size" />
                <F label="Status" name="status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'out_of_stock', label: 'Out of Stock' }]} />
              </div>
              <F label="Description" name="description" type="textarea" />
              <F label="Benefits" name="benefits" type="textarea" />
              <F label="Ingredients" name="ingredients" type="textarea" />
              <F label="Usage Instructions" name="usage_instructions" type="textarea" />
              <div className="grid-3" style={{ marginBottom: 16 }}>
                {[['Main Image', setImageFile], ['Image 2', setImageFile2], ['Image 3', setImageFile3]].map(([label, setter], i) => (
                  <div key={i} className="form-group">
                    <label className="form-label">{label}</label>
                    <input type="file" accept="image/*" className="form-input" onChange={e => setter(e.target.files[0])} style={{ padding: '6px' }} />
                  </div>
                ))}
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
        <div className="admin-table-header">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, color: 'var(--text-light)' }} />
            <input className="form-input" style={{ paddingLeft: 36, width: 240 }} placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} products</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Image</th><th>Name</th><th>Price</th><th>Offer</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td><img src={getImageUrl(p.image_url)} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} onError={e => e.target.src = 'https://via.placeholder.com/48'} /></td>
                  <td style={{ fontWeight: 600, maxWidth: 200 }}>{p.name}</td>
                  <td>₹{parseFloat(p.price || 0).toFixed(0)}</td>
                  <td>{p.offer_percentage ? `${p.offer_percentage}%` : '—'}</td>
                  <td>{p.stock_quantity}</td>
                  <td><span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{p.status || 'active'}</span></td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditForm(p)}><Pencil size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></button>
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
