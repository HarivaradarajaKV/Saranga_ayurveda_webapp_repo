import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Moon, Sun, ArrowLeft, Info, Sparkles } from 'lucide-react';

export default function Settings() {
  const [theme, setTheme] = useState('light');
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  const applyTheme = (mode) => {
    if (mode === 'dark') {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);
      return; // Do not actually set it as dark mode is coming soon
    }
    setTheme(mode);
    localStorage.setItem('app_theme', mode);
  };

  return (
    <div className="page-content page-fade-in profile-bg">
      <div className="container-sm">
        <Link to="/profile" className="btn btn-ghost btn-sm mb-16"><ArrowLeft size={16} /> Back to Profile</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <SettingsIcon size={28} color="var(--primary)" />
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', margin: 0 }}>Settings</h1>
        </div>

        <div className="card card-body" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Sun size={24} color="var(--primary)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Theme</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Choose your appearance</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button 
              className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => applyTheme('light')}
            >
              <Sun size={18} /> Light
            </button>
            <button 
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => applyTheme('dark')}
            >
              <Moon size={18} /> Dark
            </button>
          </div>

          {showSparkles && (
            <div style={{ 
              background: 'var(--surface)', 
              padding: 20, 
              borderRadius: 12, 
              border: '1px solid var(--border)',
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ background: '#fff5d7', padding: 8, borderRadius: '50%', color: 'var(--primary)', flexShrink: 0 }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>Lights out. Magic on.</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  The Dark Theme is about to drop — sleeker, smoother, and cooler than ever. Get ready to experience your screen like never before.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Info size={20} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current: Light Mode</span>
        </div>
      </div>
    </div>
  );
}
