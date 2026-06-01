import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { Leaf } from 'lucide-react';
import './Auth.css';

export default function ForgotPassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await api.post(ENDPOINTS.FORGOT_PASSWORD, { email });
      setStep(2);
      toast.success('OTP sent to your email');
    } catch { toast.error('Email not found'); }
    setLoading(false);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(ENDPOINTS.VERIFY_RESET_OTP, { email, otp });
      setStep(3);
    } catch { toast.error('Invalid OTP'); }
    setLoading(false);
  };

  const resetPw = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 6) { toast.error('Min. 6 characters'); return; }
    setLoading(true);
    try {
      await api.post(ENDPOINTS.RESET_PASSWORD, { email, otp, newPassword: newPw });
      toast.success('Password reset successful!');
      navigate('/auth/login');
    } catch { toast.error('Failed to reset password'); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Leaf size={20} /></div>
          <div className="auth-logo-name">Saranga Ayurveda</div>
        </div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-sub">
          {step === 1 ? 'Enter your email to receive a reset OTP'
            : step === 2 ? `OTP sent to ${email}`
            : 'Enter your new password'}
        </p>

        {step === 1 && (
          <form onSubmit={sendOtp} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={verifyOtp} className="auth-form">
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input className="form-input otp-input" value={otp} maxLength={6}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6-digit OTP" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm btn-block mt-8" onClick={() => setStep(1)}>← Back</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={resetPw} className="auth-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={newPw}
                onChange={e => setNewPw(e.target.value)} placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/auth/login" className="auth-link">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
