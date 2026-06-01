function LegalPage({ title, children }) {
  return (
    <div className="legal-page page-fade-in">
      <div className="container-sm" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 32 }}>{title}</h1>
        <div style={{ lineHeight: 1.8, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Last updated: February 24, 2024</p>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>1. Information We Collect</h3><p>We collect information that you provide directly to us, including when you create an account, make a purchase, or contact us for support.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>2. How We Use Your Information</h3><p>We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>3. Information Sharing</h3><p>We do not sell your personal information. We may share your information with third-party service providers who assist us in operating our business.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>4. Data Security</h3><p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access or disclosure.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>5. Your Rights</h3><p>You have the right to access, correct, or delete your personal information. You can also opt out of marketing communications at any time.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>6. Contact Us</h3><p>If you have any questions about this Privacy Policy, please contact us at: paysarangaayurveda@gmail.com</p></div>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p>Last updated: February 24, 2024</p>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>1. Acceptance of Terms</h3><p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>2. Use License</h3><p>Permission is granted to temporarily download one copy of the application for personal, non-commercial transitory viewing only.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>3. Product Information</h3><p>We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions are accurate, complete, reliable, current, or error-free.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>4. User Account</h3><p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>5. Limitation of Liability</h3><p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>6. Changes to Terms</h3><p>We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page.</p></div>
    </LegalPage>
  );
}

export function ShippingPolicy() {
  return (
    <LegalPage title="Shipping Policy">
      <p>Last updated: February 24, 2024</p>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>1. Processing Time</h3><p>Orders are typically processed within 1-2 business days. During peak seasons, processing may take up to 3 business days.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>2. Shipping Methods</h3><p>We offer standard shipping (5-7 business days) and express shipping (2-3 business days).</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>3. Shipping Costs</h3><p>Standard shipping is free for orders over INR 500. Express shipping and international shipping rates are calculated at checkout.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>4. Order Tracking</h3><p>Once your order ships, you will receive a tracking number via email. You can also track your order in the app's order history.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>5. Delivery Issues</h3><p>If you experience any issues with delivery, please contact our customer service team within 48 hours of the expected delivery date.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>6. International Orders</h3><p>International customers are responsible for any customs duties, taxes, and fees associated with their order.</p></div>
    </LegalPage>
  );
}

export function RefundPolicy() {
  return (
    <LegalPage title="Refund Policy">
      <p>Last updated: February 24, 2024</p>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>1. Return Period</h3><p>We accept returns within 30 days of delivery for unused items in their original packaging with all tags attached.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>2. Return Process</h3><p>To initiate a return, please contact our customer service team through the app or email. You will receive a return shipping label and instructions.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>3. Refund Timeline</h3><p>Once we receive and inspect your return, we will process your refund within 5-7 business days. The refund will be issued to your original payment method.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>4. Non-Returnable Items</h3><p>For hygiene reasons, certain items such as opened cosmetics, personal care products, and intimate items cannot be returned unless defective.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>5. Damaged or Defective Items</h3><p>If you receive a damaged or defective item, please contact us within 48 hours of delivery. We will arrange a replacement or full refund.</p></div>
      <div><h3 style={{ color: 'var(--text)', marginBottom: 8 }}>6. Return Shipping</h3><p>Return shipping is free for defective items. For other returns, shipping costs may be deducted from your refund unless otherwise specified.</p></div>
    </LegalPage>
  );
}
