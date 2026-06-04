import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../../api/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ComboDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(ENDPOINTS.COMBO(id))
      .then(res => setCombo(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-content loading-center"><div className="spinner" /></div>;
  if (!combo) return <div className="page-content container empty-state"><h3>Combo not found</h3><Link to="/deals/combo-offers" className="btn btn-primary">View All Combos</Link></div>;

  const handleAddAll = async () => {
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    setAdding(true);
    const products = combo.products || combo.items || [];
    for (const p of products) {
      await addToCart(p.id || p.product_id, 1);
    }
    setAdding(false);
    toast.success('All combo items added to cart!');
    navigate('/cart');
  };

  const products = combo.products || combo.items || [];
  const originalPrice = combo.subtotal || combo.original_price;
  const comboPrice = combo.total || combo.combo_price || combo.price;
  const savings = (originalPrice && comboPrice) ? (parseFloat(originalPrice) - parseFloat(comboPrice)) : (combo.discount_amount || combo.discount || 0);

  return (
    <div className="page-content page-fade-in">
      <div className="container-sm">
        <Link to="/deals/combo-offers" className="btn btn-ghost btn-sm mb-16"><ArrowLeft size={16} /> Back to Combos</Link>
        <div className="card card-body" style={{ marginBottom: 24 }}>
          {parseFloat(savings) > 0 && (
            <div style={{ background: 'var(--danger)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, padding: '6px 14px', borderRadius: 100, width: 'fit-content', marginBottom: 14 }}>
              SAVE ₹{parseFloat(savings).toFixed(0)} on this combo
            </div>
          )}
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 10 }}>{combo.title || combo.name}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{combo.description}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{parseFloat(comboPrice || 0).toFixed(0)}</span>
            {originalPrice && parseFloat(originalPrice) > parseFloat(comboPrice || 0) && (
              <span style={{ fontSize: '1.1rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>₹{parseFloat(originalPrice).toFixed(0)}</span>
            )}
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleAddAll} disabled={adding}>
            <ShoppingCart size={18} /> {adding ? 'Adding...' : 'Add All to Cart'}
          </button>
        </div>

        {products.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 16 }}>Products in This Combo</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {products.map((p, i) => (
                <div key={p.id || i} className="card card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--surface)' }}>
                    <img src={getImageUrl(p.image_url)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = 'https://via.placeholder.com/72'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{p.name || p.product_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      MRP: ₹{p.price} {p.offer_percentage > 0 && `| ${p.offer_percentage}% off`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
