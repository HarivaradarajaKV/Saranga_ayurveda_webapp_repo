import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api/api';
import { Tag } from 'lucide-react';

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
            {combos.map(combo => (
              <Link key={combo.id} to={`/deals/combo/${combo.id}`} className="card" style={{ display: 'block', padding: 24, position: 'relative', overflow: 'visible' }}>
                {(combo.discount_amount || (combo.original_price && combo.combo_price)) && (
                  <div style={{ position: 'absolute', top: -10, right: 16, background: 'var(--danger)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>
                    SAVE ₹{combo.discount_amount || (parseFloat(combo.original_price) - parseFloat(combo.combo_price || combo.price)).toFixed(0)}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--secondary)', marginBottom: 8 }}>Combo Pack</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', marginBottom: 10 }}>{combo.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>{combo.description}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>₹{combo.combo_price || combo.price}</span>
                  {combo.original_price && <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>₹{combo.original_price}</span>}
                </div>
                <div style={{ marginTop: 16, color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem' }}>View Details →</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
