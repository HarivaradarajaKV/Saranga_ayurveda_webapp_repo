import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { q: 'How long is shipping?', a: 'Orders typically ship within 2-5 business days.' },
  { q: 'Can I return a product?', a: 'Yes, within 7 days of delivery in unused condition.' },
  { q: 'How do I contact support?', a: 'Email us at sarangaconsumershelp@gmail.com.' },
];

export default function FAQs() {
  const [open, setOpen] = useState(null);
  return (
    <div className="page-content page-fade-in">
      <div className="container-sm">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Frequently Asked Questions</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 10 }}>Everything you need to know about Saranga Ayurveda</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="card" style={{ overflow: 'hidden' }}>
              <button
                style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span style={{ fontWeight: 600, color: 'var(--text)', flex: 1, marginRight: 12 }}>{faq.q}</span>
                {open === i ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </button>
              {open === i && (
                <div style={{ padding: '0 20px 18px', color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
