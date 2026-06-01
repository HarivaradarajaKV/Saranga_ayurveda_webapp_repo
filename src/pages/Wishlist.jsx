import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../api/api';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
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
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 28 }}>
          My Wishlist <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>({items.length})</span>
        </h1>
        <div className="grid-4">
          {items.map(item => {
            const price = parseFloat(item.price || 0);
            const offer = parseFloat(item.offer_percentage || 0);
            const discounted = price * (1 - offer / 100);
            const pid = item.product_id || item.id;
            return (
              <div key={item.id} className="card" style={{ overflow: 'hidden' }}>
                <Link to={`/product/${pid}`}>
                  <div style={{ height: 200, overflow: 'hidden', background: 'var(--surface)' }}>
                    <img src={getImageUrl(item.image_url)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = 'https://via.placeholder.com/200'} />
                  </div>
                </Link>
                <div className="card-body">
                  <Link to={`/product/${pid}`}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8, color: 'var(--text)' }}>{item.name}</div>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{discounted.toFixed(0)}</span>
                    {offer > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>₹{price.toFixed(0)}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={async () => {
                        const r = await addToCart(pid, 1);
                        if (r?.success !== false) toast.success('Added to cart!');
                      }}
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => { removeFromWishlist(pid); toast.success('Removed from wishlist'); }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
