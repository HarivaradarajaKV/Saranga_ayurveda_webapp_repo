import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { ENDPOINTS } from '../../api/api';
import { Eye, EyeOff } from 'lucide-react';
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

  const handleGoogleClick = () => {
    const callbackUrl = encodeURIComponent(`${window.location.origin}/auth/google-callback`);
    window.location.href = `${api.defaults.baseURL}/auth/google?app_callback=${callbackUrl}`;
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
          <Link to="/" className="auth-logo-link">
            <img src="/images/logo.png" alt="Saranga Ayurveda" className="auth-logo-img" />
            <img src="/images/name.png" alt="Saranga Ayurveda" className="auth-logo-name-img" />
          </Link>
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

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '100%' }}>
              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleClick}
                disabled={loading}
              >
                <svg className="btn-google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>
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
