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
          setProducts(Array.isArray(d) ? d : (d?.products || []));
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
          <div className="grid-4">
            {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 14 }} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid-4">
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
