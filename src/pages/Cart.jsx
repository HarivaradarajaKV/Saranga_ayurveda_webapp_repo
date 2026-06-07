import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { 
  Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, X, 
  Leaf, Sprout, ShieldCheck, Lock, HelpCircle 
} from 'lucide-react';
import './Cart.css';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, cartSubtotal, loading, selectedItems, setSelectedItems, toggleItemSelection } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const deliveryCharge = cartSubtotal >= 500 ? 0 : 59;
  const total = cartSubtotal - couponDiscount + deliveryCharge;

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await api.get(ENDPOINTS.COUPONS);
      if (res.data) {
        const validCoupons = res.data.filter(c => c.is_active && new Date(c.end_date) > new Date());
        setAvailableCoupons(validCoupons);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
    setLoadingCoupons(false);
  };

  const handleOpenCoupons = () => {
    fetchCoupons();
    setShowCouponsModal(true);
  };

  const applyCoupon = async (coupon) => {
    if (cartSubtotal < coupon.min_purchase_amount) {
      toast.error(`Minimum purchase amount of ₹${coupon.min_purchase_amount.toFixed(2)} required`);
      return;
    }
    setApplyingCoupon(true);
    try {
      const res = await api.post(ENDPOINTS.VALIDATE_COUPON, {
        code: coupon.code,
        order_amount: cartSubtotal
      });
      const disc = res.data?.discount_amount || 0;
      setCouponDiscount(disc);
      setCouponApplied(coupon.code);
      setCouponCode(coupon.code);
      setShowCouponsModal(false);
      toast.success(`Coupon applied! Saved ₹${disc}`);
    } catch {
      toast.error('Invalid or expired coupon');
    }
    setApplyingCoupon(false);
  };

  const handleApplyManualCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await api.post(ENDPOINTS.VALIDATE_COUPON, {
        code: couponCode.trim(),
        order_amount: cartSubtotal
      });
      const disc = res.data?.discount_amount || 0;
      setCouponDiscount(disc);
      setCouponApplied(couponCode);
      toast.success(`Coupon applied! Saved ₹${disc}`);
    } catch {
      toast.error('Invalid or expired coupon');
    }
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setCouponApplied('');
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    if (items.length === 0) { toast.warning('Your cart is empty'); return; }
    navigate('/checkout', { state: { couponCode: couponApplied, couponDiscount, deliveryCharge, subtotal: cartSubtotal, total } });
  };

  if (loading) return (
    <div className="page-content">
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>Loading your cart...</p>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="page-content page-fade-in">
      <div className="container empty-state">
        <div className="empty-state-icon" style={{ width: 80, height: 80 }}>
          <ShoppingBag size={36} />
        </div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/explore" className="btn btn-primary btn-lg">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="page-content page-fade-in cart-page">
      <div className="container relative-container">
        
        {/* Header Leaf Decor */}
        <div className="cart-header-decor">
          <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20 C 120 40, 190 110, 240 170" stroke="#2E5D34" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.3"/>
            <path d="M90 35 C 75 15, 60 20, 80 40 C 100 60, 90 35, 90 35" fill="#2E5D34" opacity="0.15"/>
            <path d="M140 65 C 130 40, 110 50, 130 75 C 150 100, 140 65, 140 65" fill="#2E5D34" opacity="0.2"/>
            <path d="M190 105 C 185 80, 165 90, 180 115 C 195 140, 190 105, 190 105" fill="#2E5D34" opacity="0.25"/>
            <path d="M230 145 C 235 120, 215 130, 225 155 C 235 180, 230 145, 230 145" fill="#2E5D34" opacity="0.2"/>
          </svg>
        </div>

        {/* Title area */}
        <div className="cart-header-section">
          <h1 className="cart-title font-serif-main">
            My Cart <span className="cart-title-count">({items.length})</span>
          </h1>
          <p className="cart-subtitle">Review your items and proceed to checkout</p>
        </div>

        {/* Main Grid */}
        <div className="cart-main-grid">
          
          {/* Left Column: Items and Coupon */}
          <div className="cart-items-column">
            
            {/* Cart Table Headers */}
            <div className="cart-table-header">
              <span className="header-product">PRODUCT</span>
              <span className="header-price">PRICE</span>
              <span className="header-qty">QUANTITY</span>
              <span className="header-total">TOTAL</span>
            </div>

            {/* Cart Rows */}
            <div className="cart-items-list">
              {items.map(item => {
                const price = parseFloat(item.price || 0);
                const offer = parseFloat(item.offer_percentage || 0);
                
                let finalPrice;
                if (item.is_from_combo && item.combo_discounted_price !== undefined) {
                  finalPrice = parseFloat(item.combo_discounted_price);
                } else {
                  finalPrice = price * (1 - offer / 100);
                }
                
                const qty = item.quantity || 1;
                return (
                  <div key={item.id || item.product_id} className="cart-item-card-container">
                    
                    {/* Desktop Item Layout */}
                    <div className="cart-row-item desktop-only-row">
                      {/* Product cell */}
                      <div className="cart-cell-product">
                        <Link to={`/product/${item.product_id || item.id}`} className="cart-product-img-box">
                          <img 
                            src={getImageUrl(item.image_url)} 
                            alt={item.name} 
                            onError={e => { e.target.src = 'https://via.placeholder.com/100'; }} 
                          />
                        </Link>
                        <div className="cart-product-meta">
                          <Link to={`/product/${item.product_id || item.id}`} className="cart-product-name">
                            {item.name}
                          </Link>
                          <span className="cart-product-attr">{item.size || 'Standard Size'}</span>
                          <span className="cart-product-stock">In Stock</span>
                        </div>
                      </div>

                      {/* Price cell */}
                      <div className="cart-cell-price">
                        ₹ {finalPrice.toFixed(2)}
                      </div>

                      {/* Quantity cell */}
                      <div className="cart-cell-qty">
                        <div className="cart-qty-control-wrapper">
                          <button
                            className="cart-qty-adjust-btn"
                            onClick={() => updateQuantity(item.product_id || item.id, qty - 1)}
                            disabled={qty <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="cart-qty-value">{qty}</span>
                          <button
                            className="cart-qty-adjust-btn"
                            onClick={() => updateQuantity(item.product_id || item.id, qty + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          className="cart-delete-item-btn"
                          onClick={() => { removeFromCart(item.product_id || item.id); toast.success('Item removed'); }}
                          title="Remove product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Total cell */}
                      <div className="cart-cell-total">
                        ₹ {(finalPrice * qty).toFixed(2)}
                      </div>
                    </div>

                    {/* Mobile Item Layout */}
                    <div className="cart-row-item-mobile mobile-only-row">
                      <Link to={`/product/${item.product_id || item.id}`} className="cart-mobile-img-box">
                        <img 
                          src={getImageUrl(item.image_url)} 
                          alt={item.name} 
                          onError={e => { e.target.src = 'https://via.placeholder.com/100'; }} 
                        />
                      </Link>
                      
                      <div className="cart-mobile-details-box">
                        <div className="cart-mobile-meta-header">
                          <Link to={`/product/${item.product_id || item.id}`} className="cart-mobile-name">
                            {item.name}
                          </Link>
                          <span className="cart-mobile-unit-price">
                            ₹ {finalPrice.toFixed(2)}
                          </span>
                        </div>

                        <div className="cart-mobile-meta-middle">
                          <span className="cart-mobile-attr">{item.size || 'Standard Size'}</span>
                          <div className="cart-mobile-qty-delete-group">
                            <div className="cart-qty-control-wrapper">
                              <button
                                className="cart-qty-adjust-btn"
                                onClick={() => updateQuantity(item.product_id || item.id, qty - 1)}
                                disabled={qty <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="cart-qty-value">{qty}</span>
                              <button
                                className="cart-qty-adjust-btn"
                                onClick={() => updateQuantity(item.product_id || item.id, qty + 1)}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              className="cart-delete-item-btn"
                              onClick={() => { removeFromCart(item.product_id || item.id); toast.success('Item removed'); }}
                              title="Remove product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="cart-mobile-meta-footer">
                          <span className="cart-mobile-price-green">
                            ₹ {(finalPrice * qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Coupon Promo Block */}
            <div className="cart-coupon-promo-box">
              <div className="coupon-promo-left">
                <div className="coupon-icon-circle">
                  <Tag size={20} className="coupon-promo-tag-icon" />
                </div>
                <div className="coupon-promo-text">
                  <h4>Have a coupon code?</h4>
                  <p>Apply code to get instant discount</p>
                </div>
              </div>
              <div className="coupon-promo-right">
                {couponApplied ? (
                  <div className="coupon-applied-status">
                    <span className="coupon-applied-tag">"{couponApplied}" Applied</span>
                    <button className="coupon-remove-text-btn" onClick={handleRemoveCoupon}>Remove</button>
                  </div>
                ) : (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      className="coupon-promo-input"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button 
                      className="coupon-apply-action-btn"
                      onClick={handleApplyManualCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* View Coupons Modal Trigger */}
            {!couponApplied && (
              <button className="cart-view-available-coupons-btn" onClick={handleOpenCoupons}>
                Or view available coupons
              </button>
            )}

            {/* Special Note */}
            <div className="cart-special-note">
              <span className="special-note-dash">-</span> This order has been specially made for you
            </div>

          </div>

          {/* Right Column: Order Summary and Trust Badges */}
          <div className="cart-summary-column">
            
            {/* Order Summary */}
            <div className="cart-order-summary-card">
              <h3 className="summary-card-title">Order Summary</h3>
              
              <div className="summary-card-row">
                <span>Subtotal ({items.length} items)</span>
                <span>₹ {cartSubtotal.toFixed(2)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="summary-card-row discount-row">
                  <span>Coupon Discount</span>
                  <span>- ₹ {couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-card-row">
                <span className="shipping-info-label">
                  Shipping 
                  <span className="shipping-info-pop" title="Free delivery on orders over ₹500">
                    <HelpCircle size={14} />
                  </span>
                </span>
                <span className={deliveryCharge === 0 ? 'shipping-free-label' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : `₹ ${deliveryCharge.toFixed(2)}`}
                </span>
              </div>

              <div className="summary-card-divider"></div>

              <div className="summary-card-total-block">
                <div className="total-label-box">
                  <span className="total-label">Total</span>
                  <span className="total-subtext">(Inclusive of all taxes)</span>
                </div>
                <span className="total-amount-val">₹ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="cart-trust-badges-card">
              <div className="trust-badge-row">
                <div className="trust-badge-icon-box">
                  <Leaf size={18} />
                </div>
                <div className="trust-badge-desc-box">
                  <h5>100% Natural & Safe</h5>
                  <p>Crafted with authentic Ayurvedic ingredients</p>
                </div>
              </div>
              <div className="trust-badge-row">
                <div className="trust-badge-icon-box">
                  <Sprout size={18} />
                </div>
                <div className="trust-badge-desc-box">
                  <h5>Ayurvedic & Authentic</h5>
                  <p>Backed by ancient wisdom, made for modern life</p>
                </div>
              </div>
              <div className="trust-badge-row">
                <div className="trust-badge-icon-box">
                  <ShieldCheck size={18} />
                </div>
                <div className="trust-badge-desc-box">
                  <h5>Secure Payments</h5>
                  <p>Your transactions are safe and protected</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Centered Checkout Button */}
        <div className="cart-bottom-checkout-bar">
          <button className="cart-checkout-proceed-btn" onClick={handleCheckout}>
            Proceed to Checkout
            <ArrowRight size={18} style={{ marginLeft: '10px' }} />
          </button>
          <div className="cart-secure-label">
            <Lock size={14} style={{ marginRight: '6px' }} />
            <span>Secure Checkout</span>
          </div>
        </div>

      </div>

      {/* Available Coupons Modal */}
      {showCouponsModal && (
        <div className="modal-backdrop" onClick={() => setShowCouponsModal(false)}>
          <div className="modal-content coupons-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Available Coupons</h3>
              <button className="btn-icon" onClick={() => setShowCouponsModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {loadingCoupons ? (
                <div className="loading-center"><div className="spinner" /></div>
              ) : availableCoupons.length === 0 ? (
                <div className="empty-state">
                  <p>No coupons available at the moment.</p>
                </div>
              ) : (
                <div className="coupons-list">
                  {availableCoupons.map(coupon => (
                    <div key={coupon.id} className="coupon-card">
                      <div className="coupon-card-header">
                        <div className="coupon-code-badge">{coupon.code}</div>
                        <div className="coupon-discount-text">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                        </div>
                      </div>
                      <p className="coupon-desc">{coupon.description}</p>
                      <p className="coupon-min">Min. purchase: ₹{coupon.min_purchase_amount}</p>
                      {coupon.max_discount_amount && <p className="coupon-max">Max discount: ₹{coupon.max_discount_amount}</p>}
                      <button 
                        className="btn btn-outline btn-sm btn-block mt-8" 
                        onClick={() => applyCoupon(coupon)}
                        disabled={applyingCoupon || cartSubtotal < coupon.min_purchase_amount}
                      >
                        {cartSubtotal < coupon.min_purchase_amount ? 'Add more items to apply' : 'Apply Coupon'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
