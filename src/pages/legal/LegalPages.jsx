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
    <LegalPage title="Terms & Conditions">
      <p>Last updated: June 9, 2026</p>
      <p>By accessing this website, creating an account, placing an order, or using any service offered by Saranga Ayurveda LLP, you agree to be bound by these Terms & Conditions.</p>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>1. Order Acceptance & Verification</h3>
        <p>All orders are subject to acceptance, verification, review, availability, operational feasibility, and compliance requirements.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>2. Right to Refuse or Cancel</h3>
        <p>The Company reserves the right to refuse, limit, postpone, hold, cancel, or review any order at its sole discretion where necessary for operational, security, legal, compliance, quality control, inventory management, or business reasons.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>3. Payment & Billing</h3>
        <p>Order processing commences following successful payment confirmation. Saranga Ayurveda LLP operates exclusively on a prepaid basis and does not offer Cash on Delivery services.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>4. Fulfillment & Operations</h3>
        <p>The Company reserves the right to determine processing schedules, dispatch priorities, inventory allocation procedures, packaging requirements, and fulfillment methods as deemed appropriate for business operations.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>5. Product Representations</h3>
        <p>Product images, descriptions, packaging, and representations displayed on the website are illustrative in nature. Minor variations in appearance, labeling, packaging design, or presentation shall not constitute defects.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>6. Force Majeure & Limitation of Liability</h3>
        <p>Saranga Ayurveda LLP shall not be liable for delays, interruptions, losses, or failures resulting from supplier issues, transportation disruptions, public emergencies, governmental actions, natural disasters, technical failures, labor shortages, logistics constraints, force majeure events, or other circumstances beyond its reasonable control.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>7. Total Liability Limit</h3>
        <p>To the maximum extent permitted by applicable law, the Company’s total liability relating to any order shall not exceed the amount paid by the customer for that specific order.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>8. Amendments & Updates</h3>
        <p>The Company reserves the right to amend, modify, suspend, replace, or update these Terms & Conditions, policies, procedures, and website content at any time without prior notice.</p>
      </div>
    </LegalPage>
  );
}

export function ShippingPolicy() {
  return (
    <LegalPage title="Shipping & Delivery Policy">
      <p>Last updated: June 9, 2026</p>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>1. Operational Flow</h3>
        <p>At Saranga Ayurveda LLP, every order undergoes multiple operational stages including order verification, processing, inventory allocation, quality assurance, packaging, dispatch preparation, and logistics coordination prior to shipment.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>2. Order Processing Sequence</h3>
        <p>Orders are processed in the sequence in which they are received, subject to operational capacity, product availability, quality control requirements, regulatory compliance checks, seasonal demand fluctuations, logistics constraints, and other business considerations.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>3. Timeline Estimations</h3>
        <p>Customers acknowledge that dispatch and delivery timelines displayed on the website are estimates only and shall not be construed as guaranteed delivery commitments.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>4. Processing Schedules</h3>
        <p>While most orders are ordinarily processed within approximately 10–15 working days, certain orders may require additional processing time depending upon operational requirements, production schedules, quality assurance procedures, inventory management considerations, transportation availability, force majeure events, supplier delays, public holidays, or circumstances beyond the Company’s reasonable control.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>5. Dispatch Rights</h3>
        <p>Saranga Ayurveda LLP reserves the right to determine the appropriate processing and dispatch timeline for any order.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>6. Logistics & Third-Party Delay</h3>
        <p>Delivery dates provided by courier partners are estimates only. The Company shall not be responsible for delays occurring after shipment has been handed over to third-party logistics providers.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>7. Delays Acceptability</h3>
        <p>Customers agree that reasonable delays in processing, dispatch, transportation, or delivery shall not constitute grounds for cancellation, compensation, damages, chargebacks, penalties, or legal claims against the Company.</p>
      </div>
    </LegalPage>
  );
}

export function RefundPolicy() {
  return (
    <LegalPage title="Return, Cancellation & Refund Policy">
      <p>Last updated: June 9, 2026</p>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>1. Order Verification & Processing</h3>
        <p>All orders are subject to verification, processing, inventory allocation, packaging, and dispatch procedures immediately following successful payment confirmation.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>2. Order Cancellation Limits</h3>
        <p>Once an order enters the processing stage, cancellation requests may not be accepted.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>3. Modification Restrictions</h3>
        <p>Requests for modification of products, quantities, shipping information, or other order details may not be possible after order confirmation.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>4. Customer Review Checklist</h3>
        <p>Customers are encouraged to carefully review all order details before completing payment.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>5. Case-by-Case Review</h3>
        <p>Returns, exchanges, replacements, and cancellations are reviewed on a case-by-case basis and solely at the discretion of Saranga Ayurveda LLP, subject to applicable law.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>6. Delays & Refund Restrictions</h3>
        <p>Refunds shall not ordinarily be issued for delays arising from processing requirements, quality assurance procedures, logistics constraints, courier delays, public holidays, force majeure events, or circumstances beyond the Company’s reasonable control.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>7. Payment Method Validation</h3>
        <p>Approved refunds, if any, shall be processed through the original payment method after applicable verification procedures and administrative review.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>8. Non-Refundable Costs</h3>
        <p>Shipping charges, payment gateway charges, processing fees, handling charges, and similar costs are generally non-refundable.</p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>9. Policy Compliance</h3>
        <p>Saranga Ayurveda LLP reserves the right to refuse any refund, return, replacement, exchange, or cancellation request that does not comply with this policy or applicable law.</p>
      </div>
    </LegalPage>
  );
}
