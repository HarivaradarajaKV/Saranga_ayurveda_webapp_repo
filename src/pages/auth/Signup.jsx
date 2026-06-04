import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { ENDPOINTS } from '../../api/api';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

export default function Signup() {
  const { login, setAuthData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=OTP
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [otp, setOtp] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse; // Google ID Token
      setLoading(true);
      const res = await api.post('/auth/google-login', { idToken: credential });
      setLoading(false);
      
      if (res.data?.token) {
        setAuthData(res.data.token, res.data.user);
        toast.success(`Welcome, ${res.data.user?.name || 'User'}!`);
        if (res.data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setLoading(false);
      console.error('Google login error:', err);
      toast.error(err.response?.data?.error || 'Google login failed');
    }
  };

  const validateForm = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min. 6 characters';
    if (password !== confirmPw) e.confirmPw = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.post(ENDPOINTS.REQUEST_SIGNUP_OTP, { email });
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const verifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { toast.error('Enter the OTP'); return; }
    setLoading(true);
    try {
      // Verify OTP and create account
      const res = await api.post(ENDPOINTS.VERIFY_SIGNUP_OTP, { email, otp, name, password });
      
      if (res.data?.token) {
        let u = res.data.user;
        if (!u) {
          try {
            const profileRes = await api.get(ENDPOINTS.USER_PROFILE, { headers: { Authorization: `Bearer ${res.data.token}` } });
            u = profileRes.data;
          } catch (e) { u = { name, email }; }
        }
        setAuthData(res.data.token, u);
        toast.success('Account created! Welcome 🎉');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
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
        <h1 className="auth-title">{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
        <p className="auth-sub">
          {step === 1 ? 'Join the Ayurvedic wellness community' : `We sent an OTP to ${email}`}
        </p>

        {step === 1 ? (
          <>
            <form onSubmit={requestOtp} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className={`form-input ${errors.name ? 'input-error' : ''}`} value={name}
                  onChange={e => setName(e.target.value)} placeholder="Your name" />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className={`form-input ${errors.email ? 'input-error' : ''}`} value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="auth-pw-wrap">
                  <input type={showPw ? 'text' : 'password'} className={`form-input ${errors.password ? 'input-error' : ''}`}
                    value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className={`form-input ${errors.confirmPw ? 'input-error' : ''}`}
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" />
                {errors.confirmPw && <span className="form-error">{errors.confirmPw}</span>}
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>

            <div className="auth-divider" style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
              <span style={{ background: '#fff', padding: '0 10px', color: '#777', fontSize: '14px', zIndex: 1, position: 'relative' }}>OR</span>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#eee', zIndex: 0 }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Sign-In failed')}
                useOneTap
              />
            </div>
          </>
        ) : (
          <form onSubmit={verifyAndRegister} className="auth-form">
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input className="form-input otp-input" value={otp} maxLength={6}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6-digit OTP" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Verifying...' : 'Create Account'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm btn-block mt-8" onClick={() => setStep(1)}>
              ← Back
            </button>
          </form>
        )}
        <p className="auth-switch">
          Already have an account? <Link to="/auth/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
