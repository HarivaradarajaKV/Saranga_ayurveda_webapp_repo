import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useCategories, getDisplayCategoryName } from '../context/CategoryContext';
import ProductCard from '../components/ProductCard';
import ComboCard from '../components/ComboCard';
import SEO from '../components/SEO';
import { Search, X, Leaf, Store } from 'lucide-react';
import './Explore.css';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();

  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState(searchParams.get('q') || '');
  const [debouncedSearchQ, setDebouncedSearchQ] = useState(searchQ);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const fetchProducts = useCallback(async (reset = false, overrideQuery = null) => {
    const query = (overrideQuery !== null ? overrideQuery : searchQ).trim();
    if (!query) {
      setProducts([]);
      return;
    }

    const pg = reset ? 1 : page;
    if (reset) setPage(1);
    setLoading(true);

    const isAllProducts = query === 'All Products' || query === 'all_products';

    try {
      const url = isAllProducts
        ? `${ENDPOINTS.PRODUCTS}?page=${pg}&limit=20`
        : `${ENDPOINTS.PRODUCTS}?page=${pg}&limit=20&search=${encodeURIComponent(query)}`;
        
      const [prodRes, comboRes] = await Promise.all([
        api.get(url),
        combos.length === 0 ? api.get(ENDPOINTS.COMBOS) : Promise.resolve(null)
      ]);

      const data = prodRes.data;
      let items = Array.isArray(data) ? data : (data?.products || []);
      
      // Strict frontend filter: match against name, category, or category_name only
      if (!isAllProducts) {
        const lowerQ = query.toLowerCase();
        items = items.filter(p => {
          const nameLower = (p.name || '').toLowerCase();
          const catNameLower = (p.category_name || '').toLowerCase();
          const catLower = (p.category || '').toLowerCase();
          return nameLower.includes(lowerQ) || catNameLower.includes(lowerQ) || catLower.includes(lowerQ);
        });
      }
      
      if (reset) setProducts(items);
      else setProducts(prev => pg === 1 ? items : [...prev, ...items]);
      setHasMore(items.length === 20);

      if (comboRes && comboRes.data) {
        setCombos(Array.isArray(comboRes.data) ? comboRes.data : []);
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setProducts([]);
    }
    setLoading(false);
  }, [searchQ, page, combos.length]);

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
    setFilterType('all');
    setSortBy('default');
  };

  const getFilteredAndSortedItems = () => {
    const query = searchQ.trim().toLowerCase();
    const isAllProducts = query === 'all products' || query === 'all_products';

    if (filterType === 'combos') {
      let matchedCombos = [...combos];
      if (!isAllProducts) {
        matchedCombos = combos.filter(combo => {
          const titleMatch = (combo.title || combo.name || '').toLowerCase().includes(query);
          const descMatch = (combo.description || '').toLowerCase().includes(query);
          const itemMatch = combo.items?.some(item => 
            (item.name || '').toLowerCase().includes(query)
          );
          return titleMatch || descMatch || itemMatch;
        });
      }

      if (sortBy === 'price-asc') {
        matchedCombos.sort((a, b) => (a.total || a.price) - (b.total || b.price));
      } else if (sortBy === 'price-desc') {
        matchedCombos.sort((a, b) => (b.total || b.price) - (a.total || a.price));
      }
      return { type: 'combos', items: matchedCombos };
    }

    let result = [...products];

    if (filterType === 'new_arrivals') {
      result = result.filter(p => p.is_new_arrival);
    } else if (filterType === 'bestseller') {
      result = result.filter(p => p.is_best_seller);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const pA = a.price * (1 - (a.offer_percentage || 0) / 100);
        const pB = b.price * (1 - (b.offer_percentage || 0) / 100);
        return pA - pB;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const pA = a.price * (1 - (a.offer_percentage || 0) / 100);
        const pB = b.price * (1 - (b.offer_percentage || 0) / 100);
        return pB - pA;
      });
    }

    return { type: 'products', items: result };
  };

  const { type: displayType, items: displayItems } = getFilteredAndSortedItems();

  return (
    <div className="explore-page page-fade-in">
      <SEO 
        title="Saranga Space | Complete Ayurvedic Collection"
        description="Explore the complete collection of premium Ayurvedic products at Saranga Space. Find authentic skincare, organic haircare, lip balms, and natural combos."
        keywords="Ayurvedic products online, organic face wash, herbal shampoo, argan oil shampoo, natural skincare combo, baby skin products"
        canonicalPath="/explore"
      />
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
          <div className="categories-overlay-grid">
            {categories.length > 0 && categories.map((cat) => (
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
                <span className="category-overlay-name">{(cat.displayName || cat.name).toUpperCase()}</span>
              </Link>
            ))}
          </div>
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

            {!loading && (products.length > 0 || combos.length > 0) && (
              <div className="filter-sort-controls">
                <div className="filter-group">
                  <button 
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                  >
                    All Products
                  </button>
                  <button 
                    className={`filter-btn ${filterType === 'new_arrivals' ? 'active' : ''}`}
                    onClick={() => setFilterType('new_arrivals')}
                  >
                    New Arrivals
                  </button>
                  <button 
                    className={`filter-btn ${filterType === 'bestseller' ? 'active' : ''}`}
                    onClick={() => setFilterType('bestseller')}
                  >
                    Bestsellers
                  </button>
                  <button 
                    className={`filter-btn ${filterType === 'combos' ? 'active' : ''}`}
                    onClick={() => setFilterType('combos')}
                  >
                    Combo Offers
                  </button>
                </div>

                <div className="sort-group">
                  <label htmlFor="sort-select" className="sort-label">Sort by:</label>
                  <select 
                    id="sort-select" 
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}

            {loading && products.length === 0 ? (
              <div className="new-arrivals-grid-custom">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 300, borderRadius: 22 }} />
                ))}
              </div>
            ) : displayItems.length > 0 ? (
              <>
                <div className="new-arrivals-grid-custom">
                  {displayType === 'combos'
                    ? displayItems.map(c => <ComboCard key={c.id} combo={c} />)
                    : displayItems.map(p => <ProductCard key={p.id} product={p} />)
                  }
                </div>
                {hasMore && filterType !== 'combos' && (
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
                <h3>No items found matching the selected filter</h3>
                <p>We couldn't find any items matching "{searchQ}" with the active filters.</p>
                <button className="btn btn-ghost" onClick={() => { setFilterType('all'); setSortBy('default'); }} style={{ marginTop: '12px' }}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
