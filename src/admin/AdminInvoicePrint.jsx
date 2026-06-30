import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { Printer, ArrowLeft, Mail, FileDown } from 'lucide-react';
import './Invoices.css';

export default function AdminInvoicePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      toast.show('Failed to fetch invoice details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const token = localStorage.getItem('auth_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const downloadUrl = `${baseUrl}/admin/invoices/${id}/pdf?Authorization=Bearer ${token}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.setAttribute('download', `Invoice_${invoice?.invoice_number}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmailPDF = async () => {
    const email = window.prompt('Enter customer email to send invoice:', invoice?.customer_email || '');
    if (!email) return;

    try {
      toast.show('Sending invoice email...', 'info');
      await api.post(`/admin/invoices/${id}/email`, { email });
      toast.show(`Invoice emailed successfully to ${email}`, 'success');
    } catch (err) {
      toast.show('Failed to email invoice PDF', 'error');
    }
  };

  // Group items by GST percentage to show GST Slab Summary
  const getGstSlabSummary = () => {
    if (!invoice || !invoice.items) return {};
    const slabs = {};
    invoice.items.forEach(item => {
      const rate = parseFloat(item.gst_percentage);
      if (!slabs[rate]) {
        slabs[rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
      }
      const taxable = parseFloat(item.taxable_amount);
      const gstAmt = parseFloat(item.gst_amount);
      
      slabs[rate].taxable += taxable;
      if (parseFloat(invoice.igst) > 0) {
        slabs[rate].igst += gstAmt;
      } else {
        slabs[rate].cgst += (gstAmt / 2);
        slabs[rate].sgst += (gstAmt / 2);
      }
      slabs[rate].total += gstAmt;
    });
    return slabs;
  };

  const formatExpiry = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).substring(2)}`;
  };

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  if (!invoice) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Invoice not found</div>;
  }

  const slabs = getGstSlabSummary();

  return (
    <div className="page-fade-in" style={{ paddingBottom: 50 }}>
      {/* Top action header (hidden during printing) */}
      <div className="admin-page-header no-print" style={{ maxWidth: '210mm', margin: '0 auto 20px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => navigate('/admin/invoices')}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="admin-page-title" style={{ fontSize: '1.25rem' }}>Invoice Preview</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleDownloadPDF}>
            <FileDown size={16} /> Download PDF
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Invoice (A4)
          </button>
        </div>
      </div>

      {/* Target Air Lifesciences Printable Invoice Frame */}
      <div className="air-lifesciences-invoice">
        <div className="air-invoice-header">
          {/* Title */}
          <div className="air-invoice-title">TAX INVOICE</div>
          
          {/* Company vs Customer detail columns */}
          <div className="air-invoice-address-grid">
            {/* Left Column: Company */}
            <div className="air-grid-column">
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>{invoice.company_name.toUpperCase()}</div>
              <div>{invoice.company_address1}</div>
              {invoice.company_address2 && <div>{invoice.company_address2}</div>}
              <div>{invoice.company_city}, {invoice.company_state} - {invoice.company_pincode}</div>
              <div style={{ marginTop: '4px' }}>Phone: {invoice.company_phone}</div>
              <div>Email: {invoice.company_email}</div>
              <div style={{ marginTop: '8px', fontWeight: 'bold' }}>GSTIN: {invoice.company_gst}</div>
              <div>DL #: {invoice.company_dl || 'N/A'}</div>
            </div>

            {/* Vertical Divider */}
            <div className="air-divider-vertical"></div>

            {/* Right Column: Customer */}
            <div className="air-grid-column">
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>BILLED TO:</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{invoice.customer_name.toUpperCase()}</div>
              {invoice.customer_owner && <div>Owner: {invoice.customer_owner}</div>}
              <div style={{ marginTop: '4px' }}>{invoice.customer_address1}</div>
              {invoice.customer_address2 && <div>{invoice.customer_address2}</div>}
              <div>{invoice.customer_city}, {invoice.customer_state} - {invoice.customer_pincode}</div>
              <div style={{ marginTop: '4px' }}>Phone: {invoice.customer_phone}</div>
              <div style={{ marginTop: '6px', fontWeight: 'bold' }}>GSTIN: {invoice.customer_gst || 'N/A'}</div>
              <div>DL #: {invoice.customer_dl || 'N/A'}</div>
            </div>
          </div>

          {/* Invoice Metadata grid */}
          <div className="air-invoice-meta-grid">
            <div>
              <strong>Inv. Tax Number:</strong> {invoice.invoice_number}<br />
              <strong>Inv. Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}<br />
              <strong>Due Date:</strong> {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'Immediate'}
            </div>
            <div>
              <strong>Transport Agent:</strong> {invoice.transport || 'Direct'}<br />
              <strong>PO Number:</strong> {invoice.po_number || 'N/A'}<br />
              <strong>Sales Representative:</strong> {invoice.sales_person || 'Direct'}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)' }}>
                Status: {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice items table */}
        <table className="air-invoice-items-table">
          <thead>
            <tr>
              <th style={{ width: '3%' }}>SR</th>
              <th style={{ width: '6%' }}>MFR</th>
              <th style={{ width: '6%' }}>DIR</th>
              <th style={{ width: '5%' }}>QTY</th>
              <th style={{ width: '5%' }}>FREE</th>
              <th style={{ width: '5%' }}>PKG</th>
              <th style={{ width: '44%' }}>DESCRIPTION</th>
              <th style={{ width: '8%' }}>MRP</th>
              <th style={{ width: '8%' }}>RATE</th>
              <th style={{ width: '9%' }}>VALUE</th>
              <th style={{ width: '5%' }}>DIS%</th>
              <th style={{ width: '5%' }}>GST%</th>
              <th style={{ width: '11%' }}>NET AMT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ textAlign: 'center' }}>{item.product_mfr || 'ALK'}</td>
                <td style={{ textAlign: 'center' }}>MKT</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                <td style={{ textAlign: 'center' }}>{item.free_quantity || 0}</td>
                <td style={{ textAlign: 'center' }}>{item.product_size || '10S'}</td>
                <td style={{ fontWeight: 'bold' }}>{item.product_name}</td>
                <td style={{ textAlign: 'right' }}>{(item.rate * 1.12).toFixed(2)}</td> {/* Simulated MRP */}
                <td style={{ textAlign: 'right' }}>{parseFloat(item.rate).toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>{(item.rate * item.quantity).toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{parseFloat(item.discount_percentage) > 0 ? `${parseFloat(item.discount_percentage).toFixed(0)}%` : '0'}</td>
                <td style={{ textAlign: 'center' }}>{parseFloat(item.gst_percentage).toFixed(0)}%</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(item.total_amount).toFixed(2)}</td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="total-row">
              <td colSpan={3} style={{ textAlign: 'right' }}>TOTALS:</td>
              <td style={{ textAlign: 'center' }}>
                {invoice.items.reduce((sum, item) => sum + parseInt(item.quantity), 0)}
              </td>
              <td style={{ textAlign: 'center' }}>
                {invoice.items.reduce((sum, item) => sum + parseInt(item.free_quantity || 0), 0)}
              </td>
              <td colSpan={4}></td>
              <td style={{ textAlign: 'right' }}>₹{parseFloat(invoice.subtotal).toFixed(2)}</td>
              <td></td>
              <td></td>
              <td style={{ textAlign: 'right' }}>₹{parseFloat(invoice.grand_total - invoice.round_off).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* GST Slab Detail Summary vs Invoice Financial totals */}
        <div className="air-invoice-bottom">
          <div className="air-invoice-slab-wrap">
            <strong>GST TAX SLAB DETAILED SUMMARY:</strong>
            <table className="air-slab-table">
              <thead>
                <tr>
                  <th>GST Rate</th>
                  <th>Taxable Val</th>
                  <th>CGST Amt</th>
                  <th>SGST Amt</th>
                  <th>IGST Amt</th>
                  <th>Total Tax</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(slabs).map(rate => {
                  const slab = slabs[rate];
                  return (
                    <tr key={rate}>
                      <td style={{ fontWeight: 'bold' }}>{parseFloat(rate).toFixed(0)}%</td>
                      <td>₹{slab.taxable.toFixed(2)}</td>
                      <td>₹{slab.cgst.toFixed(2)}</td>
                      <td>₹{slab.sgst.toFixed(2)}</td>
                      <td>₹{slab.igst.toFixed(2)}</td>
                      <td style={{ fontWeight: 'bold' }}>₹{slab.total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="air-invoice-totals-wrap">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '9.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gross Value Subtotal:</span>
                <span>₹{parseFloat(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Scheme Discount Deducted:</span>
                <span>-₹{parseFloat(invoice.discount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Taxable Amount:</span>
                <span>₹{(invoice.subtotal - invoice.discount).toFixed(2)}</span>
              </div>
              {parseFloat(invoice.igst) > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IGST Total:</span>
                  <span>₹{parseFloat(invoice.igst).toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CGST Total Amount:</span>
                    <span>₹{parseFloat(invoice.cgst).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SGST Total Amount:</span>
                    <span>₹{parseFloat(invoice.sgst).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Round Off Adjustment:</span>
                <span>₹{parseFloat(invoice.round_off).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', borderTop: '1px solid #222', paddingTop: '6px', color: '#111' }}>
                <span>NET PAYABLE AMOUNT:</span>
                <span>₹{parseFloat(invoice.grand_total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="air-amount-words">
          <strong>Amount in Words:</strong> <span style={{ fontStyle: 'italic' }}>{invoice.amount_in_words}</span>
        </div>

        {/* Bank & Terms */}
        <div className="air-bank-terms-grid">
          <div style={{ padding: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Bank Billing Details:</div>
            {invoice.bank_name ? (
              <>
                <div>Bank Name: {invoice.bank_name}</div>
                <div>Account Number: {invoice.bank_account_no}</div>
                <div>IFSC Code: {invoice.bank_ifsc}</div>
                <div>Branch: {invoice.bank_branch}</div>
              </>
            ) : (
              <div style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No bank details provided.</div>
            )}
          </div>
          <div className="air-divider-vertical"></div>
          <div style={{ padding: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>TERMS & CONDITIONS DECLARATION:</div>
            <div>1. Goods once sold cannot be taken back or exchanged.</div>
            <div>2. Interest of 24% will be charged for bills unpaid after due date.</div>
            <div>3. Discrepancies if any must be brought to notice within 3 days.</div>
            <div>4. We certify that the items sold are registered under GST Act 2017.</div>
          </div>
        </div>

        {/* Signatures */}
        <div className="air-signatures-grid">
          <div className="air-signatures-box">
            <span style={{ fontWeight: 'bold' }}>CUSTOMER'S SIGNATURE / ACKNOWLEDGEMENT</span>
            <span style={{ fontSize: '7.5px', color: '#555', fontStyle: 'italic' }}>(Receiver's Signature & Stamp)</span>
          </div>
          <div className="air-divider-vertical"></div>
          <div className="air-signatures-box" style={{ textAlign: 'right', alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 'bold' }}>For {invoice.company_name.toUpperCase()}</span>
            <span style={{ fontWeight: 'bold' }}>Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
