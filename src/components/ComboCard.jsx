import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../api/api';

const getComboImageUrl = (combo) => {
  const name = (combo.name || combo.title || '').trim().toLowerCase();
  if (name.includes('dandruff')) {
    return '/images/combos/Anti Dandruff Kit.png';
  }
  if (name.includes('baby')) {
    return '/images/combos/Baby Combo.png';
  }
  if (name.includes('hair')) {
    return '/images/combos/Hair Growth Kit.png';
  }
  if (combo.image_url) {
    return getImageUrl(combo.image_url);
  }
  return '/images/logo.png';
};

export default function ComboCard({ combo }) {
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!combo) return null;

  const originalPrice = combo.subtotal || combo.original_price;
  const comboPrice = combo.total || combo.combo_price || combo.price;
  const discountVal = (originalPrice && comboPrice) ? (parseFloat(originalPrice) - parseFloat(comboPrice)) : (combo.discount_amount || combo.discount || 0);

  const getComboCartQty = () => {
    const products = combo.items || combo.products || [];
    if (products.length === 0) return 0;
    
    let minQty = null;
    for (const item of products) {
      const pid = item.product_id || item.id;
      const cartItem = cartItems?.find(i => (i.product_id || i.id) === pid);
      if (!cartItem) return 0;
      
      const comboRequiredQty = item.quantity || 1;
      const possibleCombos = Math.floor(cartItem.quantity / comboRequiredQty);
      if (minQty === null || possibleCombos < minQty) {
        minQty = possibleCombos;
      }
    }
    return minQty || 0;
  };

  const comboQty = getComboCartQty();

  const handleUpdateComboQty = async (targetQty) => {
    const products = combo.items || combo.products || [];
    const currentQty = comboQty;
    const diff = targetQty - currentQty;
    
    if (diff === 0) return;
    
    for (const item of products) {
      const pid = item.product_id || item.id;
      const cartItem = cartItems?.find(i => (i.product_id || i.id) === pid);
      const currentProductQty = cartItem ? cartItem.quantity : 0;
      const comboRequiredQty = item.quantity || 1;
      const newProductQty = Math.max(0, currentProductQty + (diff * comboRequiredQty));
      
      await updateQuantity(pid, newProductQty);
    }
  };

  const handleAddComboToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    
    const items = combo.items || combo.products || [];
    if (items.length === 0) {
      toast.warning('This combo has no items.');
      return;
    }
    
    setAdded(true);
    setAdding(true);
    
    try {
      let addedAny = false;
      for (const item of items) {
        const res = await addToCart(item.product_id || item.id, item.quantity || 1);
        if (res.success !== false) {
          addedAny = true;
        }
      }
      setAdding(false);
      if (addedAny) {
        toast.success(`${combo.name || combo.title} added to cart!`);
        setTimeout(() => setAdded(false), 2000);
      } else {
        setAdded(false);
        toast.error('Failed to add combo to cart.');
      }
    } catch (err) {
      setAdding(false);
      setAdded(false);
      console.error('Error adding combo to cart:', err);
    }
  };

  return (
    <Link to={`/deals/combo/${combo.id}`} className="new-arrival-card">
      {parseFloat(discountVal) > 0 && (
        <div className="combo-card-home-badge">
          SAVE ₹{parseFloat(discountVal).toFixed(0)}
        </div>
      )}

      <div className="new-arrival-img-wrap">
        <div className="new-arrival-leaves-dec">
          <Leaf size={18} className="dec-leaf-1" />
          <Leaf size={12} className="dec-leaf-2" />
        </div>

        <img
          src={getComboImageUrl(combo)}
          alt={combo.name || combo.title}
          className="new-arrival-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
          loading="lazy"
        />

        <div className="new-arrival-capsules-dec">
          <span className="dec-capsule capsule-1" />
          <span className="dec-capsule capsule-2" />
        </div>
      </div>

      <div className="new-arrival-info">
        <span className="new-arrival-category">
          COMBO PACK
        </span>
        <h3 className="new-arrival-name" title={combo.name || combo.title}>
          {combo.name || combo.title}
        </h3>
        <div className="new-arrival-footer">
          <span className="new-arrival-price" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            ₹{parseFloat(comboPrice || 0).toFixed(0)}
            {originalPrice && parseFloat(originalPrice) > parseFloat(comboPrice || 0) && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textDecoration: 'line-through', fontWeight: 'normal', marginLeft: '2px' }}>
                ₹{parseFloat(originalPrice).toFixed(0)}
              </span>
            )}
          </span>
          {comboQty > 0 ? (
            <div className="product-card-qty-control">
              <button 
                className="product-card-qty-btn" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateComboQty(comboQty - 1); }}
                title="Decrease quantity"
              >
                <Minus size={10} strokeWidth={3} />
              </button>
              <span className="product-card-qty-val">{comboQty}</span>
              <button 
                className="product-card-qty-btn" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateComboQty(comboQty + 1); }}
                title="Increase quantity"
              >
                <Plus size={10} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button 
              className={`new-arrival-add-btn ${adding ? 'loading' : ''} ${added ? 'added' : ''}`}
              onClick={handleAddComboToCart}
              disabled={adding}
              title="Add combo to cart"
            >
              {added ? <Check size={14} /> : <Plus size={14} />}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
