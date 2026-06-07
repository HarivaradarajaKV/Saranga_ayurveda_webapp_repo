import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getDisplayCategoryName } from '../context/CategoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import {
  Heart, ShoppingCart, Star, ArrowLeft, Plus, Minus,
  Package, Shield, Truck, ChevronDown, ChevronUp, Trash2,
  Leaf, Rabbit, Sprout, ShieldCheck, Share2
} from 'lucide-react';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  const cartItem = cartItems?.find(i => (i.product_id || i.id) === parseInt(id));
  const cartQty = cartItem ? cartItem.quantity : 0;
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const [openFaq, setOpenFaq] = useState(null);
  const [accordions, setAccordions] = useState({
    details: true,
    howToUse: false,
    ingredients: false,
    delivery: false
  });

  const toggleAccordion = (sec) => {
    setAccordions(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.benefits || product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handlePrevImage = () => {
    if (images.length > 0) {
      setActiveImage(prev => (prev - 1 + images.length) % images.length);
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setActiveImage(prev => (prev + 1) % images.length);
    }
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

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await api.delete(`${ENDPOINTS.PRODUCT_REVIEWS(id)}/${reviewId}`);
      toast.success('Review deleted!');
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
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

  const faqs = [
    {
      q: "What skin types are your products suitable for?",
      a: "Our products are formulated to be gentle and suitable for all skin types, including sensitive skin. However, we recommend doing a patch test before first use."
    },
    {
      q: "Are your products cruelty-free and vegan?",
      a: "Yes, all Saranga Ayurveda products are 100% cruelty-free and vegan. We never test on animals."
    },
    {
      q: "How do I use this product for the best results?",
      a: "For best results, apply the product consistently as directed on the label, preferably after cleansing."
    },
    {
      q: "What ingredients are in this product?",
      a: "We use high-quality organic ingredients, herbal extracts, and traditional Ayurvedic formulations free from harmful chemicals."
    },
    {
      q: "Can I use this product if I have sensitive skin?",
      a: "Yes! Our formulations are extremely mild. Please consult the ingredient list if you have known specific allergies."
    }
  ];

  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [getImageUrl(product.image_url)],
    "description": product.description || `Buy ${product.name} online at Saranga Ayurveda. Premium quality Ayurvedic beauty and wellness product.`,
    "sku": `SA-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Saranga Ayurveda"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": discountedPrice,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  } : null;

  return (
    <div className="page-content page-fade-in product-detail-page">
      <SEO 
        title={product.name}
        description={product.description || `Buy ${product.name} online. Authentic Ayurvedic formulation for beauty and wellness by Saranga Ayurveda.`}
        ogImage={getImageUrl(product.image_url)}
        canonicalPath={`/product/${product.id}`}
        schema={productSchema}
      />
      <div className="container">
        <Link to="/explore" className="btn btn-ghost btn-sm mb-24 pdp-back-link">
          <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Shop
        </Link>

        <div className="product-detail-grid">
          {/* Left Column: Images & Bottom Features */}
          <div className="pdp-left-col">
            <div className="product-main-image">
              <img
                src={imageErrors[activeImage] ? 'https://via.placeholder.com/600x600?text=No+Image' : getImageUrl(images[activeImage] || product.image_url)}
                alt={product.name}
                onError={() => setImageErrors(prev => ({ ...prev, [activeImage]: true }))}
              />
              {product.offer_percentage > 0 && (
                <div className="product-image-badge">-{Math.round(product.offer_percentage)}%</div>
              )}
              {/* Desktop Wishlist Button */}
              <button
                className={`pdp-wishlist-float ${inWishlist ? 'active' : ''}`}
                onClick={handleWishlist}
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Mobile Pagination Dots */}
            {images.length > 1 && (
              <div className="pdp-pagination-dots">
                {images.map((_, i) => (
                  <span 
                    key={i} 
                    className={`pdp-dot ${activeImage === i ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>
            )}

            {/* Desktop Thumbnails */}
            {images.length > 1 && (
              <div className="pdp-thumbnails-wrapper">
                <button 
                  className="pdp-nav-btn prev" 
                  onClick={handlePrevImage} 
                  disabled={images.length <= 1}
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="pdp-thumbnails-list">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`pdp-thumb-item ${activeImage === i ? 'active' : ''}`}
                      onClick={() => setActiveImage(i)}
                    >
                      <img src={getImageUrl(img)} alt={`View ${i + 1}`} onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }} />
                    </button>
                  ))}
                </div>
                <button 
                  className="pdp-nav-btn next" 
                  onClick={handleNextImage} 
                  disabled={images.length <= 1}
                >
                  <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                </button>
              </div>
            )}

            {/* Subtle Horizontal Features Row (Desktop Only) */}
            <div className="pdp-features-row">
              <div className="pdp-feature-col">
                <Leaf size={20} className="pdp-feature-icon" strokeWidth={1.5} />
                <h6>Natural Formula</h6>
                <p>Crafted with pure, skin-loving ingredients for ultimate care.</p>
              </div>
              <div className="pdp-feature-col">
                <Rabbit size={20} className="pdp-feature-icon" strokeWidth={1.5} />
                <h6>Cruelty-Free</h6>
                <p>Never tested on animals, guaranteed ethical.</p>
              </div>
              <div className="pdp-feature-col">
                <ShieldCheck size={20} className="pdp-feature-icon" strokeWidth={1.5} />
                <h6>Expert Approved</h6>
                <p>Carefully tested to ensure safety and visible results.</p>
              </div>
              <div className="pdp-feature-col">
                <Truck size={20} className="pdp-feature-icon" strokeWidth={1.5} />
                <h6>Free Shipping</h6>
                <p>Delivered to your doorstep with no extra costs.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Details Accordions */}
          <div className="pdp-right-col">
            {/* Meta Row: Pricing & Mobile Actions */}
            <div className="pdp-meta-row">
              <div className="pdp-price-row">
                <span className="pdp-discounted-price">₹{discountedPrice.toFixed(2)}</span>
                {product.offer_percentage > 0 && (
                  <span className="pdp-original-price">₹{parseFloat(product.price).toFixed(2)}</span>
                )}
              </div>
              <div className="pdp-action-icons">
                <button className="pdp-action-btn share-btn" onClick={handleShare} title="Share product">
                  <Share2 size={20} />
                </button>
                <button 
                  className={`pdp-action-btn wishlist-btn ${inWishlist ? 'active' : ''}`} 
                  onClick={handleWishlist}
                  title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="pdp-title font-serif-main">{product.name}</h1>
            
            {/* Short Subtitle */}
            <p className="pdp-subtitle">
              {product.benefits || `Nourishing Ayurvedic formulation enriched with calming botanicals and oils for soft, radiant skin.`}
            </p>

            {/* Size Selector */}
            {product.size && (
              <div className="pdp-size-section">
                <span className="pdp-size-label">Size</span>
                <div className="pdp-size-pills">
                  <button className="pdp-size-pill">{product.size}</button>
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart Row */}
            <div className="pdp-qty-add-row">
              <div className="pdp-qty-control">
                <button 
                  className="pdp-qty-btn" 
                  onClick={() => {
                    if (cartQty > 0) {
                      updateQuantity(product.id, cartQty - 1);
                    } else {
                      setQuantity(q => Math.max(1, q - 1));
                    }
                  }}
                >
                  <Minus size={16} />
                </button>
                <span className="pdp-qty-val">{cartQty > 0 ? cartQty : quantity}</span>
                <button 
                  className="pdp-qty-btn" 
                  onClick={() => {
                    if (cartQty > 0) {
                      updateQuantity(product.id, cartQty + 1);
                    } else {
                      setQuantity(q => Math.min(product.stock_quantity || 99, q + 1));
                    }
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {cartQty > 0 ? (
                <Link
                  to="/cart"
                  className="pdp-add-to-cart-btn pdp-added-link"
                >
                  <ShoppingCart size={18} />
                  Go to Cart ({cartQty} added)
                </Link>
              ) : (
                <button
                  className="pdp-add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={adding || !product.stock_quantity}
                >
                  <ShoppingCart size={18} />
                  {adding ? 'Adding...' : !product.stock_quantity ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>

            {/* Buy Now Button */}
            <button 
              className="pdp-buy-now-btn"
              onClick={async () => {
                if (!isAuthenticated) { navigate('/auth/login'); return; }
                if (cartQty === 0) {
                  await addToCart(product.id, quantity);
                }
                navigate('/cart');
              }}
              disabled={!product.stock_quantity}
            >
              Buy Now
            </button>

            {/* Row of 4 Badges */}
            <div className="pdp-badges-row">
              <div className="pdp-badge-item">
                <Leaf size={18} className="pdp-badge-icon" strokeWidth={1.5} />
                <span>100% Natural</span>
              </div>
              <div className="pdp-badge-item">
                <Rabbit size={18} className="pdp-badge-icon" strokeWidth={1.5} />
                <span>Cruelty Free</span>
              </div>
              <div className="pdp-badge-item">
                <Sprout size={18} className="pdp-badge-icon" strokeWidth={1.5} />
                <span>Eco Friendly</span>
              </div>
              <div className="pdp-badge-item">
                <ShieldCheck size={18} className="pdp-badge-icon" strokeWidth={1.5} />
                <span>Expert Approved</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="pdp-accordions">
              {/* Details Accordion */}
              {product.description && (
                <div className="pdp-accordion-item">
                  <button className="pdp-accordion-header" onClick={() => toggleAccordion('details')}>
                    <span>Details</span>
                    {accordions.details ? <Minus size={16} /> : <Plus size={16} />}
                  </button>
                  {accordions.details && (
                    <div className="pdp-accordion-content">
                      <p>{product.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* How to Use Accordion */}
              <div className="pdp-accordion-item">
                <button className="pdp-accordion-header" onClick={() => toggleAccordion('howToUse')}>
                  <span>How to Use</span>
                  {accordions.howToUse ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                {accordions.howToUse && (
                  <div className="pdp-accordion-content">
                    <p>
                      {product.usage_instructions ? String(product.usage_instructions)
                        .split('\n')
                        .map(inst => inst.replace(/^\s*(?:step\s*\d+\s*[:.-]?\s*|\d+\s*[:.-]\s*)/i, '').trim())
                        .filter(Boolean)
                        .join(' ') : "Apply a generous amount of product gently over cleansed skin. Massage in soft upward circular motions until fully absorbed. Use daily for best results."}
                    </p>
                  </div>
                )}
              </div>

              {/* Ingredients Accordion */}
              <div className="pdp-accordion-item">
                <button className="pdp-accordion-header" onClick={() => toggleAccordion('ingredients')}>
                  <span>Ingredients</span>
                  {accordions.ingredients ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                {accordions.ingredients && (
                  <div className="pdp-accordion-content">
                    <p>{product.ingredients || "Formulated with pure organic Ayurvedic extracts, cold-pressed botanical carrier oils, essential oils, and clean plant-derived emulsifiers. Free from parabens, sulfates, and mineral oils."}</p>
                  </div>
                )}
              </div>

              {/* Delivery & Returns Accordion */}
              <div className="pdp-accordion-item">
                <button className="pdp-accordion-header" onClick={() => toggleAccordion('delivery')}>
                  <span>Delivery & Returns</span>
                  {accordions.delivery ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                {accordions.delivery && (
                  <div className="pdp-accordion-content">
                    <p>We deliver across India with premium courier partners. Standard shipping takes 3-5 business days. We offer free replacements/returns within 7 days of delivery for damaged or unused products.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pdp-faq-section">
          <div className="pdp-faq-left">
            <h2 className="pdp-faq-title font-serif-main">FAQ</h2>
            <div className="pdp-faq-divider">
              <Leaf size={18} className="pdp-faq-leaf-icon" />
            </div>
            <p className="pdp-faq-subtitle">Find answers to the most commonly asked questions.</p>
          </div>
          <div className="pdp-faq-right">
            {faqs.map((faq, i) => (
              <div key={i} className={`pdp-faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="pdp-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  {openFaq === i ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                {openFaq === i && (
                  <div className="pdp-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
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
                      <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                        {user && Number(r.user_id) === Number(user.id) && (
                          <button 
                            onClick={() => handleDeleteReview(r.id)} 
                            className="review-delete-btn"
                            title="Delete Review"
                            style={{
                              marginLeft: '12px',
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
