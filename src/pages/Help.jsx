import { Link } from 'react-router-dom';
import { useScrollToFooter } from '../hooks/useScrollToFooter';

export default function Help() {
  const scrollToFooter = useScrollToFooter();
  const topics = [
    { title: 'Contact Us', desc: 'Reach our team for personalized assistance', onClick: scrollToFooter },
    { title: 'FAQs', desc: 'Quick answers to common questions', link: '/faqs' },
    { title: 'Shipping Information', desc: 'Track orders, delivery times, and shipping info', link: '/legal/shipping' },
    { title: 'Return/Refund Policy', desc: 'Our return policy and how to initiate', link: '/legal/refund' },
  ];
  return (
    <div className="help-page page-fade-in" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div className="container-sm">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Help Center</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 10 }}>Find answers and get support</p>
        </div>
        <div className="grid-2">
          {topics.map((t, i) => (
            t.onClick ? (
              <div key={i} onClick={t.onClick} className="card card-body" style={{ display: 'block', cursor: 'pointer' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: 8 }}>{t.title}</h3>
                <p style={{ fontSize: '0.88rem' }}>{t.desc}</p>
              </div>
            ) : (
              <Link key={i} to={t.link} className="card card-body" style={{ display: 'block' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: 8 }}>{t.title}</h3>
                <p style={{ fontSize: '0.88rem' }}>{t.desc}</p>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
