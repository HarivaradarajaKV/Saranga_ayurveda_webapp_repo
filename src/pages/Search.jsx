import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { ENDPOINTS } from '../api/api';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim()) {
      setLoading(true);
      api.get(`${ENDPOINTS.PRODUCTS}?search=${encodeURIComponent(q)}&limit=40`)
        .then(res => {
          const d = res.data;
          let items = Array.isArray(d) ? d : (d?.products || []);
          
          // Strict frontend filter
          const lowerQ = q.toLowerCase();
          items = items.filter(p => {
            const nameLower = (p.name || '').toLowerCase();
            const catNameLower = (p.category_name || '').toLowerCase();
            const catLower = (p.category || '').toLowerCase();
            return nameLower.includes(lowerQ) || catNameLower.includes(lowerQ) || catLower.includes(lowerQ);
          });
          
          setProducts(items);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }
  }, [q]);

  return (
    <div className="page-content page-fade-in">
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 8 }}>Search Results</h1>
        {q && <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Showing results for "<strong>{q}</strong>"</p>}
        {loading ? (
          <div className="new-arrivals-grid-custom">
            {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 22 }} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="new-arrivals-grid-custom">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={28} /></div>
            <h3>No results for "{q}"</h3>
            <p>Try different keywords or browse our categories</p>
            <Link to="/explore" className="btn btn-primary">Browse All Products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
