import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import './Donate.css';

export default function Donate() {
  const toast = useToast();
  const [amount, setAmount] = useState('500');
  const [currency, setCurrency] = useState('INR');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  const presets = [100, 500, 1000, 1500];

  const handleDonate = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.warning('Please agree to the terms to proceed.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.warning('Please enter a valid donation amount.');
      return;
    }
    
    const displayName = isAnonymous ? 'Anonymous' : (name.trim() || 'Donor');
    toast.success(`Thank you, ${displayName}! Your donation of ${currency} ${amount} was successful.`);
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

            {/* Name Input */}
            {!isAnonymous && (
              <div className="donate-input-group">
                <input 
                  type="text" 
                  className="donate-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
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
            <button className="donate-submit-btn" onClick={handleDonate}>
              DONATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
