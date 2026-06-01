import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, X } from 'lucide-react';

export default function AdminCategories() {
  const toast = useToast();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    api.get(ENDPOINTS.ADMIN_CATEGORIES)
      .then(res => { const d = res.data; setCats(Array.isArray(d) ? d : (d?.categories || [])); })
      .catch(() => setCats([])).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (imageFile) fd.append('image', imageFile);
      await api.post(ENDPOINTS.ADMIN_CATEGORIES, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Category added!');
      setShowForm(false); setForm({ name: '', description: '' }); setImageFile(null);
      fetch();
    } catch { toast.error('Failed to add category'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(ENDPOINTS.ADMIN_CATEGORY(id));
      setCats(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add Category</button>
      </div>
      {showForm && (
        <form className="admin-form mb-16" onSubmit={handleAdd}>
          <div className="admin-form-title">New Category</div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Name *</label><input className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Image</label><input type="file" accept="image/*" className="form-input" style={{ padding: 6 }} onChange={e => setImageFile(e.target.files[0])} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Category'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="admin-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
                : cats.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ maxWidth: 300 }}>{c.description}</td>
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
