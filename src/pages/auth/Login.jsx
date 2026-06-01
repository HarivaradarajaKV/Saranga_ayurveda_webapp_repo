import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { ENDPOINTS } from '../../api/api';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { login, setAuthData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success(`Welcome back, ${result.user?.name || 'User'}!`);
      navigate('/');
    } else {
      if (result.needsVerification) {
        setShowOtpInput(true);
        toast.info('Please verify your email to continue');
      } else {
        toast.error(result.error || 'Login failed');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { toast.error('Enter the OTP'); return; }
    setLoading(true);
    try {
      // In mobile app, login verification uses empty name but sends password
      const res = await api.post(ENDPOINTS.VERIFY_SIGNUP_OTP, { email, otp, name: '', password });
      if (res.data?.token) {
        let u = res.data.user;
        if (!u) {
          try {
            const profileRes = await api.get(ENDPOINTS.USER_PROFILE, { headers: { Authorization: `Bearer ${res.data.token}` } });
            u = profileRes.data;
          } catch (e) { u = { name: 'User', email }; }
        }
        setAuthData(res.data.token, u);
        toast.success('Account verified! Welcome 🎉');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Leaf size={20} /></div>
          <div className="auth-logo-name">Saranga Ayurveda</div>
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to continue your Ayurvedic journey</p>

        <form onSubmit={showOtpInput ? handleVerifyOtp : handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <Link to="/auth/forgot-password" className="auth-forgot">Forgot Password?</Link>
            </div>
            <div className="auth-pw-wrap">
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          
          {showOtpInput && (
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                className="form-input otp-input"
                value={otp}
                maxLength={6}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit OTP"
              />
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
          >
            {loading ? (showOtpInput ? 'Verifying...' : 'Signing In...') : (showOtpInput ? 'Verify' : 'Sign In')}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/auth/signup" className="auth-link">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
