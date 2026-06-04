import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../../api/api';
import { Tag } from 'lucide-react';

const getComboImageUrl = (combo) => {
  const name = (combo.name || combo.title || '').trim().toLowerCase();
  if (name.includes('dandruff')) {
    return '/images/combos/Anti Dandruff Kit.png';
  }
  if (name.includes('baby')) {
    return '/images/combos/Baby Combo.png';
  }
  if (name.includes('hair')) {
    return '/images/combos/Hair Growth Kit.png';
  }
  if (combo.image_url) {
    return getImageUrl(combo.image_url);
  }
  return '/images/logo.png';
};

export default function ComboOffers() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(ENDPOINTS.COMBOS)
      .then(res => setCombos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCombos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content page-fade-in">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary-pale)', color: 'var(--primary)', padding: '6px 14px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, marginBottom: 12 }}>
            <Tag size={14} /> Limited Offers
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Combo Deals</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Save more with our curated Ayurvedic bundles</p>
        </div>

        {loading ? (
          <div className="grid-3">
            {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 14 }} />)}
          </div>
        ) : combos.length === 0 ? (
          <div className="empty-state">
            <h3>No combo offers available</h3>
            <p>Check back soon for great deals!</p>
            <Link to="/explore" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid-3">
            {combos.map(combo => {
              const originalPrice = combo.subtotal || combo.original_price;
              const comboPrice = combo.total || combo.combo_price || combo.price;
              const discountVal = (originalPrice && comboPrice) ? (parseFloat(originalPrice) - parseFloat(comboPrice)) : (combo.discount_amount || combo.discount || 0);

              return (
                <Link key={combo.id} to={`/deals/combo/${combo.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 24, position: 'relative', overflow: 'visible', textDecoration: 'none', minHeight: 320 }}>
                  {parseFloat(discountVal) > 0 && (
                    <div style={{ position: 'absolute', top: -10, right: 16, background: 'var(--danger)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>
                      SAVE ₹{parseFloat(discountVal).toFixed(0)}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--secondary)', marginBottom: 8 }}>Combo Pack</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', marginBottom: 6 }}>{combo.title || combo.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>{combo.description}</p>
                  
                  {/* Single Combo Image */}
                  <div style={{ width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 12, background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={getComboImageUrl(combo)} 
                      alt={combo.title || combo.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={e => { e.target.src = 'https://via.placeholder.com/200?text=Combo+Pack'; }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>₹{parseFloat(comboPrice || 0).toFixed(0)}</span>
                    {originalPrice && parseFloat(originalPrice) > parseFloat(comboPrice || 0) && (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>₹{parseFloat(originalPrice).toFixed(0)}</span>
                    )}
                  </div>
                  <div style={{ marginTop: 12, color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
                    View Details →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
