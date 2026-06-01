import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { ENDPOINTS } from '../api/api';
import { useCategories } from '../context/CategoryContext';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import './Explore.css';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async (reset = false) => {
    const pg = reset ? 1 : page;
    if (reset) setPage(1);
    setLoading(true);
    try {
      let url = `${ENDPOINTS.PRODUCTS}?page=${pg}&limit=20`;
      if (selectedCategory) {
        const catName = categories.find(c => c.id === selectedCategory)?.name;
        if (catName) url += `&category=${encodeURIComponent(catName)}`;
      }
      if (searchQ.trim()) url += `&search=${encodeURIComponent(searchQ.trim())}`;
      if (sortBy === 'price_asc') url += '&sort=price&order=asc';
      else if (sortBy === 'price_desc') url += '&sort=price&order=desc';
      else if (sortBy === 'rating') url += '&sort=rating&order=desc';
      else url += '&sort=created_at&order=desc';

      const res = await api.get(url);
      const data = res.data;
      const items = Array.isArray(data) ? data : (data?.products || []);
      if (reset) setProducts(items);
      else setProducts(prev => pg === 1 ? items : [...prev, ...items]);
      setHasMore(items.length === 20);
    } catch { setProducts([]); }
    setLoading(false);
  }, [selectedCategory, searchQ, sortBy, page]);

  useEffect(() => { fetchProducts(true); }, [selectedCategory, sortBy]);
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQ(q);
  }, [searchParams]);
  useEffect(() => { if (searchQ) fetchProducts(true); }, [searchQ]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(true);
    if (searchQ.trim()) setSearchParams({ q: searchQ });
    else setSearchParams({});
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQ('');
    setSortBy('newest');
    setSearchParams({});
    fetchProducts(true);
  };

  const activeFilters = (selectedCategory ? 1 : 0) + (searchQ ? 1 : 0);

  return (
    <div className="explore-page page-fade-in">
      <div className="container">
        {/* Page Header */}
        <div className="explore-header">
          <div>
            <h1>Shop All Products</h1>
            <p className="explore-sub">Discover our complete Ayurvedic collection</p>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="explore-controls">
          <form className="explore-search" onSubmit={handleSearch}>
            <Search size={18} className="explore-search-icon" />
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search products..."
              className="explore-search-input form-input"
            />
            {searchQ && (
              <button type="button" className="explore-clear-btn" onClick={() => { setSearchQ(''); setSearchParams({}); fetchProducts(true); }}>
                <X size={16} />
              </button>
            )}
          </form>

          <div className="explore-filter-row">
            <button
              className={`btn btn-secondary btn-sm ${showFilters ? 'btn-active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
            </button>
            <select
              className="form-input form-select explore-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            {activeFilters > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <X size={14} /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        {showFilters && (
          <div className="explore-category-filter">
            <button
              className={`category-filter-chip ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="explore-count">
            {products.length} product{products.length !== 1 ? 's' : ''}
            {selectedCategory && ` in ${categories.find(c => c.id === selectedCategory)?.name || ''}`}
          </div>
        )}

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <div className="grid-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 340, borderRadius: 14 }} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-32">
                <button
                  className="btn btn-secondary"
                  onClick={() => { setPage(p => p + 1); fetchProducts(); }}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={32} /></div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
