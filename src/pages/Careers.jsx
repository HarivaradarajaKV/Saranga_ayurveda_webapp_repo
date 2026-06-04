import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, GraduationCap, Heart, Sprout, Globe, 
  UploadCloud, FileText, CheckCircle2, ChevronDown 
} from 'lucide-react';
import './Careers.css';

export default function Careers() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCode: '+91',
    phoneNumber: '',
    college: '',
    degree: '',
    fieldInterest: '',
    semester: '',
    about: '',
    agreed: false
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const resumeInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [type]: 'File size exceeds 5MB limit.' }));
        return;
      }
      if (type === 'resume') {
        setResumeFile(file);
      } else {
        setCoverFile(file);
      }
      setErrors(prev => ({ ...prev, [type]: '' }));
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
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number.';
    }
    if (!formData.college.trim()) newErrors.college = 'College/University is required.';
    if (!formData.degree) newErrors.degree = 'Please select your degree/course.';
    if (!formData.fieldInterest) newErrors.fieldInterest = 'Please select a field of interest.';
    if (!formData.semester) newErrors.semester = 'Please select your semester/year.';
    if (!resumeFile) newErrors.resume = 'Resume/CV upload is required.';
    if (!formData.about.trim()) newErrors.about = 'Please share a brief paragraph about yourself.';
    if (!formData.agreed) newErrors.agreed = 'You must agree to the Terms & Conditions.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate API submission
      setTimeout(() => {
        setSubmitted(true);
      }, 500);
    } else {
      // Scroll to the first error
      const firstError = document.querySelector('.error-text');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneCode: '+91',
      phoneNumber: '',
      college: '',
      degree: '',
      fieldInterest: '',
      semester: '',
      about: '',
      agreed: false
    });
    setResumeFile(null);
    setCoverFile(null);
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="careers-page">
      <div className="careers-container">
        
        {/* Breadcrumbs */}
        <div className="careers-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <span className="active">Careers</span>
        </div>

        {/* Hero Section */}
        <div className="careers-section careers-hero-section">
          <div className="careers-text-col">
            <div className="careers-section-label">INTERNSHIP AT SARANGA</div>
            <h1 className="careers-section-title font-serif-main">
              Learn. Grow.<br />Make a Difference.
            </h1>
            <div className="careers-heart-separator">
              <span className="careers-heart-line"></span>
              <span className="careers-heart-icon">♥</span>
              <span className="careers-heart-line"></span>
            </div>
            <p className="careers-section-paragraph hero-para">
              At Saranga Ayurveda, we believe in nurturing curious minds and passionate hearts. Our internship program offers a unique opportunity to learn from experts, work on meaningful projects, and contribute to natural wellness and holistic living.
            </p>
            <button 
              className="explore-internships-btn"
              onClick={() => document.getElementById('apply-form-section').scrollIntoView({ behavior: 'smooth' })}
            >
              EXPLORE INTERNSHIPS
            </button>
          </div>
          {/* Hidden on desktop, shown on mobile */}
          <div className="careers-img-col hero-img-col">
            <div className="careers-image-wrapper">
              <img src="/images/about-hero.png" alt="Mortar and pestle" />
            </div>
          </div>
        </div>

        {/* Form and Why Intern With Us layout */}
        <div className="careers-layout-grid" id="apply-form-section">
          
          {/* Left Column: Why Intern With Us */}
          <div className="why-intern-col">
            <div className="careers-section-label">
              <span>WHY INTERN WITH US?</span>
              <div className="label-underline"></div>
            </div>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon-wrap">
                  <LeafIcon className="feature-svg-icon" />
                </div>
                <div className="feature-info">
                  <h4>Hands-On Learning</h4>
                  <p>Gain practical experience in Ayurveda, wellness, and natural product development.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrap">
                  <MentorshipIcon className="feature-svg-icon" />
                </div>
                <div className="feature-info">
                  <h4>Mentorship & Guidance</h4>
                  <p>Learn directly from industry experts and experienced mentors.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrap">
                  <BowlIcon className="feature-svg-icon" />
                </div>
                <div className="feature-info">
                  <h4>Real Impact</h4>
                  <p>Work on meaningful projects that create positive impact on health and society.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrap">
                  <SproutIcon className="feature-svg-icon" />
                </div>
                <div className="feature-info">
                  <h4>Growth & Development</h4>
                  <p>Enhance your skills, expand your knowledge, and grow your career with us.</p>
                </div>
              </div>
            </div>

            {/* Book Image wrapper */}
            <div className="book-image-wrapper">
              <img src="/images/careers-book.png" alt="Charaka Samhita text book with amlas" />
            </div>
          </div>

          {/* Right Column: Application Form Card */}
          <div className="form-card-col">
            {!submitted ? (
              <form className="application-form-card" onSubmit={handleSubmit}>
                <div className="careers-section-label">
                  <span>APPLY FOR INTERNSHIP</span>
                  <div className="label-underline"></div>
                </div>
                
                <h2 className="form-card-title">We'd Love to Hear From You</h2>
                <p className="form-card-subtitle">
                  Fill out the form below to apply for an internship opportunity at Saranga Ayurveda.
                </p>

                {/* Full Name */}
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

                {/* Email Address */}
                <div className="form-group">
                  <label>Email Address <span className="req">*</span></label>
                  <div className="input-with-icon">
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address" 
                      className={errors.email ? 'input-error' : ''}
                    />
                    <Mail size={18} className="input-icon" />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label>Phone Number <span className="req">*</span></label>
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
                        className={errors.phoneNumber ? 'input-error' : ''}
                      />
                      <Phone size={18} className="input-icon" />
                    </div>
                  </div>
                  {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                </div>

                {/* College / University */}
                <div className="form-group">
                  <label>College / University <span className="req">*</span></label>
                  <input 
                    type="text" 
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    placeholder="Enter your college or university" 
                    className={errors.college ? 'input-error' : ''}
                  />
                  {errors.college && <span className="error-text">{errors.college}</span>}
                </div>

                {/* Degree / Course */}
                <div className="form-group">
                  <label>Degree / Course <span className="req">*</span></label>
                  <div className="select-wrap">
                    <select 
                      name="degree"
                      value={formData.degree}
                      onChange={handleInputChange}
                      className={errors.degree ? 'input-error' : ''}
                    >
                      <option value="">Select your degree or course</option>
                      <option value="BAMS">BAMS (Ayurveda)</option>
                      <option value="MD_MS">MD / MS (Ayurveda)</option>
                      <option value="BSc">Bachelor of Science (B.Sc.)</option>
                      <option value="MSc">Master of Science (M.Sc.)</option>
                      <option value="BTech_MTech">B.Tech / M.Tech</option>
                      <option value="BBA_MBA">BBA / MBA</option>
                      <option value="Other">Other Degree</option>
                    </select>
                    <ChevronDown size={16} className="select-arrow" />
                  </div>
                  {errors.degree && <span className="error-text">{errors.degree}</span>}
                </div>

                {/* Field of Interest */}
                <div className="form-group">
                  <label>Field of Interest <span className="req">*</span></label>
                  <div className="select-wrap">
                    <select 
                      name="fieldInterest"
                      value={formData.fieldInterest}
                      onChange={handleInputChange}
                      className={errors.fieldInterest ? 'input-error' : ''}
                    >
                      <option value="">Select your area of interest</option>
                      <option value="Formulations">Product Development & Formulations</option>
                      <option value="Research">Ayurvedic Clinical Research</option>
                      <option value="Marketing">Marketing & Social Branding</option>
                      <option value="Operations">Supply Chain & Operations</option>
                      <option value="Design">UX/UI Design & Creative Content</option>
                      <option value="HR">Human Resources</option>
                    </select>
                    <ChevronDown size={16} className="select-arrow" />
                  </div>
                  {errors.fieldInterest && <span className="error-text">{errors.fieldInterest}</span>}
                </div>

                {/* Semester / Year */}
                <div className="form-group">
                  <label>Semester / Year <span className="req">*</span></label>
                  <div className="select-wrap">
                    <select 
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      className={errors.semester ? 'input-error' : ''}
                    >
                      <option value="">Select semester or year</option>
                      <option value="Year 1">1st Year</option>
                      <option value="Year 2">2nd Year</option>
                      <option value="Year 3">3rd Year</option>
                      <option value="Year 4">4th Year</option>
                      <option value="Final Intern">Final Year / Intern</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                    <ChevronDown size={16} className="select-arrow" />
                  </div>
                  {errors.semester && <span className="error-text">{errors.semester}</span>}
                </div>

                {/* Upload Section - Side by Side */}
                <div className="uploads-row">
                  <div className="form-group upload-group">
                    <label>Resume/CV <span className="req">*</span></label>
                    <div 
                      className={`upload-zone ${errors.resume ? 'zone-error' : ''} ${resumeFile ? 'zone-success' : ''}`}
                      onClick={() => resumeInputRef.current?.click()}
                    >
                      <UploadCloud size={24} className="upload-icon" />
                      <span className="upload-text">
                        {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
                      </span>
                      <span className="upload-format">PDF, DOC, DOCX (Max. 5MB)</span>
                      <input 
                        type="file" 
                        ref={resumeInputRef}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'resume')}
                      />
                    </div>
                    {errors.resume && <span className="error-text">{errors.resume}</span>}
                  </div>

                  <div className="form-group upload-group">
                    <label>Cover Letter (Optional)</label>
                    <div 
                      className={`upload-zone ${coverFile ? 'zone-success' : ''}`}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <UploadCloud size={24} className="upload-icon" />
                      <span className="upload-text">
                        {coverFile ? coverFile.name : 'Click to upload or drag and drop'}
                      </span>
                      <span className="upload-format">PDF, DOC, DOCX (Max. 5MB)</span>
                      <input 
                        type="file" 
                        ref={coverInputRef}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'cover')}
                      />
                    </div>
                  </div>
                </div>

                {/* Tell us about yourself */}
                <div className="form-group">
                  <label>Tell us about yourself <span className="req">*</span></label>
                  <textarea 
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    placeholder="Share your background, interests and why you want to intern with us..."
                    rows={4}
                    className={errors.about ? 'input-error' : ''}
                  />
                  {errors.about && <span className="error-text">{errors.about}</span>}
                </div>

                {/* Agree checkbox */}
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      name="agreed"
                      checked={formData.agreed}
                      onChange={handleInputChange}
                    />
                    <span>
                      I agree to the <Link to="/legal/terms" className="form-link">Terms & Conditions</Link> and <Link to="/legal/privacy-policy" className="form-link">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.agreed && <span className="error-text" style={{ display: 'block', marginTop: '4px' }}>{errors.agreed}</span>}
                </div>

                {/* Submit button */}
                <button type="submit" className="submit-application-btn">
                  SUBMIT APPLICATIONS
                </button>
              </form>
            ) : (
              <div className="application-success-card">
                <CheckCircle2 className="success-check-icon" />
                <h2>Application Submitted Successfully!</h2>
                <p>
                  Thank you, <strong>{formData.fullName}</strong>. We have received your application for the internship program at Saranga Ayurveda.
                </p>
                <p className="success-subtext">
                  Our review team will look over your details and resume. We will get in touch with you at <strong>{formData.email}</strong> soon.
                </p>
                <button className="reset-application-btn" onClick={resetForm}>
                  SUBMIT ANOTHER APPLICATION
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Who Can Apply Section */}
        <div className="who-can-apply-section">
          <div className="who-can-apply-content">
            <div className="careers-section-label">WHO CAN APPLY?</div>
            <h2 className="who-can-apply-title">We welcome passionate and curious individuals who:</h2>
            
            <div className="qualifications-grid">
              <div className="qual-card">
                <div className="qual-icon-wrap">
                  <GraduationCap size={22} strokeWidth={1.5} />
                </div>
                <p>
                  Are pursuing a degree in relevant fields (Ayurveda, Life Sciences, Marketing, Design, Operations, and more).
                </p>
              </div>

              <div className="qual-card">
                <div className="qual-icon-wrap">
                  <Heart size={22} strokeWidth={1.5} />
                </div>
                <p>
                  Have a strong interest in Ayurveda, wellness, and natural living.
                </p>
              </div>

              <div className="qual-card">
                <div className="qual-icon-wrap">
                  <Sprout size={22} strokeWidth={1.5} />
                </div>
                <p>
                  Are eager to learn, contribute, and grow in a collaborative environment.
                </p>
              </div>

              <div className="qual-card">
                <div className="qual-icon-wrap">
                  <Globe size={22} strokeWidth={1.5} />
                </div>
                <p>
                  Want to make a difference through meaningful and sustainable work.
                </p>
              </div>
            </div>
          </div>
          
          {/* Leaf Watermark */}
          <div className="who-can-apply-watermark">
            <img src="/images/watercolor-leaves-branch.png" alt="Decorative botanical leaves watermark" />
          </div>
        </div>

      </div>
    </div>
  );
}

// ── CUSTOM BOTANICAL SVG ICONS FOR BULLETS ──
function LeafIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2.5c0 2-1.5 5-4.6 8.8A7.05 7.05 0 0 1 11 20Z" />
      <path d="M19 2.5 12 11" />
    </svg>
  );
}

function MentorshipIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BowlIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12a10 10 0 0 0 20 0H2Z" />
      <path d="M5 12V8h14v4" />
      <path d="M9 8V4h6v4" />
      <path d="m11 4 2-2" />
    </svg>
  );
}

function SproutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 20h10" />
      <path d="M12 20v-8" />
      <path d="M12 14a6 6 0 0 0-6-6H4" />
      <path d="M12 12a6 6 0 0 1 6-6h2" />
    </svg>
  );
}
