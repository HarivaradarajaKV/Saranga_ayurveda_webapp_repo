import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { ENDPOINTS } from '../api/api';
import { useCategories } from '../context/CategoryContext';
import ProductCard from '../components/ProductCard';
import { ArrowLeft } from 'lucide-react';

export default function CategoryDetail() {
  const { id } = useParams();
  const { getCategoryById } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = getCategoryById(id);

  const fetchProducts = async () => {
    if (!category?.name) return; // Wait until category is loaded
    setLoading(true);
    try {
      const res = await api.get(`${ENDPOINTS.PRODUCTS}?category=${encodeURIComponent(category.name)}&limit=50`);
      const data = res.data;
      setProducts(Array.isArray(data) ? data : (data?.products || []));
    } catch { setProducts([]); }
    setLoading(false);
  };

  useEffect(() => {
    if (category?.name) fetchProducts();
  }, [category?.name]);

  return (
    <div className="page-content page-fade-in category-detail-page">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link to="/explore" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} /> Back to Saranga Space
          </Link>
        </div>

        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '8px' }}>
            {category?.name || 'Category'}
          </h1>
          {category?.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              {category.description}
            </p>
          )}
        </div>

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
            <h3>No products in this category</h3>
            <Link to="/explore" className="btn btn-primary">Browse All Products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
