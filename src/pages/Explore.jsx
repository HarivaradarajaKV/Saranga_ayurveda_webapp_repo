import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useCategories } from '../context/CategoryContext';
import ProductCard from '../components/ProductCard';
import { Search, X, Leaf } from 'lucide-react';
import './Explore.css';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState(searchParams.get('q') || '');
  const [debouncedSearchQ, setDebouncedSearchQ] = useState(searchQ);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (reset = false, overrideQuery = null) => {
    const query = (overrideQuery !== null ? overrideQuery : searchQ).trim();
    if (!query) {
      setProducts([]);
      return;
    }

    const pg = reset ? 1 : page;
    if (reset) setPage(1);
    setLoading(true);

    try {
      const url = `${ENDPOINTS.PRODUCTS}?page=${pg}&limit=20&search=${encodeURIComponent(query)}`;
      const res = await api.get(url);
      const data = res.data;
      let items = Array.isArray(data) ? data : (data?.products || []);
      
      // Strict frontend filter: match against name, category, or category_name only
      const lowerQ = query.toLowerCase();
      items = items.filter(p => {
        const nameLower = (p.name || '').toLowerCase();
        const catNameLower = (p.category_name || '').toLowerCase();
        const catLower = (p.category || '').toLowerCase();
        return nameLower.includes(lowerQ) || catNameLower.includes(lowerQ) || catLower.includes(lowerQ);
      });
      
      if (reset) setProducts(items);
      else setProducts(prev => pg === 1 ? items : [...prev, ...items]);
      setHasMore(items.length === 20);
    } catch (err) {
      console.error('Error searching products:', err);
      setProducts([]);
    }
    setLoading(false);
  }, [searchQ, page]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQ(q);
    setDebouncedSearchQ(q);
  }, [searchParams]);

  // Debounce search query as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQ(searchQ);
    }, 400); // 400ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQ]);

  // Trigger search on debounced query changes
  useEffect(() => {
    const query = debouncedSearchQ.trim();
    if (query.length >= 3) {
      fetchProducts(true, query);
    } else if (query.length === 0) {
      setProducts([]);
    }
  }, [debouncedSearchQ, fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQ.trim();
    if (query) {
      setSearchParams({ q: query });
      setDebouncedSearchQ(query);
      fetchProducts(true, query);
    } else {
      setSearchParams({});
      setProducts([]);
    }
  };

  const handleClear = () => {
    setSearchQ('');
    setSearchParams({});
    setProducts([]);
  };

  return (
    <div className="explore-page page-fade-in">
      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Page Header */}
        <div className="explore-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '8px' }}>Saranga Space</h1>
            <p className="explore-sub" style={{ color: 'var(--text-muted)' }}>Discover our complete Ayurvedic collection</p>
          </div>
        </div>

        {/* 12 Circular Category Icons Card (Homepage design) */}
        <div className="categories-overlay-card">
          {categories.length > 0 && (
            <div className="categories-overlay-grid">
              {categories.map((cat) => (
                <Link
                  to={`/category/${cat.id}`}
                  key={cat.id}
                  className="category-overlay-item"
                  title={`View ${cat.name} products`}
                >
                  <div className="category-overlay-img-wrap">
                    {cat.image_url ? (
                      <img src={getImageUrl(cat.image_url)} alt={cat.name} className="category-overlay-img" />
                    ) : (
                      <div className="category-overlay-fallback">
                        <Leaf size={36} />
                      </div>
                    )}
                  </div>
                  <span className="category-overlay-name">{cat.name.toUpperCase()}</span>
                </Link>
              ))}
            </div>
          )}


        </div>

        {/* Google-like Search Bar Container */}
        <div className="explore-google-search-container">
          <form className="explore-google-search-form" onSubmit={handleSearchSubmit}>
            <Search size={20} className="google-search-icon" />
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search for luxury Ayurvedic care..."
              className="google-search-input"
            />
            {searchQ && (
              <button 
                type="button" 
                className="google-clear-btn" 
                onClick={handleClear}
                title="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </form>
        </div>

        {/* Search Results Display Section */}
        {searchQ.trim() && (
          <div className="search-results-section" style={{ marginTop: '20px' }}>
            <h2 className="section-title-flat" style={{ fontSize: '1.5rem', marginBottom: '24px', textAlign: 'center' }}>
              Search Results for "{searchQ}"
            </h2>

            {loading && products.length === 0 ? (
              <div className="new-arrivals-grid-custom">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 300, borderRadius: 22 }} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="new-arrivals-grid-custom">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                {hasMore && (
                  <div className="text-center mt-32">
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setPage(p => p + 1); fetchProducts(); }}
                      disabled={loading}
                    >
                      {loading ? 'Searching...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon"><Search size={32} /></div>
                <h3>No products found</h3>
                <p>We couldn't find any products matching "{searchQ}". Try another query.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
