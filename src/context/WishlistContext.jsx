import { createContext, useContext, useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
    else setItems([]);
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get(ENDPOINTS.WISHLIST);
      const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setItems(data);
    } catch { setItems([]); }
  };

  const addToWishlist = async (productId) => {
    try {
      await api.post(ENDPOINTS.WISHLIST, { productId });
      await fetchWishlist();
      return { success: true };
    } catch { return { success: false }; }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(ENDPOINTS.WISHLIST_ITEM(productId));
      setItems(prev => prev.filter(i => (i.product_id || i.id) !== productId));
    } catch { await fetchWishlist(); }
  };

  const isInWishlist = (productId) =>
    items.some(i => (i.product_id || i.id) === productId);

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) return removeFromWishlist(productId);
    return addToWishlist(productId);
  };

  return (
    <WishlistContext.Provider value={{
      items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
