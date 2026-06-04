import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import './Donate.css';

export default function Donate() {
  const toast = useToast();
  const [amount, setAmount] = useState('500');
  const [currency, setCurrency] = useState('INR');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const presets = [100, 500, 1000, 1500];

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.warning('Please agree to the terms to proceed.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.warning('Please enter a valid donation amount.');
      return;
    }
    if (!isAnonymous) {
      if (!name.trim()) {
        toast.warning('Please enter your name.');
        return;
      }
      if (!phone.trim()) {
        toast.warning('Please enter your phone number.');
        return;
      }
    }

    try {
      setLoading(true);
      const nameToUse = isAnonymous ? 'Anonymous' : name.trim();
      const numericAmount = parseFloat(amount);

      // Call public donation order endpoint
      const res = await api.post('/razorpay/create-donation', {
        amount: numericAmount,
        donor_name: nameToUse,
        is_anonymous: isAnonymous,
        donor_phone: isAnonymous ? '' : phone.trim(),
      });

      const razorpayOrder = res.data;

      if (!window.Razorpay) {
        toast.error('Razorpay payment SDK not loaded. Please refresh page.');
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayOrder.key || razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'Saranga Ayurveda LLP',
        description: `Donation by ${nameToUse}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: nameToUse,
          contact: isAnonymous ? '' : phone.trim(),
        },
        theme: { color: '#2b3a1a' },
        handler: async (response) => {
          try {
            await api.post('/razorpay/verify-donation-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              donation_id: razorpayOrder.donation_id,
            });
            toast.success(`Thank you, ${nameToUse}! Your donation of ₹${numericAmount} was successful.`);
            setName('');
            setPhone('');
            setAmount('500');
          } catch (err) {
            console.error('Donation verification error:', err);
            toast.error('Donation payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment window closed.');
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(error.response?.data?.error || 'Failed to initiate donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-page page-fade-in">
      <div className="donate-container">
        {/* Our Impact Badge */}
        <div className="donate-badge">
          <span>Our Impact</span>
        </div>

        {/* Heading */}
        <h1 className="donate-heading">Together, We're Making<br />A Difference</h1>

        {/* Card */}
        <div className="donate-card">
          <h2 className="donate-card-title">Choose amount</h2>

          {/* Input Box */}
          <div className="donate-amount-box">
            <input 
              type="number" 
              className="donate-amount-input" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            <div className="donate-currency-pill">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)} 
                className="donate-currency-select"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <span className="donate-currency-arrow">▼</span>
            </div>
          </div>

          {/* Presets */}
          <div className="donate-presets-row">
            {presets.map((preset) => (
              <button 
                key={preset}
                type="button"
                className={`donate-preset-btn ${parseFloat(amount) === preset ? 'active' : ''}`}
                onClick={() => setAmount(preset.toString())}
              >
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹'}{preset}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="donate-form-fields">
            {/* Anonymous Checkbox */}
            <div className="donate-field-checkbox">
              <label className="donate-custom-label">
                <input 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="donate-real-checkbox"
                />
                <span className="donate-styled-checkbox" />
                <span className="donate-label-text">Donate Anonymously</span>
              </label>
            </div>

            {/* Name and Phone Inputs */}
            {!isAnonymous && (
              <>
                <div className="donate-input-group">
                  <input 
                    type="text" 
                    className="donate-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="donate-input-group" style={{ marginTop: '12px' }}>
                  <input 
                    type="tel" 
                    className="donate-name-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            )}

            {/* Agree Terms Checkbox */}
            <div className="donate-field-checkbox">
              <label className="donate-custom-label">
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="donate-real-checkbox"
                />
                <span className="donate-styled-checkbox" />
                <span className="donate-label-text">I Agree To The Terms</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="donate-actions">
            <button className="donate-submit-btn" onClick={handleDonate} disabled={loading}>
              {loading ? 'PROCESSING...' : 'DONATE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
