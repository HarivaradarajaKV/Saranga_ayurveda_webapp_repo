import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../api/api';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!product) return null;

  const {
    id, name, price = 0, offer_percentage = 0,
    image_url, stock_quantity = 0, is_new_arrival
  } = product;

  const discountedPrice = price * (1 - offer_percentage / 100);
  const inWishlist = isInWishlist(id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    if (stock_quantity <= 0) { toast.warning('This product is out of stock'); return; }
    setAdding(true);
    const result = await addToCart(id, 1);
    setAdding(false);
    if (result.success !== false) {
      toast.success(`${name} added to cart!`);
    } else {
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
    <div
      className={`product-card${hovered ? ' is-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image block */}
      <Link to={`/product/${id}`} className="product-card-image-wrap">
        <img
          src={imgUrl}
          alt={name}
          className="product-card-image"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Badge: New Arrival or Offer */}
        {is_new_arrival && (
          <span className="product-card-badge badge-new">New Arrival</span>
        )}
        {!is_new_arrival && offer_percentage > 0 && (
          <span className="product-card-badge badge-offer">{Math.round(offer_percentage)}% OFF</span>
        )}

        {/* Out of Stock overlay */}
        {stock_quantity <= 0 && (
          <div className="product-card-oos">Out of Stock</div>
        )}

        {/* Hover: Quick View strip */}
        <div className="product-card-quick-view">
          <Eye size={15} strokeWidth={2} />
          Quick View
        </div>

        {/* Wishlist btn top-right */}
        <button
          className={`product-card-wish-btn${inWishlist ? ' active' : ''}`}
          onClick={handleWishlist}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </Link>

      {/* Info */}
      <div className="product-card-body">
        <Link to={`/product/${id}`} className="product-card-name">{name}</Link>
        <div className="product-card-pricing">
          <span className="product-card-price">₹{discountedPrice.toFixed(2)}</span>
          {offer_percentage > 0 && (
            <span className="product-card-original">₹{parseFloat(price).toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* Add to Cart — slides in on hover */}
      <button
        className={`product-card-cart-btn${adding ? ' loading' : ''}`}
        onClick={handleAddToCart}
        disabled={adding || stock_quantity <= 0}
      >
        {adding ? 'Adding…' : stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
}
