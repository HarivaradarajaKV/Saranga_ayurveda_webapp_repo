import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../api/api';
import { useCategories, slugify } from '../context/CategoryContext';
import ProductCard from '../components/ProductCard';
import ComboCard from '../components/ComboCard';
import { ArrowLeft } from 'lucide-react';
import './Explore.css';

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCategoryById } = useCategories();
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const category = getCategoryById(id);

  useEffect(() => {
    if (category) {
      const slug = slugify(category.name);
      if (id !== slug) {
        navigate(`/category/${slug}`, { replace: true });
      }
    }
  }, [category, id, navigate]);

  const fetchData = async () => {
    if (!category?.name) return; // Wait until category is loaded
    setLoading(true);
    try {
      const [prodRes, comboRes] = await Promise.all([
        api.get(`${ENDPOINTS.PRODUCTS}?category=${encodeURIComponent(category.name)}&limit=50`),
        api.get(ENDPOINTS.COMBOS)
      ]);
      const prodData = prodRes.data;
      setProducts(Array.isArray(prodData) ? prodData : (prodData?.products || []));
      setCombos(Array.isArray(comboRes.data) ? comboRes.data : []);
    } catch { 
      setProducts([]); 
      setCombos([]); 
    }
    setLoading(false);
  };

  useEffect(() => {
    if (category?.name) {
      fetchData();
      setFilterType('all');
      setSortBy('default');
    }
  }, [category?.name]);

  const getFilteredAndSortedItems = () => {
    if (filterType === 'combos') {
      const categoryProductIds = new Set(products.map(p => p.id));
      let matchedCombos = combos.filter(combo =>
        combo.items?.some(item => categoryProductIds.has(item.product_id))
      );

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
    <div className="page-content page-fade-in category-detail-page">
      <div className="container explore-container">
        <div style={{ marginBottom: 24 }}>
          <Link to="/explore" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} /> Back to Saranga Space
          </Link>
        </div>

        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '8px' }}>
            {category?.displayName || category?.name || 'Category'}
          </h1>
          {category?.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              {category.description}
            </p>
          )}
        </div>

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

        {loading ? (
          <div className="new-arrivals-grid-custom">
            {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 22 }} />)}
          </div>
        ) : displayItems.length > 0 ? (
          <div className="new-arrivals-grid-custom">
            {displayType === 'combos' 
              ? displayItems.map(c => <ComboCard key={c.id} combo={c} />)
              : displayItems.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        ) : (
          <div className="empty-state">
            <h3>No items found matching the selected filter</h3>
            <button className="btn btn-ghost" onClick={() => { setFilterType('all'); setSortBy('default'); }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
