import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api/api';
import ProductCard from '../../components/ProductCard';
import { Zap } from 'lucide-react';

export default function FlashSale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products with high discount (offer_percentage >= 20)
    api.get(`${ENDPOINTS.PRODUCTS}?sort=offer_percentage&order=desc&limit=20`)
      .then(res => {
        const d = res.data;
        const items = Array.isArray(d) ? d : (d?.products || []);
        setProducts(items.filter(p => parseFloat(p.offer_percentage || 0) > 0));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content page-fade-in">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff3e0', color: '#e65100', padding: '6px 14px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, marginBottom: 12 }}>
            <Zap size={14} /> Flash Sale
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Today's Best Deals</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Grab discounted Ayurvedic products — limited time only!</p>
        </div>
        {loading ? (
          <div className="new-arrivals-grid-custom">{Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 22 }} />)}</div>
        ) : products.length > 0 ? (
          <div className="new-arrivals-grid-custom">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
        ) : (
          <div className="empty-state">
            <h3>No flash sale items right now</h3>
            <Link to="/explore" className="btn btn-primary">Shop Regular Products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
