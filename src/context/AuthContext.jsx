import { createContext, useContext, useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { logout(); }
    }
    setLoading(false);
  }, []);

  const setAuthData = (t, u) => {
    localStorage.setItem('auth_token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = async (email, password) => {
    try {
      const res = await api.post(ENDPOINTS.LOGIN, { email, password });
      if (res.data?.token) {
        let { token: t, user: u } = res.data;
        
        if (!u) {
          try {
            const profileRes = await api.get(ENDPOINTS.USER_PROFILE, {
              headers: { Authorization: `Bearer ${t}` }
            });
            u = profileRes.data;
          } catch (e) {
            u = { name: 'User', email };
          }
        }
        
        setAuthData(t, u);
        return { success: true, user: u };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      return { 
        success: false, 
        error: msg,
        needsVerification: err.response?.data?.needsVerification
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post(ENDPOINTS.REGISTER, { name, email, password });
      if (res.data?.token) {
        let { token: t, user: u } = res.data;
        
        if (!u) {
          try {
            const profileRes = await api.get(ENDPOINTS.USER_PROFILE, {
              headers: { Authorization: `Bearer ${t}` }
            });
            u = profileRes.data;
          } catch (e) {
            u = { name, email };
          }
        }
        
        setAuthData(t, u);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const isAdmin = () => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    } catch { return false; }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, login, register, logout, updateUser, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
