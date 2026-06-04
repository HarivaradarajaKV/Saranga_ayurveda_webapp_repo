import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import './Foundation.css';
import './Donate.css';

export default function Foundation() {
  const toast = useToast();
  
  // Donate Form State
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

  const events = [
    {
      id: 1,
      title: 'Free Ayurvedic Medical Camp',
      date: 'June 15, 2026',
      description: 'Providing free wellness consultations and herbal medicines to communities in need.'
    },
    {
      id: 2,
      title: 'Herbal Plantation Drive',
      date: 'July 04, 2026',
      description: 'Join us in planting rare medicinal herbs to preserve our traditional heritage.'
    },
    {
      id: 3,
      title: 'Community Health Awareness Seminars',
      date: 'August 12, 2026',
      description: 'Educating families on healthy living guidelines and seasonal preventive routines.'
    }
  ];

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="foundation-page-wrapper">
      {/* Sticky Header Nav */}
      <header className="foundation-sticky-header">
        <div className="foundation-nav-container">
          <div className="foundation-sub-nav" style={{ alignItems: 'center' }}>
            <button onClick={() => handleScroll('who-we-are')} className="foundation-sub-nav-btn">WHO WE ARE</button>
            <button onClick={() => handleScroll('what-we-do')} className="foundation-sub-nav-btn">WHAT WE DO</button>
            <button onClick={() => handleScroll('news-events')} className="foundation-sub-nav-btn">NEWS & EVENTS</button>
            <button onClick={() => handleScroll('get-involved')} className="foundation-sub-nav-btn">GET INVOLVED</button>
            <Link to="/" className="foundation-sub-nav-btn highlight-btn">SARANGA SPACE</Link>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="foundation-hero-section" id="hero">
        <div className="foundation-hero-container">
          <div className="foundation-brand-large">
            <img src="/images/logo.png" alt="Saranga Emblem" className="foundation-logo-emblem" />
            <img src="/images/name.png" alt="Saranga Ayurveda" className="foundation-logo-name" />
          </div>
          <p className="foundation-association-text">In association with</p>
          <h3 className="foundation-org-title">Saranga Anugraha Foundation</h3>
          <h1 className="foundation-main-heading">needs your support</h1>
          
          <div className="foundation-actions">
            <button onClick={() => handleScroll('donate-section')} className="foundation-donate-btn">DONATE</button>
            <button onClick={() => handleScroll('get-involved')} className="foundation-help-link-btn">
              <span>I NEED HELP</span>
              <span className="foundation-arrow-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. What We Do Section */}
      <section className="foundation-content-section bg-white" id="what-we-do">
        <div className="foundation-section-container">
          <div className="foundation-green-badge">
            <span>What We Do</span>
          </div>
          <h2 className="foundation-section-heading">
            Providing Hope And Help<br />During Challenging Times
          </h2>
          <div className="foundation-learn-more-row">
            <button onClick={() => handleScroll('who-we-are')} className="foundation-help-link-btn">
              <span>LEARN MORE</span>
              <span className="foundation-arrow-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </span>
            </button>
          </div>
          <div className="foundation-cards-grid">
            <div className="foundation-outline-card">
              <img 
                src="/images/foundation/card_1.png" 
                alt="Card 1" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x360?text=Card+1+Image'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '39px', display: 'block' }}
              />
            </div>
            <div className="foundation-outline-card">
              <img 
                src="/images/foundation/card_2.png" 
                alt="Card 2" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x360?text=Card+2+Image'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '39px', display: 'block' }}
              />
            </div>
            <div className="foundation-outline-card">
              <img 
                src="/images/foundation/card_3.png" 
                alt="Card 3" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x360?text=Card+3+Image'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '39px', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Who We Are Section */}
      <section className="foundation-content-section bg-white" id="who-we-are">
        <div className="foundation-section-container text-content">
          <p className="foundation-para">
            Saranga Anugraha Foundation was established with a clear purpose to bring authentic Ayurvedic healing and compassionate social support to people who truly need it but cannot afford it. In today's fast-paced world, many individuals suffer from chronic illnesses, stress, lifestyle disorders, and financial limitations that prevent them from accessing quality healthcare.
          </p>
          <p className="foundation-para">
            The foundation was born from the belief that healthcare should be a right, not a privilege. Ayurveda has the power to restore wellbeing naturally. No individual should be left helpless due to financial difficulties. The foundation is built on compassion, community support, and the values of traditional healing blended with modern care.
          </p>
          <p className="foundation-para">
            We are Saranga Ayurveda—a humble blend of tradition, care, and community. Rooted in ancient Ayurvedic wisdom and guided by the rhythms of nature, we craft wellness solutions that speak to real people and real lives. We're not here just to offer products. We're here to share a way of living—one that honors balance, celebrates connection, and restores harmony in everyday moments. With every herb we source and every remedy we create, our purpose is simple: to help you feel seen, supported, and whole. Because true wellness is not just about healing the body—it's about nurturing the mind, uplifting the spirit, and reconnecting with nature.
          </p>
          <p className="foundation-para-bold">
            This is us. And we're here for you—naturally.
          </p>
        </div>
      </section>

      {/* 4. Donate Section */}
      <section className="foundation-content-section bg-beige" id="donate-section">
        <div className="donate-container">
          <div className="donate-badge">
            <span>Our Impact</span>
          </div>
          <h2 className="donate-heading">Together, We're Making<br />A Difference</h2>
          
          <div className="donate-card" style={{ marginTop: '40px' }}>
            <h3 className="donate-card-title">Choose amount</h3>
            
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

            <div className="donate-form-fields">
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

            <div className="donate-actions">
              <button className="donate-submit-btn" onClick={handleDonate} disabled={loading}>
                {loading ? 'PROCESSING...' : 'DONATE'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. News & Events Section */}
      <section className="foundation-content-section bg-white" id="news-events">
        <div className="foundation-section-container">
          <div className="foundation-green-badge">
            <span>Updates</span>
          </div>
          <h2 className="foundation-section-heading">
            Our Latest Initiatives<br />And Community Work
          </h2>
          <div className="foundation-events-grid">
            {events.map((event) => (
              <div key={event.id} className="foundation-event-card">
                <span className="event-date">{event.date}</span>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Get Involved Section */}
      <section className="foundation-content-section bg-beige" id="get-involved">
        <div className="foundation-section-container">
          <div className="foundation-orange-badge">
            <span>Take Action</span>
          </div>
          <h2 className="foundation-section-heading">
            Join Us In Making<br />A Difference
          </h2>
          <div className="foundation-actions-row">
            <button className="foundation-volunteer-btn" onClick={() => alert('Thank you for your interest! We will contact you soon.')}>
              VOLUNTEER NOW
            </button>
            <button onClick={() => handleScroll('donate-section')} className="foundation-help-link-btn">
              <span>DONATE NOW</span>
              <span className="foundation-arrow-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
