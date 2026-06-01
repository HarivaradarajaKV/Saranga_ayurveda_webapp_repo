import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { ENDPOINTS, getImageUrl } from '../api/api';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, X } from 'lucide-react';
import './Cart.css';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, cartSubtotal, loading } = useCart();
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
  const [pincode, setPincode] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(null);

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

  const checkDelivery = () => {
    if (pincode.length !== 6) { toast.warning('Enter a valid 6-digit pincode'); return; }
    const days = (pincode >= '560001' && pincode <= '560100') ? 3 : 6;
    setDeliveryDays(days);
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
      <div className="container">
        <h1 className="cart-title">My Cart <span className="cart-count">({items.length} items)</span></h1>
        <div className="cart-grid">
          {/* Items */}
          <div className="cart-items-col">
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
                <div key={item.id || item.product_id} className="cart-item-card">
                  <Link to={`/product/${item.product_id || item.id}`} className="cart-item-img">
                    <img src={getImageUrl(item.image_url)} alt={item.name} onError={e => { e.target.src = 'https://via.placeholder.com/100'; }} />
                    {item.is_from_combo ? (
                      <span className="cart-item-badge" style={{background: '#8e24aa'}}>Combo</span>
                    ) : (
                      offer > 0 && <span className="cart-item-badge">{Math.round(offer)}% OFF</span>
                    )}
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/product/${item.product_id || item.id}`} className="cart-item-name">{item.name}</Link>
                    {item.size && <div className="cart-item-attr">Size: {item.size}</div>}
                    <div className="cart-item-pricing">
                      <span className="cart-item-price">₹{finalPrice.toFixed(0)}</span>
                      {((offer > 0 && !item.is_from_combo) || (item.is_from_combo)) && <span className="cart-item-original">₹{price.toFixed(0)}</span>}
                    </div>
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product_id || item.id, qty - 1)}
                          disabled={qty <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-val">{qty}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product_id || item.id, qty + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="cart-item-subtotal">₹{(finalPrice * qty).toFixed(0)}</span>
                      <button
                        className="cart-remove-btn"
                        onClick={() => { removeFromCart(item.product_id || item.id); toast.success('Item removed'); }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary-col">
            {/* Coupon */}
            <div className="cart-coupon-card card card-body">
              <h3 className="cart-summary-heading">
                <Tag size={16} /> Apply Coupon
              </h3>
              {couponApplied ? (
                <div className="coupon-applied">
                  <span className="badge badge-success">"{couponApplied}" applied — saved ₹{couponDiscount}</span>
                  <button className="btn btn-ghost btn-sm" onClick={handleRemoveCoupon}>Remove</button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <button className="btn btn-outline btn-block" onClick={handleOpenCoupons} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                    View Available Coupons <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Check */}
            <div className="cart-delivery-card card card-body">
              <h3 className="cart-summary-heading">Check Delivery</h3>
              <div className="coupon-input-row">
                <input
                  className="form-input"
                  placeholder="Enter pincode"
                  value={pincode}
                  maxLength={6}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                />
                <button className="btn btn-secondary btn-sm" onClick={checkDelivery}>Check</button>
              </div>
              {deliveryDays && (
                <p className="delivery-result">
                  🚚 Estimated delivery: <strong>{deliveryDays} days</strong>
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="cart-order-summary card card-body">
              <h3 className="cart-summary-heading">Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{cartSubtotal.toFixed(0)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="summary-row summary-row-green">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toFixed(0)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-success' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              {cartSubtotal < 500 && (
                <p className="free-delivery-hint">
                  Add ₹{(500 - cartSubtotal).toFixed(0)} more for FREE delivery!
                </p>
              )}
              <div className="summary-divider" />
              <div className="summary-total">
                <span>Total Amount</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <p className="summary-gst">* Inclusive of GST</p>
              <button className="btn btn-primary btn-lg btn-block" onClick={handleCheckout}>
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Modal */}
      {showCouponsModal && (
        <div className="modal-backdrop" onClick={() => setShowCouponsModal(false)}>
          <div className="modal-content coupons-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Available Coupons</h3>
              <button className="btn-icon" onClick={() => setShowCouponsModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="coupon-input-row" style={{ marginBottom: 20 }}>
                <input
                  className="form-input"
                  placeholder="Enter coupon code manually"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                />
                <button className="btn btn-primary" onClick={handleApplyManualCoupon} disabled={applyingCoupon || !couponCode.trim()}>
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>

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
