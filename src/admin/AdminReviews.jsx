import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Star, Trash2, Check, X } from 'lucide-react';

export default function AdminReviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(ENDPOINTS.ADMIN_REVIEWS)
      .then(res => { const d = res.data; setReviews(Array.isArray(d) ? d : (d?.reviews || [])); })
      .catch(() => setReviews([])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(ENDPOINTS.ADMIN_REVIEW(id));
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Reviews</h1>
      </div>
      <div className="admin-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Product</th><th>User</th><th>Rating</th><th>Review</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
                : reviews.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>No reviews yet</td></tr>
                : reviews.map(r => (
                  <tr key={r.id}>
                    <td>{r.product_name || `Product #${r.product_id}`}</td>
                    <td>{r.user_name || r.email || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array(5).fill(0).map((_, i) => <Star key={i} size={12} fill={i < (r.rating || 0) ? 'var(--accent)' : 'none'} stroke={i < (r.rating || 0) ? 'none' : 'var(--border)'} />)}
                      </div>
                    </td>
                    <td style={{ maxWidth: 250 }}>{r.review || r.comment}</td>
                    <td>{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}><Trash2 size={13} /></button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
