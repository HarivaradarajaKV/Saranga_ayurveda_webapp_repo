import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import {
  Heart, ShoppingCart, Star, ArrowLeft, Plus, Minus,
  Package, Shield, Truck, ChevronDown, ChevronUp
} from 'lucide-react';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const images = product ? Array.from(new Set([
    ...(Array.isArray(product.media) ? product.media.map(m => m.url) : []),
    product.image_url,
    product.image_url2,
    product.image_url3,
    product.image_url4
  ].filter(Boolean))) : [];

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImage(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length, activeImage]);

  useEffect(() => {
    if (id) { fetchProduct(); fetchReviews(); }
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.PRODUCT(id));
      setProduct(res.data);
      // Fetch related
      if (res.data?.category_id) {
        const relRes = await api.get(`${ENDPOINTS.PRODUCTS}?category_id=${res.data.category_id}&limit=5`);
        const relData = Array.isArray(relRes.data) ? relRes.data : (relRes.data?.products || []);
        setRelated(relData.filter(p => p.id !== parseInt(id)).slice(0, 4));
      }
    } catch { toast.error('Failed to load product'); }
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(ENDPOINTS.PRODUCT_REVIEWS(id));
      const data = Array.isArray(res.data) ? res.data : (res.data?.reviews || []);
      setReviews(data);
    } catch { setReviews([]); }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    if (!product?.stock_quantity) { toast.warning('Out of stock'); return; }
    setAdding(true);
    const result = await addToCart(product.id, quantity);
    setAdding(false);
    if (result?.success !== false) toast.success(`${product.name} added to cart!`);
    else toast.error(result?.error || 'Failed to add to cart');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    await toggleWishlist(product.id);
    toast.success(isInWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    setSubmittingReview(true);
    try {
      await api.post(ENDPOINTS.PRODUCT_REVIEWS(id), { rating: reviewRating, review: reviewText });
      toast.success('Review submitted!');
      setReviewText(''); setReviewRating(5);
      fetchReviews();
    } catch { toast.error('Failed to submit review'); }
    setSubmittingReview(false);
  };

  if (loading) return (
    <div className="page-content page-fade-in">
      <div className="container">
        <div className="product-detail-skeleton">
          <div className="skeleton" style={{ height: 500, borderRadius: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 28, borderRadius: 8 }} />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="page-content page-fade-in">
      <div className="container empty-state">
        <h3>Product not found</h3>
        <Link to="/explore" className="btn btn-primary">Browse Products</Link>
      </div>
    </div>
  );

  const discountedPrice = product.price * (1 - (product.offer_percentage || 0) / 100);
  const inWishlist = isInWishlist(product.id);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : product.rating || 0;

  return (
    <div className="page-content page-fade-in product-detail-page">
      <div className="container">
        <Link to={-1} className="btn btn-ghost btn-sm mb-16">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="product-main-image">
              <img
                src={imageErrors[activeImage] ? 'https://via.placeholder.com/500x500?text=No+Image' : getImageUrl(images[activeImage] || product.image_url)}
                alt={product.name}
                onError={() => setImageErrors(prev => ({ ...prev, [activeImage]: true }))}
              />
              {product.offer_percentage > 0 && (
                <div className="product-image-badge">{Math.round(product.offer_percentage)}% OFF</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-thumb ${activeImage === i ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={getImageUrl(img)} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <div className="product-category-tag">{product.category_name || product.category}</div>
            <h1 className="product-name">{product.name}</h1>

            {/* Rating */}
            <div className="product-rating-row">
              <div className="stars">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(avgRating) ? 'var(--accent)' : 'none'} stroke={i < Math.round(avgRating) ? 'none' : 'var(--border)'} />
                ))}
              </div>
              <span className="product-rating-val">{avgRating}</span>
              <span className="product-review-count">({reviews.length} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="product-pricing">
              <span className="product-price">₹{discountedPrice.toFixed(0)}</span>
              {product.offer_percentage > 0 && (
                <>
                  <span className="product-original">₹{parseFloat(product.price).toFixed(0)}</span>
                  <span className="product-savings">Save {Math.round(product.offer_percentage)}%</span>
                </>
              )}
            </div>
            <p className="product-gst-note">* Price includes GST</p>

            {/* Stock */}
            <div className={`product-stock ${product.stock_quantity > 0 ? 'in-stock' : 'out-stock'}`}>
              <Package size={14} />
              {product.stock_quantity > 0
                ? product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left!` : 'In Stock'
                : 'Out of Stock'
              }
            </div>

            {/* Size */}
            {product.size && (
              <div className="product-attr">
                <span className="product-attr-label">Size:</span>
                <span>{product.size}</span>
              </div>
            )}

            {/* Quantity */}
            <div className="product-qty-row">
              <span className="product-attr-label">Quantity:</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus size={16} />
                </button>
                <span className="qty-val">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock_quantity || 99, q + 1))}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="product-cta">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={adding || !product.stock_quantity}
                style={{ flex: 1 }}
              >
                <ShoppingCart size={18} />
                {adding ? 'Adding...' : !product.stock_quantity ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                className={`product-wishlist-btn ${inWishlist ? 'active' : ''}`}
                onClick={handleWishlist}
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="product-trust">
              <div className="trust-item"><Shield size={14} /> Authentic Product</div>
              <div className="trust-item"><Truck size={14} /> Free delivery on ₹500+</div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="product-desc-section">
                <button
                  className="product-desc-toggle"
                  onClick={() => setDescExpanded(!descExpanded)}
                >
                  Description {descExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {descExpanded && <p className="product-desc">{product.description}</p>}
              </div>
            )}

            {/* Extra Details */}
            {(product.benefits || product.ingredients || product.usage_instructions) && (
              <div className="product-extras">
                {product.benefits && (
                  <div className="product-extra-item">
                    <strong>Benefits</strong>
                    <p>{product.benefits}</p>
                  </div>
                )}
                {product.ingredients && (
                  <div className="product-extra-item">
                    <strong>Ingredients</strong>
                    <p>{product.ingredients}</p>
                  </div>
                )}
                {product.usage_instructions && (
                  <div className="product-extra-item">
                    <strong>How to Use</strong>
                    <p>
                      {String(product.usage_instructions)
                        .split('\n')
                        .map(inst => inst.replace(/^\s*(?:step\s*\d+\s*[:.-]?\s*|\d+\s*[:.-]\s*)/i, '').trim())
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="product-reviews-section">
          <h2 className="section-title">Customer Reviews</h2>

          {/* Submit Review */}
          {isAuthenticated && (
            <form className="review-form" onSubmit={submitReview}>
              <h3>Write a Review</h3>
              <div className="review-stars-input">
                {Array(5).fill(0).map((_, i) => (
                  <button key={i} type="button" onClick={() => setReviewRating(i + 1)}>
                    <Star size={24} fill={i < reviewRating ? 'var(--accent)' : 'none'} stroke={i < reviewRating ? 'none' : 'var(--border)'} />
                  </button>
                ))}
              </div>
              <textarea
                className="form-input review-textarea"
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                required
              />
              <button className="btn btn-primary" type="submit" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((r, i) => (
                <div key={r.id || i} className="review-card">
                  <div className="review-card-header">
                    <div className="review-avatar">
                      {(r.user_name || r.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="review-name">{r.user_name || r.name || 'Customer'}</div>
                      <div className="stars">
                        {Array(5).fill(0).map((_, s) => (
                          <Star key={s} size={12} fill={s < (r.rating || 5) ? 'var(--accent)' : 'none'} stroke="none" />
                        ))}
                      </div>
                    </div>
                    {r.created_at && (
                      <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-light)' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <p className="review-comment">"{r.review || r.comment || ''}"</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-light)', padding: '20px 0' }}>No reviews yet. Be the first!</p>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="related-products">
            <div className="section-header">
              <h2 className="section-title">You May Also Like</h2>
              <Link to={`/category/${product.category_id}`} className="see-all">View All</Link>
            </div>
            <div className="new-arrivals-grid-custom">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
