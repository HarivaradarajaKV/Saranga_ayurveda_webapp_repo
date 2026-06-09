import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    q: 'Are your products suitable for daily use?',
    a: 'Most Saranga Ayurveda products are designed for regular use as directed on the product label. However, individual preferences and sensitivities may vary. We recommend reviewing the ingredient list and usage instructions before use.'
  },
  {
    q: 'Do you provide personalized consultations?',
    a: 'Yes. If you contact us via email with your concerns, questions, or wellness goals, our team will first review the information you provide. Depending on the nature of your query, we may recommend a personalized one-to-one consultation through a video call (such as Zoom or similar platforms) or an in-person meeting, wherever available.\nThis approach helps us better understand your individual requirements and provide more accurate guidance and recommendations. Please note that consultation appointments may be subject to availability and may require prior scheduling.'
  },
  {
    q: 'How long does it take to see results from Saranga Ayurveda products?',
    a: 'The time required to experience results may vary from person to person depending on factors such as age, lifestyle, diet, consistency of use, and individual body responses.\nAyurveda focuses on supporting the body’s natural balance and well-being through a gradual and holistic approach. Unlike some products that may offer temporary or immediate effects, Ayurvedic formulations are generally designed to deliver their benefits through regular and consistent use over time.\nFor best results, we recommend using the product as directed and maintaining consistency in your wellness routine. Individual experiences may vary, and some users may notice benefits sooner than others.'
  },
  {
    q: 'Are all Saranga Ayurveda products 100% herbal?',
    a: 'At Saranga Ayurveda, we strive to harness the goodness of nature in every formulation. Many of our ingredients are derived from herbs, plants, and other naturally sourced materials. However, not all products are 100% herbal.\nIn certain products, a small number of carefully selected ingredients, including approved cosmetic or functional ingredients, may be used where necessary to ensure product safety, stability, effectiveness, texture, shelf life, and overall quality. These ingredients are chosen responsibly and only when they serve an important purpose in the formulation.\nOur commitment is to combine the wisdom of Ayurveda with modern scientific standards, using high-quality ingredients from natural and other trusted sources to create products that are safe, effective, and reliable for our customers.'
  },
  {
    q: 'Can I partner with Saranga Ayurveda and open an outlet in my city?',
    a: 'Yes. We welcome partnership opportunities from individuals, entrepreneurs, distributors, healthcare professionals, and businesses who share our vision of promoting Ayurveda and natural wellness.\nIf you are interested in establishing a Saranga Ayurveda outlet, distribution center, experience store, or other business partnership in your city, please contact us with details about your location, business background, and proposal. Our team will review your application and discuss available partnership models, eligibility requirements, investment considerations, and support options.\nPlease note that all partnership requests are subject to Saranga Ayurveda’s evaluation process, market feasibility assessments, and approval criteria.'
  }
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
                <div style={{ padding: '0 20px 18px', color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
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
