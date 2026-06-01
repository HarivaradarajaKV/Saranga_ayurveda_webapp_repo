import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
}
