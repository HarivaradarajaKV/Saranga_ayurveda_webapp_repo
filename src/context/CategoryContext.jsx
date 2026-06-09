import { createContext, useContext, useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useAuth } from './AuthContext';

const CategoryContext = createContext(null);

export const categoryDisplayNames = {
  'BABY CARE': 'Baby Care',
  'PREGNANCY CARE': 'Pregnancy Care',
  'BODY CONCERN': 'Body Care',
  'BODY CARE': 'Body Care',
  'FACIAL CARE': 'Facial Care',
  'HAIR CONCERN': 'Hair Care',
  'HAIR CARE': 'Hair Care',
  'DANDRUFF CONCERN': 'Dandruff Care',
  'DANDRUFF CARE': 'Dandruff Care',
  'ACNE CARE': 'Acne Care',
  'LIP CONCERN': 'Lip Care',
  'LIP CARE': 'Lip Care',
  'WOMEN CONCERN': 'Women Concern',
  'MEN': 'Men',
  'WELLNESS': 'Wellness',
  'BODY MIST': 'Body Mist'
};

const targetOrder = [
  'BABY CARE',
  'PREGNANCY CARE',
  'BODY CONCERN',
  'FACIAL CARE',
  'HAIR CONCERN',
  'DANDRUFF CONCERN',
  'ACNE CARE',
  'LIP CONCERN',
  'WOMEN CONCERN',
  'MEN',
  'WELLNESS',
  'BODY MIST'
];

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const getDisplayCategoryName = (name) => {
  if (!name) return '';
  return name;
};

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load cached categories instantly
    try {
      const cached = localStorage.getItem('cache_categories');
      if (cached) {
        setCategories(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {
      console.error('Failed to load cached categories:', e);
    }
    fetchCategories();
  }, []);

  const fetchCategories = async (retries = 10, delay = 5000) => {
    // Avoid triggering spinner/skeleton if cache already exists
    const hasCache = localStorage.getItem('cache_categories') !== null;
    if (!hasCache) {
      setLoading(true);
    }
    try {
      const res = await api.get(ENDPOINTS.CATEGORIES);
      const data = Array.isArray(res.data) ? res.data : res.data?.categories || [];
      
      const sortedData = [...data].sort((a, b) => {
        const nameA = (a.name || '').toUpperCase();
        const nameB = (b.name || '').toUpperCase();
        const idxA = targetOrder.indexOf(nameA);
        const idxB = targetOrder.indexOf(nameB);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      }).map(cat => ({
        ...cat,
        displayName: cat.name
      }));

      setCategories(sortedData);
      setError(null);
      setLoading(false);
      try {
        localStorage.setItem('cache_categories', JSON.stringify(sortedData));
      } catch (e) {}
    } catch (err) {
      console.error(`Error loading categories, ${retries} retries left:`, err);
      if (retries > 0) {
        setTimeout(() => {
          fetchCategories(retries - 1, delay * 1.5);
        }, delay);
      } else {
        setError('Failed to load categories');
        setLoading(false);
      }
    }
  };

  const getCategoryById = (idOrSlug) => {
    if (!idOrSlug) return null;
    const clean = idOrSlug.toString().toLowerCase().trim();
    return categories.find(c => 
      c.id.toString() === clean || 
      slugify(c.name) === clean ||
      c.name.toLowerCase().trim() === clean
    );
  };

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

