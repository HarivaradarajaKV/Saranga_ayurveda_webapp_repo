import { createContext, useContext, useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setItems([]);
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.CART);
      const raw = Array.isArray(res.data) ? res.data : res.data?.items || [];
      // Normalize: ensure each item has both `cartId` (cart row id) and `product_id`
      const normalized = raw.map(item => ({
        ...item,
        // `id` from backend is the cart row id; `product_id` is the product reference
        cartId: item.id,           // cart row id used for PUT/DELETE
        product_id: item.product_id || item.id,
      }));
      setItems(normalized);
      setSelectedItems(prev => {
        const newIds = normalized.map(item => item.product_id || item.id);
        const filteredPrev = prev.filter(id => newIds.includes(id));
        const currentIds = items.map(item => item.product_id || item.id);
        const newlyAdded = newIds.filter(id => !currentIds.includes(id));
        return [...filteredPrev, ...newlyAdded];
      });
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  const addToCart = async (productId, quantity = 1, variant = null) => {
    const existing = items.find(i => (i.product_id || i.id) === productId && i.variant === variant);
    const totalQty = (existing ? existing.quantity : 0) + quantity;
    if (totalQty > 20) {
      return { success: false, error: 'You can only add a maximum of 20 units of this product.' };
    }
    
    if (existing) {
      return updateQuantity(productId, (existing.quantity || 1) + 1, variant);
    }
    
    // Optimistic Update: Add new item to state instantly so controls render without delay
    const tempItem = {
      id: productId,
      product_id: productId,
      quantity,
      variant,
      cartId: `temp-${Date.now()}`
    };
    const previousItems = items;
    setItems(prev => [...prev, tempItem]);

    try {
      await api.post(ENDPOINTS.CART, { product_id: productId, quantity, variant });
      await fetchCart();
      return { success: true };
    } catch (err) {
      setItems(previousItems);
      return { success: false, error: err.response?.data?.error || 'Failed to add to cart' };
    }
  };

  // Remove by product_id — finds the cartId internally
  const removeFromCart = async (productId, variant = null) => {
    const item = items.find(i =>
      (i.product_id === productId || i.id === productId) &&
      (variant ? i.variant === variant : true)
    );
    const cartId = item?.cartId || item?.id;
    if (!cartId) { await fetchCart(); return; }
    
    const previousItems = items;
    setItems(prev => prev.filter(i => i.cartId !== cartId));
    
    try {
      await api.delete(ENDPOINTS.CART_ITEM(cartId));
    } catch {
      setItems(previousItems);
      await fetchCart();
    }
  };

  // updateQuantity: quantity is the new absolute value
  const updateQuantity = async (productId, quantity, variant = null) => {
    if (quantity < 1) { removeFromCart(productId, variant); return; }
    if (quantity > 20) {
      return { success: false, error: 'You can only add a maximum of 20 units of this product.' };
    }
    
    const item = items.find(i =>
      (i.product_id === productId || i.id === productId) &&
      (variant ? i.variant === variant : true)
    );
    const cartId = item?.cartId || item?.id;
    if (!cartId) { await fetchCart(); return; }
    
    // Enforce stock limit
    if (item.stock_quantity !== undefined && quantity > item.stock_quantity) {
      quantity = item.stock_quantity;
    }
    
    const previousItems = items;
    setItems(prev => prev.map(i =>
      i.cartId === cartId ? { ...i, quantity } : i
    ));
    
    try {
      await api.put(ENDPOINTS.CART_ITEM(cartId), { quantity });
      return { success: true };
    } catch (err) {
      setItems(previousItems);
      await fetchCart();
      return { success: false, error: err.response?.data?.error || 'Failed to update quantity' };
    }
  };

  const clearCart = async () => {
    try {
      // Try /cart/clear first (mobile uses this), fallback to deleting individually
      try {
        await api.delete('/cart/clear');
      } catch {
        await Promise.all(items.map(i => api.delete(ENDPOINTS.CART_ITEM(i.cartId || i.id))));
      }
      setItems([]);
    } catch { await fetchCart(); }
  };

  const cartCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const cartSubtotal = items.reduce((sum, i) => {
    const itemId = i.product_id || i.id;
    if (!selectedItems.includes(itemId)) return sum;
    let finalPrice;
    if (i.is_from_combo && i.combo_discounted_price !== undefined) {
      finalPrice = parseFloat(i.combo_discounted_price);
    } else {
      const price = parseFloat(i.price || 0);
      const offer = parseFloat(i.offer_percentage || 0);
      finalPrice = price * (1 - offer / 100);
    }
    const qty = i.quantity || 1;
    return sum + (finalPrice * qty);
  }, 0);

  const toggleItemSelection = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const getSelectedItems = () => {
    return items.filter(item => selectedItems.includes(item.product_id || item.id));
  };

  useEffect(() => {
    setSelectedItems(prev => prev.filter(id => items.some(item => (item.product_id || item.id) === id)));
  }, [items]);

  return (
    <CartContext.Provider value={{
      items, loading, cartCount, cartSubtotal,
      addToCart, removeFromCart, updateQuantity, clearCart, fetchCart,
      selectedItems, setSelectedItems, toggleItemSelection, getSelectedItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
