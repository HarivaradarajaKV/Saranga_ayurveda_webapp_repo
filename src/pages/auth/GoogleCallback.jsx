import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { ENDPOINTS } from '../../api/api';

export default function GoogleCallback() {
  const { setAuthData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('Google Auth callback error:', error);
        toast.error(decodeURIComponent(error) || 'Google login failed');
        navigate('/auth/login', { replace: true });
        return;
      }

      if (!token) {
        toast.error('Authentication token not found');
        navigate('/auth/login', { replace: true });
        return;
      }

      try {
        // Fetch full profile info using the token
        const profileRes = await api.get(ENDPOINTS.USER_PROFILE, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const user = profileRes.data;
        setAuthData(token, user);
        toast.success(`Welcome, ${user.name || 'User'}!`);
        
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Failed to fetch user profile after Google login:', err);
        // Fallback: parse from token if API request fails
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const fallbackUser = {
            id: tokenData.id,
            role: tokenData.role,
            email: tokenData.email,
            name: tokenData.name || 'Google User'
          };
          setAuthData(token, fallbackUser);
          toast.success(`Welcome, ${fallbackUser.name}!`);
          if (fallbackUser.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } catch (e) {
          toast.error('Failed to complete login. Please try again.');
          navigate('/auth/login', { replace: true });
        }
      }
    };

    handleCallback();
  }, [searchParams, setAuthData, navigate, toast]);

  return (
    <div className="loading-center" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg, #fff)' }}>
      <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid var(--primary, #3d5236)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: '20px', fontSize: '1.1rem', color: 'var(--text-muted, #555)', fontFamily: 'var(--font-sans, sans-serif)' }}>Completing login, please wait...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
