import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Leaf, Plus, Check, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../api/api';
import { getDisplayCategoryName } from '../context/CategoryContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const {
    id, name, price = 0, category_name, category, image_url, stock_quantity = 0, offer_percentage = 0
  } = product;
  
  const cartItem = cartItems.find(i => (i.product_id || i.id) === id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const inWishlist = isInWishlist(id);
  const hasOffer = offer_percentage > 0;
  const originalPrice = parseFloat(price);
  const discountedPrice = hasOffer ? originalPrice * (1 - offer_percentage / 100) : originalPrice;

  const displayPrice = price ? discountedPrice.toFixed(2) : '0.00';
  const displayOriginalPrice = price ? originalPrice.toFixed(2) : '0.00';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    if (stock_quantity <= 0) { toast.warning('This product is out of stock'); return; }
    
    // Optimistic update: Show success checkmark instantly
    setAdded(true);
    setAdding(true);
    
    const result = await addToCart(id, 1);
    setAdding(false);
    if (result.success !== false) {
      toast.success(`${name} added to cart!`);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setAdded(false);
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    await toggleWishlist(id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const imgUrl = imageError
    ? 'https://via.placeholder.com/300x300?text=No+Image'
    : getImageUrl(image_url);

  return (
    <Link to={`/product/${id}`} className="new-arrival-card">
      {hasOffer && (
        <div className="new-arrival-offer-badge">
          {Math.round(offer_percentage)}% OFF
        </div>
      )}
      {stock_quantity > 0 && stock_quantity <= 10 && (
        <div className="new-arrival-stock-badge">
          Selling Fast
        </div>
      )}
      <div className="new-arrival-img-wrap">
        {/* Decorative Leaves inside image border */}
        <div className="new-arrival-leaves-dec">
          <Leaf size={18} className="dec-leaf-1" />
          <Leaf size={12} className="dec-leaf-2" />
        </div>

        {/* Wishlist Heart Button (Top Right of image) */}
        <button 
          className={`new-arrival-wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        <img
          src={imgUrl}
          alt={name}
          className="new-arrival-img"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Decorative Capsules near bottom-right of bottle */}
        <div className="new-arrival-capsules-dec">
          <span className="dec-capsule capsule-1" />
          <span className="dec-capsule capsule-2" />
        </div>
      </div>
      <div className="new-arrival-info">
        <span className="new-arrival-category">
          {getDisplayCategoryName(category_name || category || 'CAPSULES').toUpperCase()}
        </span>
        <h3 className="new-arrival-name">{name}</h3>
        <div className="new-arrival-footer">
          <div className="new-arrival-price-wrap">
            {hasOffer && (
              <span className="new-arrival-original-price">
                ₹{displayOriginalPrice}
              </span>
            )}
            <span className="new-arrival-price">
              ₹{displayPrice}
            </span>
          </div>
          {cartQty > 0 ? (
            <div className="product-card-qty-control">
              <button 
                className="product-card-qty-btn" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(id, cartQty - 1); }}
                title="Decrease quantity"
              >
                <Minus size={10} strokeWidth={3} />
              </button>
              <span className="product-card-qty-val">{cartQty}</span>
              <button 
                className="product-card-qty-btn" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(id, cartQty + 1); }}
                title="Increase quantity"
              >
                <Plus size={10} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button 
              className={`new-arrival-add-btn ${adding ? 'loading' : ''} ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={adding || stock_quantity <= 0}
            >
              {added ? <Check size={14} /> : <Plus size={14} />}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
