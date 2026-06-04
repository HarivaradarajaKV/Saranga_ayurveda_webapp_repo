import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { ENDPOINTS } from '../api/api';
import { MapPin, CreditCard, Plus, CheckCircle, Tag, ArrowRight, X } from 'lucide-react';
import './Checkout.css';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_RhzLf3BDT0rwrF';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, clearCart, cartSubtotal } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [couponCode, setCouponCode] = useState(location.state?.couponCode || '');
  const [couponDiscount, setCouponDiscount] = useState(location.state?.couponDiscount || 0);
  const deliveryCharge = location.state?.deliveryCharge ?? (cartSubtotal >= 500 ? 0 : 59);
  const orderTotal = cartSubtotal - couponDiscount + deliveryCharge;

  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [placing, setPlacing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: user?.name || '', phone_number: '', address_line1: '',
    address_line2: '', city: '', state: '', postal_code: '', country: 'India'
  });
  const [addingAddr, setAddingAddr] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    fetchAddresses();
    if (items.length === 0) navigate('/cart');
  }, []);

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
      toast.success(`Coupon applied! Saved ₹${disc}`);
    } catch {
      toast.error('Invalid or expired coupon');
    }
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADDRESSES);
      const data = Array.isArray(res.data) ? res.data : [];
      setAddresses(data);
      if (data.length > 0) setSelectedAddress(data.find(a => a.is_default) || data[0]);
    } catch { }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddingAddr(true);
    try {
      await api.post(ENDPOINTS.ADDRESSES, newAddress);
      await fetchAddresses();
      setShowAddForm(false);
      toast.success('Address added!');
    } catch {
      toast.error('Failed to add address');
    }
    setAddingAddr(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.warning('Please select a delivery address'); return; }
    setPlacing(true);
    try {
      const orderData = {
        shipping_address: {
          address_line1: selectedAddress.address_line1,
          address_line2: selectedAddress.address_line2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code || selectedAddress.pincode || '',
          country: selectedAddress.country || 'India',
          full_name: selectedAddress.full_name,
          phone_number: selectedAddress.phone_number || selectedAddress.phone || '',
        },
        payment_method: paymentMethod,
        items: items.map(i => ({
          product_id: i.product_id || i.id,
          quantity: i.quantity || 1,
          price: i.is_from_combo && i.combo_discounted_price !== undefined ? parseFloat(i.combo_discounted_price) : parseFloat(i.price) * (1 - parseFloat(i.offer_percentage || 0) / 100),
          name: i.name
        })),
        total_amount: orderTotal,
        delivery_charge: deliveryCharge || 0,
        coupon_code: couponCode || null,
        discount_amount: couponDiscount || 0
      };

      const orderRes = await api.post(ENDPOINTS.ORDERS, orderData);
      const { order } = orderRes.data || {};

      if (!order) throw new Error('Order creation failed');

      if (paymentMethod === 'cod') {
        setOrderId(order.id);
        await clearCart();
        setOrderSuccess(true);
      } else {
        if (!order.razorpay_order) throw new Error('Razorpay order missing');
        const rzpOrder = order.razorpay_order;
        
        const options = {
          key: rzpOrder.key || rzpOrder.key_id || RAZORPAY_KEY,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || 'INR',
          name: 'Saranga Ayurveda LLP',
          description: `Order #${order.id}`,
          order_id: rzpOrder.id,
          prefill: {
            name: user?.name || selectedAddress.full_name,
            email: user?.email || '',
            contact: selectedAddress.phone_number || '',
          },
          theme: { color: '#2b3a1a' },
          handler: async (response) => {
            try {
              await api.post('/razorpay/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order.id
              });
              setOrderId(order.id);
              await clearCart();
              setOrderSuccess(true);
            } catch {
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          modal: { ondismiss: () => { setPlacing(false); toast.info('Payment cancelled'); } }
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.open();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initiate order. Please try again.');
      setPlacing(false);
    }
  };

  if (orderSuccess) return (
    <div className="page-content page-fade-in">
      <div className="container empty-state">
        <div style={{ color: 'var(--success)', fontSize: 64 }}><CheckCircle size={80} /></div>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your order{orderId ? ` #${orderId}` : ''}. We'll send you updates via email.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => navigate('/profile/orders')}>View Orders</button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <div className="page-content page-fade-in checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-grid">
          {/* Left: Steps */}
          <div className="checkout-main">
            {/* Step 1: Address */}
            <div className="checkout-step">
              <div className="checkout-step-header">
                <div className="step-num">1</div>
                <h2>Delivery Address</h2>
              </div>
              <div className="addresses-list">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`address-card ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <div className="address-radio">
                      <div className={`radio-circle ${selectedAddress?.id === addr.id ? 'active' : ''}`} />
                    </div>
                    <div className="address-info">
                      <div className="address-name">{addr.full_name}</div>
                      <div className="address-text">
                        {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''},&nbsp;
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </div>
                      <div className="address-phone">{addr.phone_number}</div>
                    </div>
                  </div>
                ))}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>

              {showAddForm && (
                <form className="add-address-form" onSubmit={handleAddAddress}>
                  <h3>New Address</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" required value={newAddress.full_name}
                        onChange={e => setNewAddress(p => ({ ...p, full_name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" required value={newAddress.phone_number}
                        onChange={e => setNewAddress(p => ({ ...p, phone_number: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 1</label>
                    <input className="form-input" required value={newAddress.address_line1}
                      onChange={e => setNewAddress(p => ({ ...p, address_line1: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 2 (Optional)</label>
                    <input className="form-input" value={newAddress.address_line2}
                      onChange={e => setNewAddress(p => ({ ...p, address_line2: e.target.value }))} />
                  </div>
                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" required value={newAddress.city}
                        onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input className="form-input" required value={newAddress.state}
                        onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input className="form-input" required maxLength={6} value={newAddress.postal_code}
                        onChange={e => setNewAddress(p => ({ ...p, postal_code: e.target.value.replace(/\D/g, '') }))} />
                    </div>
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={addingAddr}>
                    {addingAddr ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
              )}

              {/* Step 2: Payment Method */}
              <div className="checkout-step" style={{ marginTop: 24 }}>
                <div className="checkout-step-header">
                  <div className="step-num">2</div>
                  <h2>Payment Method</h2>
                </div>
                <div className="payment-methods">
                  <div 
                    className={`payment-method-card ${paymentMethod === 'online' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <div className="radio-circle" style={{ borderColor: paymentMethod === 'online' ? 'var(--primary)' : '#ccc' }}>
                      {paymentMethod === 'online' && <div className="active" style={{ background: 'var(--primary)', width: 10, height: 10, borderRadius: '50%', margin: 2 }} />}
                    </div>
                    <div className="method-info">
                      <strong>Pay Online</strong>
                      <p>UPI, Cards, Net Banking</p>
                    </div>
                  </div>
                  <div 
                    className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="radio-circle" style={{ borderColor: paymentMethod === 'cod' ? 'var(--primary)' : '#ccc' }}>
                      {paymentMethod === 'cod' && <div className="active" style={{ background: 'var(--primary)', width: 10, height: 10, borderRadius: '50%', margin: 2 }} />}
                    </div>
                    <div className="method-info">
                      <strong>Cash on Delivery</strong>
                      <p>Pay when you receive</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="checkout-summary">
            <div className="card card-body">
              <h3 className="cart-summary-heading">Order Summary</h3>
              <div className="checkout-items-list">
                {items.slice(0, 3).map(item => {
                  let finalPrice;
                  if (item.is_from_combo && item.combo_discounted_price !== undefined) {
                    finalPrice = parseFloat(item.combo_discounted_price);
                  } else {
                    finalPrice = parseFloat(item.price) * (1 - parseFloat(item.offer_percentage || 0) / 100);
                  }
                  return (
                    <div key={item.id || item.product_id} className="checkout-item-row">
                      <span className="checkout-item-name">{item.name} {item.is_from_combo ? <span style={{fontSize: '0.7rem', color: '#8e24aa'}}>(Combo)</span> : ''} × {item.quantity || 1}</span>
                      <span>₹{(finalPrice * (item.quantity || 1)).toFixed(0)}</span>
                    </div>
                  );
                })}
                {items.length > 3 && <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>+{items.length - 3} more items</p>}
              </div>
              <div className="summary-divider" />
              <div className="summary-row"><span>Subtotal</span><span>₹{cartSubtotal.toFixed(0)}</span></div>
              {couponDiscount > 0 ? (
                <div className="summary-row summary-row-green" style={{ alignItems: 'center' }}>
                  <span>Coupon ({couponCode}) <button className="btn btn-ghost btn-sm" style={{padding: 0, marginLeft: 8}} onClick={handleRemoveCoupon}>Remove</button></span>
                  <span>-₹{couponDiscount.toFixed(0)}</span>
                </div>
              ) : (
                <div style={{ marginBottom: 10 }}>
                  <button className="btn btn-outline btn-block btn-sm" onClick={handleOpenCoupons} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                    <Tag size={14} /> Apply Coupon
                  </button>
                </div>
              )}
              <div className="summary-row"><span>Delivery</span><span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
              <div className="summary-divider" />
              <div className="summary-total"><span>Total</span><span>₹{orderTotal.toFixed(0)}</span></div>
              <p className="summary-gst">* Inclusive of GST</p>

              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddress}
              >
                {paymentMethod === 'online' ? <CreditCard size={18} /> : null}
                {placing ? 'Processing...' : (paymentMethod === 'online' ? `Pay ₹${orderTotal.toFixed(0)}` : 'Place Order')}
              </button>
              {paymentMethod === 'online' && (
                <p className="checkout-secure-note">
                  🔒 Secured by Razorpay. UPI, Cards, Net Banking accepted.
                </p>
              )}
            </div>
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
    </>
  );
}
