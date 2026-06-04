import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../api/api';
import { Heart, Trash2, ShoppingCart, Leaf, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Wishlist.css';
import '../components/ProductCard.css';
import { useToast } from '../context/ToastContext';

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  if (items.length === 0) return (
    <div className="wishlist-page page-fade-in" style={{ paddingTop: 40 }}>
      <div className="container empty-state">
        <div className="empty-state-icon"><Heart size={32} /></div>
        <h2>Your Wishlist is Empty</h2>
        <p>Save products you love for later</p>
        <Link to="/explore" className="btn btn-primary">Browse Products</Link>
      </div>
    </div>
  );

  return (
    <div className="wishlist-page page-fade-in" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#2E5D34', marginBottom: 28 }}>
          My Wishlist <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>({items.length})</span>
        </h1>
        <div className="new-arrivals-grid-custom">
          {items.map(item => {
            const price = parseFloat(item.price || 0);
            const offer = parseFloat(item.offer_percentage || 0);
            const discounted = price * (1 - offer / 100);
            const pid = item.product_id || item.id;

            const handleAddToCart = async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const r = await addToCart(pid, 1);
              if (r?.success !== false) {
                toast.success(`${item.name} added to cart!`);
              } else {
                toast.error(r?.error || 'Failed to add to cart');
              }
            };

            const handleRemove = async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await removeFromWishlist(pid);
              toast.success('Removed from wishlist');
            };

            const hasOffer = offer > 0;
            const isSellingFast = item.stock_quantity > 0 && item.stock_quantity <= 10;
            return (
              <Link key={item.id} to={`/product/${pid}`} className="new-arrival-card">
                {hasOffer && (
                  <div className="new-arrival-offer-badge">
                    {Math.round(offer)}% OFF
                  </div>
                )}
                {isSellingFast && (
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

                  {/* Wishlist Heart Button -> Replaced with Trash/Delete Button */}
                  <button 
                    className="new-arrival-wishlist-btn active"
                    style={{ color: '#e53e3e', backgroundColor: 'rgba(250, 248, 245, 0.95)' }}
                    onClick={handleRemove}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={15} />
                  </button>

                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    className="new-arrival-img"
                    onError={e => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
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
                    {item.category_name ? item.category_name.toUpperCase() : 'WELLNESS'}
                  </span>
                  <h3 className="new-arrival-name" title={item.name}>{item.name}</h3>
                  <div className="new-arrival-footer">
                    <div className="new-arrival-price-wrap">
                      {hasOffer && (
                        <span className="new-arrival-original-price">
                          ₹{price.toFixed(2)}
                        </span>
                      )}
                      <span className="new-arrival-price">
                        ₹{discounted.toFixed(2)}
                      </span>
                    </div>
                    <button 
                      className="new-arrival-add-btn"
                      onClick={handleAddToCart}
                      title="Add to cart"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
