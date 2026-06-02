import { useState, useEffect, useRef } from 'react';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Pencil, Trash2, Search, X, ArrowLeft, ArrowRight } from 'lucide-react';

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
  const [mediaItems, setMediaItems] = useState([]);
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

  const closeForm = () => {
    mediaItems.forEach(item => {
      if (item.isNew && item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setMediaItems([]);
    setShowForm(false);
  };

  const openAddForm = () => { 
    setForm(EMPTY_PRODUCT); 
    setEditing(null); 
    setMediaItems([]); 
    setShowForm(true); 
  };
  
  const openEditForm = (p) => { 
    setForm({ 
      ...p, 
      price: String(p.price), 
      offer_percentage: String(p.offer_percentage || 0), 
      stock_quantity: String(p.stock_quantity || 0), 
      category_id: String(p.category_id || '') 
    }); 
    setEditing(p.id); 
    
    const existing = Array.isArray(p.media) ? p.media.map((m, idx) => ({
      id: `existing-${idx}-${Math.random()}`,
      isNew: false,
      preview: m.url,
      type: m.type || (m.url?.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : m.url?.match(/\.gif$/i) ? 'gif' : 'image'),
      url: m.url
    })) : [];
    setMediaItems(existing); 
    setShowForm(true); 
  };

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).map(file => {
      const isVideo = file.type.startsWith('video');
      const isGif = file.type.includes('gif') || file.name.toLowerCase().endsWith('.gif');
      const fileType = isVideo ? 'video' : isGif ? 'gif' : 'image';
      
      return {
        id: `new-${Date.now()}-${Math.random()}`,
        isNew: true,
        file: file,
        preview: URL.createObjectURL(file),
        type: fileType
      };
    });
    setMediaItems(prev => [...prev, ...files]);
    e.target.value = ''; // Reset input to allow selection of same file again
  };

  const removeMediaItem = (item) => {
    if (item.isNew && item.preview) {
      URL.revokeObjectURL(item.preview);
    }
    setMediaItems(prev => prev.filter(x => x.id !== item.id));
  };

  const moveMediaItem = (index, direction) => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === mediaItems.length - 1) return;
    
    const nextIndex = direction === 'left' ? index - 1 : index + 1;
    const newItems = [...mediaItems];
    const temp = newItems[index];
    newItems[index] = newItems[nextIndex];
    newItems[nextIndex] = temp;
    setMediaItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'media' && k !== 'images') {
          fd.append(k, v);
        }
      });
      
      let useDirectUpload = false;
      let updatedMediaPayload = [];

      try {
        console.log('[Direct Upload] Attempting secure signed URL direct uploads...');
        
        updatedMediaPayload = await Promise.all(
          mediaItems.map(async (item) => {
            if (item.isNew && item.file) {
              console.log(`[Direct Upload] Requesting signed upload URL for: ${item.file.name}`);
              const signedRes = await api.post('/products/signed-upload-url', {
                fileName: item.file.name || 'image.jpg'
              });

              if (!signedRes.data || !signedRes.data.signedUrl || !signedRes.data.publicUrl) {
                throw new Error(signedRes.data?.error || 'Failed to get signed URL');
              }

              console.log(`[Direct Upload] Uploading to signed URL: ${signedRes.data.signedUrl}`);
              
              const uploadResponse = await fetch(signedRes.data.signedUrl, {
                method: 'PUT',
                headers: {
                  'Content-Type': item.file.type || 'image/jpeg',
                },
                body: item.file
              });

              if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Signed upload failed: ${errorText}`);
              }

              console.log(`[Direct Upload] Successfully uploaded directly to Supabase: ${signedRes.data.publicUrl}`);
              return { url: signedRes.data.publicUrl, type: item.type };
            } else {
              return { url: item.url, type: item.type };
            }
          })
        );

        useDirectUpload = true;
        fd.append('existing_media', JSON.stringify(updatedMediaPayload));
        console.log('Sending direct stitched media order:', JSON.stringify(updatedMediaPayload));
      } catch (err) {
        console.warn('[Direct Upload] Failed, falling back to backend multi-part upload:', err);
        useDirectUpload = false;
      }

      if (!useDirectUpload) {
        const newFiles = mediaItems.filter(item => item.isNew);
        const existingMediaPayload = mediaItems.map(item => {
          if (!item.isNew) {
            return { url: item.url, type: item.type };
          } else {
            const newFileIndex = newFiles.findIndex(f => f.id === item.id);
            return { url: `new_file_${newFileIndex}`, type: item.type };
          }
        });
        
        fd.append('existing_media', JSON.stringify(existingMediaPayload));
        
        newFiles.forEach(item => {
          fd.append('images', item.file);
        });
      }

      if (editing) {
        await api.put(ENDPOINTS.PRODUCT(editing), fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post(ENDPOINTS.PRODUCTS, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      closeForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(ENDPOINTS.PRODUCT(id));
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
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</div>
              <button className="modal-close" onClick={closeForm}><X size={20} /></button>
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
              
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Product Media ({mediaItems.length})</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 400 }}>
                    First item is the primary storefront cover image.
                  </span>
                </label>
                
                {mediaItems.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: 12, 
                    overflowX: 'auto', 
                    paddingBottom: 8, 
                    marginBottom: 16,
                    border: '1px solid var(--border-light)',
                    borderRadius: 12,
                    padding: 12,
                    background: '#fcfbf9'
                  }}>
                    {mediaItems.map((item, idx) => {
                      const isVideo = item.type === 'video';
                      const isCover = idx === 0;
                      return (
                        <div key={item.id} style={{ 
                          position: 'relative', 
                          minWidth: 110, 
                          width: 110, 
                          height: 110, 
                          borderRadius: 10, 
                          overflow: 'hidden', 
                          border: isCover ? '2px solid #694d21' : '1px solid var(--border-light)', 
                          boxShadow: isCover ? '0 4px 12px rgba(105, 77, 33, 0.15)' : '0 2px 6px rgba(0,0,0,0.05)',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease-in-out'
                        }}>
                          {/* Preview element */}
                          {isVideo ? (
                            <video 
                              src={item.isNew ? item.preview : getImageUrl(item.preview)} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              muted 
                              autoPlay 
                              loop 
                              playsInline 
                            />
                          ) : (
                            <img 
                              src={item.isNew ? item.preview : getImageUrl(item.preview)} 
                              alt="" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          )}

                          {/* Cover Image Badge */}
                          {isCover && (
                            <div style={{ 
                              position: 'absolute', 
                              top: 6, 
                              left: 6, 
                              backgroundColor: '#694d21', 
                              color: '#f3efe9', 
                              fontSize: '0.6rem', 
                              fontWeight: 'bold', 
                              padding: '2px 6px', 
                              borderRadius: 4,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              COVER
                            </div>
                          )}

                          {/* Type Badge */}
                          <div style={{ 
                            position: 'absolute', 
                            bottom: 6, 
                            left: 6, 
                            backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                            color: '#fff', 
                            fontSize: '0.55rem', 
                            fontWeight: 'bold', 
                            padding: '1px 4px', 
                            borderRadius: 3 
                          }}>
                            {item.type.toUpperCase()}
                          </div>

                          {/* Action Overlay Panel */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            background: 'rgba(0,0,0,0.35)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: 6,
                            cursor: 'default'
                          }}>
                            {/* Delete button (Top Right) */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button 
                                type="button" 
                                onClick={() => removeMediaItem(item)} 
                                style={{ 
                                  backgroundColor: 'rgba(220, 20, 60, 0.95)', 
                                  color: '#fff', 
                                  border: 'none', 
                                  borderRadius: '50%', 
                                  width: 22, 
                                  height: 22, 
                                  display: 'flex', 
                                  justifyContent: 'center', 
                                  alignItems: 'center', 
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                  padding: 0
                                }}
                              >
                                <X size={12} />
                              </button>
                            </div>

                            {/* Ordering Buttons (Bottom Row) */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 4 }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveMediaItem(idx, 'left')}
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  color: '#333',
                                  border: 'none',
                                  borderRadius: 4,
                                  flex: 1,
                                  height: 22,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                  opacity: idx === 0 ? 0.4 : 1,
                                  padding: 0
                                }}
                              >
                                <ArrowLeft size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === mediaItems.length - 1}
                                onClick={() => moveMediaItem(idx, 'right')}
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  color: '#333',
                                  border: 'none',
                                  borderRadius: 4,
                                  flex: 1,
                                  height: 22,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  cursor: idx === mediaItems.length - 1 ? 'not-allowed' : 'pointer',
                                  opacity: idx === mediaItems.length - 1 ? 0.4 : 1,
                                  padding: 0
                                }}
                              >
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <input type="file" accept="image/*,video/*" multiple className="form-input" style={{ padding: '8px' }} onChange={handleFileChange} />
                <small style={{ color: 'var(--text-light)', marginTop: 4, display: 'block', fontSize: '0.8rem' }}>Upload high-resolution images, animated GIFs, or videos (MP4, WebM, etc.). You can arrange their order using the arrows.</small>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                <button className="btn btn-ghost" type="button" onClick={closeForm}>Cancel</button>
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
              <tr><th>Image/Video</th><th>Name</th><th>Price</th><th>Offer</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : filtered.map(p => {
                const isVideo = p.image_url?.match(/\.(mp4|mov|avi|webm)$/i);
                return (
                  <tr key={p.id}>
                    <td>
                      {isVideo ? (
                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <video src={getImageUrl(p.image_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                        </div>
                      ) : (
                        <img src={getImageUrl(p.image_url)} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} onError={e => e.target.src = 'https://via.placeholder.com/48'} />
                      )}
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
