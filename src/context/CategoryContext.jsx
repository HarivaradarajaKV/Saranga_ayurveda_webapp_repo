import { createContext, useContext, useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useAuth } from './AuthContext';

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.CATEGORIES);
      const data = Array.isArray(res.data) ? res.data : res.data?.categories || [];
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (id) => categories.find(c => c.id === parseInt(id));

  return (
    <CategoryContext.Provider value={{ categories, loading, error, getCategoryById, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories must be used within CategoryProvider');
  return ctx;
};
