import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, User, ChevronDown, ChevronUp, Send, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCode: '+91',
    phoneNumber: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.subject) newErrors.subject = 'Please choose a subject.';
    if (!formData.message.trim()) newErrors.message = 'Message is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setTimeout(() => {
        setSubmitted(true);
      }, 500);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneCode: '+91',
      phoneNumber: '',
      subject: '',
      message: ''
    });
    setErrors({});
    setSubmitted(false);
  };

  const faqs = [
    {
      question: "What are your store hours?",
      answer: "Our online customer assistance desk is available Monday to Sunday from 10:00 AM to 05:00 PM (IST). Product delivery and processing runs 24/7."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we ship all across India. International orders are handled individually by our operations desk. Please email us for international deliveries."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order live from the 'My Orders' section in your account profile, or using the tracking number emailed to you upon dispatch."
    },
    {
      question: "Do you offer consultations?",
      answer: "Yes! We host wellness consultations with experienced Ayurvedic practitioners. You can book an appointment by selecting 'Consultation Booking' in our contact form or by messaging us on WhatsApp."
    }
  ];

  return (
    <div className="contact-page">
      <div className="contact-container">
        
        {/* Breadcrumbs */}
        <div className="contact-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <span className="active">Contact Us</span>
        </div>

        {/* Hero Section */}
        <div className="contact-section contact-hero-section">
          <div className="contact-text-col">
            <div className="contact-section-label">CONTACT US</div>
            <h1 className="contact-section-title font-serif-main">
              We're Here to<br />Help You
            </h1>
            <div className="contact-heart-separator">
              <span className="contact-heart-line"></span>
              <span className="contact-heart-icon">♥</span>
              <span className="contact-heart-line"></span>
            </div>
            <p className="contact-section-paragraph hero-para">
              Have a question, need guidance, or simply want to connect?<br />
              We'd love to hear from you.
            </p>
          </div>
          <div className="contact-img-col">
            <div className="contact-image-wrapper">
              <img src="/images/contact-hero.png" alt="Elegant minimal white vase with leafy green branches on wooden tray" />
            </div>
          </div>
        </div>

        {/* Middle Form and Info Layout */}
        <div className="contact-layout-grid">
          
          {/* Left Column: Ways to Reach Us */}
          <div className="ways-to-reach-col">
            <div className="ways-to-reach-card">
              <div className="contact-section-label">
                <span>WAYS TO REACH US</span>
                <div className="label-underline"></div>
              </div>

              <div className="reach-methods-grid">
                
                {/* Method 1: Phone */}
                <div className="reach-method-item">
                  <div className="reach-icon-wrap">
                    <Phone size={20} strokeWidth={1.5} />
                  </div>
                  <h5>CALL US</h5>
                  <p className="reach-primary">+91 96112 00444</p>
                  <p className="reach-secondary">Mon - Sat</p>
                  <p className="reach-secondary">10:00 AM – 6:00 PM (IST)</p>
                </div>

                {/* Method 2: Email */}
                <div className="reach-method-item">
                  <div className="reach-icon-wrap">
                    <Mail size={20} strokeWidth={1.5} />
                  </div>
                  <h5>EMAIL US</h5>
                  <p className="reach-primary mail-link">hello@sarangaayurveda.com</p>
                  <p className="reach-secondary">We reply within</p>
                  <p className="reach-secondary">24 business hours</p>
                </div>

                {/* Method 3: Location */}
                <div className="reach-method-item">
                  <div className="reach-icon-wrap">
                    <MapPin size={20} strokeWidth={1.5} />
                  </div>
                  <h5>VISIT US</h5>
                  <p className="reach-primary">Saranga Ayurveda</p>
                  <p className="reach-secondary">Kerala, India</p>
                  <p className="reach-secondary">By appointment only</p>
                </div>

                {/* Method 4: WhatsApp */}
                <div className="reach-method-item">
                  <div className="reach-icon-wrap">
                    <WhatsAppIcon className="reach-svg-icon" />
                  </div>
                  <h5>WHATSAPP</h5>
                  <p className="reach-primary">Chat with us on WhatsApp</p>
                  <p className="reach-secondary">+91 96112 00444</p>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Send Us A Message Form */}
          <div className="contact-form-col">
            {!submitted ? (
              <form className="contact-form-card" onSubmit={handleSubmit}>
                <div className="contact-section-label">
                  <span>SEND US A MESSAGE</span>
                  <div className="label-underline"></div>
                </div>

                {/* Full Name & Email Address Row */}
                <div className="form-row-2col">
                  <div className="form-group">
                    <label>Full Name <span className="req">*</span></label>
                    <div className="input-with-icon">
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name" 
                        className={errors.fullName ? 'input-error' : ''}
                      />
                      <User size={18} className="input-icon" />
                    </div>
                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Email Address <span className="req">*</span></label>
                    <div className="input-with-icon">
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email" 
                        className={errors.email ? 'input-error' : ''}
                      />
                      <Mail size={18} className="input-icon" />
                    </div>
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>

                {/* Phone Number & Subject Row */}
                <div className="form-row-2col">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="phone-input-group">
                      <div className="select-wrap phone-code-select">
                        <select 
                          name="phoneCode" 
                          value={formData.phoneCode}
                          onChange={handleInputChange}
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+971">+971</option>
                        </select>
                        <ChevronDown size={14} className="select-arrow" />
                      </div>
                      <div className="input-with-icon phone-number-input">
                        <input 
                          type="tel" 
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number" 
                        />
                        <Phone size={18} className="input-icon" />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Subject <span className="req">*</span></label>
                    <div className="select-wrap">
                      <select 
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={errors.subject ? 'input-error' : ''}
                      >
                        <option value="">Choose a subject</option>
                        <option value="General">General Inquiry</option>
                        <option value="Product">Product Support</option>
                        <option value="Order">Order Status</option>
                        <option value="Consultation">Consultation Booking</option>
                        <option value="Feedback">Feedback</option>
                      </select>
                      <ChevronDown size={16} className="select-arrow" />
                    </div>
                    {errors.subject && <span className="error-text">{errors.subject}</span>}
                  </div>
                </div>

                {/* Message */}
                <div className="form-group">
                  <label>Message <span className="req">*</span></label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Type your message here.."
                    rows={4}
                    className={errors.message ? 'input-error' : ''}
                  />
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                {/* Submit button */}
                <button type="submit" className="contact-submit-btn">
                  SEND MESSAGE <Send size={14} style={{ marginLeft: '8px' }} />
                </button>

                <div className="form-privacy-note">
                  <ShieldCheck size={16} className="privacy-shield-icon" />
                  <span>Your information is safe with us. We respect your privacy.</span>
                </div>
              </form>
            ) : (
              <div className="contact-success-card">
                <CheckCircle2 className="success-check-icon" />
                <h2>Message Sent Successfully!</h2>
                <p>
                  Thank you, <strong>{formData.fullName}</strong>. We have received your query regarding <strong>{formData.subject}</strong>.
                </p>
                <p className="success-subtext">
                  Our customer care team will review your message and reply back to you at <strong>{formData.email}</strong> within 24 hours.
                </p>
                <button className="reset-contact-btn" onClick={resetForm}>
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Banner Section: Quick Answers & Call To Action */}
        <div className="contact-bottom-section">
          
          {/* Card 1: FAQ Section */}
          <div className="contact-faq-card">
            <div className="contact-section-label">
              <span>QUICK ANSWERS</span>
              <div className="label-underline"></div>
            </div>

            <div className="contact-accordion-list">
              {faqs.map((faq, index) => (
                <div key={index} className={`contact-accordion-item ${activeFaq === index ? 'active' : ''}`}>
                  <button className="accordion-header" onClick={() => toggleFaq(index)}>
                    <span>{faq.question}</span>
                    {activeFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <div className="accordion-body">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Mortar and Pestle Image */}
          <div className="contact-faq-image">
            <img src="/images/contact-faq.png" alt="Amla herbs in white mortar and pestle" />
          </div>

          {/* Card 2: Still have questions? & Brand Statement */}
          <div className="contact-cta-wrapper">
            
            {/* Still have questions? Card */}
            <div className="still-questions-card">
              <div className="still-icon-wrap">
                <LeafIcon />
              </div>
              <h4>Still have questions?</h4>
              <p>Our team is happy to assist you on your wellness journey.</p>
              <a 
                href="https://wa.me/919611200444" 
                target="_blank" 
                rel="noreferrer"
                className="whatsapp-btn"
              >
                CHAT WITH US ON WHATSAPP <WhatsAppIcon className="whatsapp-btn-icon" />
              </a>
            </div>

            {/* Brand Quote Card */}
            <div className="contact-brand-card">
              <h3>Rooted in Ayurveda.<br />Made for You.</h3>
              <div className="contact-heart-separator">
                <span className="contact-heart-line"></span>
                <span className="contact-heart-icon">♥</span>
                <span className="contact-heart-line"></span>
              </div>
              
              {/* Botanical leaves watermark positioned relative to block */}
              <div className="contact-brand-watermark">
                <img src="/images/watercolor-leaves-branch.png" alt="Decorative botanical leaves watermark" />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ── CUSTOM ICONS ──
function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.963L2 22l5.233-1.371a9.936 9.936 0 0 0 4.779 1.21c5.507 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.18-2.92-7.062A9.92 9.92 0 0 0 12.012 2zm5.835 14.165c-.255.715-1.507 1.309-2.072 1.393-.56.083-1.11.31-3.59-.714-2.99-1.233-4.912-4.28-5.061-4.48-.149-.2-.1.088 1.157-1.498a1.6 1.6 0 0 1 1.127-.525c.18 0 .348.009.5.021.154.012.348-.047.545.428.2.483.682 1.662.742 1.782.06.12.099.259.02.418-.08.159-.12.259-.24.398-.12.139-.25.309-.359.418-.12.12-.249.25-.109.489.139.239.617 1.015 1.328 1.649.915.816 1.688 1.069 1.928 1.189.239.12.378.099.518-.06.139-.159.617-.716.782-.956.164-.239.328-.199.547-.12.219.079 1.393.657 1.632.776.239.119.398.179.458.279.06.101.06.577-.195 1.292z" />
    </svg>
  );
}

function LeafIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2.5c0 2-1.5 5-4.6 8.8A7.05 7.05 0 0 1 11 20Z" />
      <path d="M19 2.5 12 11" />
    </svg>
  );
}
