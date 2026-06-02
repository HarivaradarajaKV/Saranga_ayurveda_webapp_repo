import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Search, Sparkles, Save, RotateCcw, Loader2, ArrowLeft } from 'lucide-react';
import './Admin.css';

export default function AdminNewArrivals() {
  const toast = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [initialIds, setInitialIds] = useState(new Set());
  const [error, setError] = useState(null);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // View Mode: 'all' (shows all products) or 'selected' (shows only selected/new arrival flagged products)
  const [viewMode, setViewMode] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/new-arrivals'),
        api.get(ENDPOINTS.ADMIN_CATEGORIES)
      ]);
      
      const prods = prodRes.data || [];
      setProducts(prods);
      setCategories(catRes.data || []);
      
      // Load initially selected products
      const selected = new Set(prods.filter(p => p.is_new_arrival).map(p => p.id));
      setSelectedIds(new Set(selected));
      setInitialIds(new Set(selected));
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to load products';
      setError(errMsg);
      toast.error('Failed to load products');
      console.error(err);
    }
    setLoading(false);
  };

  const handleToggle = (id) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const handleReset = () => {
    setSelectedIds(new Set(initialIds));
    toast.info('Selections reset to initial state');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/new-arrivals', {
        product_ids: Array.from(selectedIds)
      });
      toast.success('New arrivals updated successfully');
      setInitialIds(new Set(selectedIds)); // Sync initial state
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save changes');
    }
    setSaving(false);
  };

  // Filter products locally based on viewMode, search, and category
  const filteredProducts = products.filter(p => {
    const matchesView = viewMode === 'all' || selectedIds.has(p.id);
    const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '' || 
      String(p.category_id) === String(selectedCategory) ||
      (Array.isArray(p.category_ids) && p.category_ids.some(catId => String(catId) === String(selectedCategory)));
    return matchesView && matchesSearch && matchesCategory;
  });

  const hasChanges = Array.from(selectedIds).sort().join(',') !== Array.from(initialIds).sort().join(',');

  return (
    <div className="page-fade-in">
      <div className="admin-page-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/admin')} 
            className="navbar-icon-btn" 
            style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '6px' }}
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={22} className="text-primary" />
              Manage New Arrivals
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '2px' }}>
              Select which products appear under the "New Arrivals" section on the storefront homepage.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleReset} 
            className="btn btn-secondary" 
            disabled={!hasChanges || saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px' }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button 
            onClick={handleSave} 
            className="btn btn-primary" 
            disabled={!hasChanges || saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px' }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Error Alert Display */}
      {error && (
        <div style={{ padding: '16px 20px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span> Error Loading Products
          </div>
          <div>{error}</div>
          <button 
            onClick={fetchData} 
            className="btn btn-secondary" 
            style={{ width: 'max-content', marginTop: '6px', padding: '4px 12px', height: 'auto', fontSize: '0.8rem', color: '#b91c1c', borderColor: '#fca5a5' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Tabs Selector: All Products vs Selected New Arrivals */}
      <div style={{ display: 'flex', background: 'var(--surface)', padding: '4px', borderRadius: '8px', width: 'max-content', gap: '4px', marginBottom: '16px' }}>
        <button
          onClick={() => setViewMode('all')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: viewMode === 'all' ? 'var(--primary)' : 'transparent',
            color: viewMode === 'all' ? '#fff' : 'var(--text-light)',
            transition: 'all 0.2s'
          }}
        >
          All Products ({products.length})
        </button>
        <button
          onClick={() => setViewMode('selected')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: viewMode === 'selected' ? 'var(--primary)' : 'transparent',
            color: viewMode === 'selected' ? '#fff' : 'var(--text-light)',
            transition: 'all 0.2s'
          }}
        >
          Selected New Arrivals ({selectedIds.size})
        </button>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="admin-table-header" style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px', height: '40px', width: '100%' }}
          />
        </div>
        <select 
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
          className="form-input"
          style={{ width: '220px', height: '40px' }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)', padding: '6px 12px', background: 'var(--primary-pale)', borderRadius: '8px' }}>
          {selectedIds.size} Selected
        </div>
      </div>

      {/* Grid List of Products */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 12 }} />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-table-wrap" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-light)' }}>
          {viewMode === 'selected' ? 'No products have been flagged as New Arrivals yet.' : 'No products match your search or filter criteria.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(p => {
            const isSelected = selectedIds.has(p.id);
            return (
              <div 
                key={p.id} 
                className={`admin-shortcut-card ${isSelected ? 'selected' : ''}`}
                style={{ 
                  padding: '16px', 
                  borderRadius: '12px', 
                  position: 'relative', 
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                  boxShadow: isSelected ? 'var(--shadow)' : 'var(--shadow-sm)',
                  backgroundColor: isSelected ? 'var(--primary-pale)' : 'var(--bg)'
                }}
                onClick={() => handleToggle(p.id)}
              >
                {/* Product Image - Full size containing in square properly */}
                <div style={{ 
                  width: '100%', 
                  aspectRatio: '1 / 1', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  background: '#ffffff', 
                  border: '1px solid var(--border-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '12px' 
                }}>
                  {p.image_url ? (
                    <img 
                      src={getImageUrl(p.image_url)} 
                      alt={p.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                      onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Meta */}
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', width: '100%', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                  {p.name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{p.price ? parseFloat(p.price).toFixed(0) : '0'}
                  </span>
                  
                  {/* Styled Switch/Toggle Checkbox Indicator */}
                  <div style={{ 
                    width: '36px', 
                    height: '20px', 
                    borderRadius: '100px', 
                    backgroundColor: isSelected ? 'var(--primary)' : '#cbd5e1', 
                    position: 'relative', 
                    transition: 'background-color 0.2s' 
                  }}>
                    <div style={{ 
                      width: '14px', 
                      height: '14px', 
                      borderRadius: '50%', 
                      backgroundColor: '#fff', 
                      position: 'absolute', 
                      top: '3px', 
                      left: isSelected ? '19px' : '3px',
                      transition: 'left 0.2s'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
