import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Leaf, Plus } from 'lucide-react';
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

  if (!product) return null;

  const {
    id, name, price = 0, category_name, category, image_url, stock_quantity = 0
  } = product;

  const inWishlist = isInWishlist(id);
  const displayPrice = price ? parseFloat(price).toFixed(2) : '0.00';

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
    <Link to={`/product/${id}`} className="new-arrival-card">
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
          {category_name ? category_name.toUpperCase() : category ? category.toUpperCase() : 'CAPSULES'}
        </span>
        <h3 className="new-arrival-name">{name}</h3>
        <div className="new-arrival-footer">
          <span className="new-arrival-price">
            ₹{displayPrice}
          </span>
          <button 
            className={`new-arrival-add-btn ${adding ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={adding || stock_quantity <= 0}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}
