import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { 
  Plus, Search, Printer, FileDown, Mail, Copy, Pencil, Trash2, 
  ChevronLeft, ChevronRight, Filter, Eye, RefreshCw 
} from 'lucide-react';
import './Invoices.css';

export default function AdminInvoices() {
  const toast = useToast();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [salesPersonFilter, setSalesPersonFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, salesPersonFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchQuery,
        status: statusFilter,
        sales_person: salesPersonFilter,
        _t: String(Date.now())
      });
      const res = await api.get(`/admin/invoices?${params.toString()}`);
      setInvoices(res.data?.invoices || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      toast.show('Failed to fetch invoices history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInvoices();
  };

  const handleDownloadPDF = (id, invoiceNo) => {
    // Open the PDF download route directly
    const token = localStorage.getItem('auth_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const downloadUrl = `${baseUrl}/admin/invoices/${id}/pdf?Authorization=Bearer ${token}`;
    
    // We can open it in a new window or trigger download via an anchor element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.setAttribute('download', `Invoice_${invoiceNo}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.show('Downloading PDF invoice...', 'info');
  };

  const handleEmailPDF = async (id, currentEmail) => {
    const email = window.prompt('Enter customer email to send invoice:', currentEmail || '');
    if (!email) return;

    try {
      toast.show('Sending invoice email...', 'info');
      await api.post(`/admin/invoices/${id}/email`, { email });
      toast.show(`Invoice emailed successfully to ${email}`, 'success');
    } catch (err) {
      toast.show('Failed to email invoice PDF', 'error');
    }
  };

  const handleDelete = async (id, invoiceNo) => {
    if (!window.confirm(`Are you sure you want to delete Invoice "${invoiceNo}"?\nWARNING: If finalized, stock counts will be restored.`)) return;
    try {
      await api.delete(`/admin/invoices/${id}`);
      toast.show('Invoice deleted and stock adjusted', 'success');
      fetchInvoices();
    } catch (err) {
      toast.show('Failed to delete invoice', 'error');
    }
  };

  const handleDuplicate = async (id) => {
    if (!window.confirm('Do you want to duplicate this invoice into a new draft?')) return;
    try {
      const res = await api.get(`/admin/invoices/${id}`);
      const source = res.data;
      
      // Navigate to new invoice page, passing duplication details
      navigate('/admin/invoices/new', { state: { duplicateFrom: source } });
    } catch (err) {
      toast.show('Failed to fetch invoice for duplication', 'error');
    }
  };

  return (
    <div className="page-fade-in invoices-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Invoice Records</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/products/batches')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Manage Batches
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/company-addresses')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Company Addresses
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/customers')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Customers List
          </button>
          <Link to="/admin/invoices/new" className="btn btn-primary">
            <Plus size={16} /> New Invoice
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="invoice-card" style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} className="invoice-grid-2" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: 12, alignItems: 'end', marginBottom: 0 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Search Invoice</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, color: 'var(--text-light)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: 36 }} 
                placeholder="Invoice number or Customer name..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label>Filter Status</label>
            <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="draft">Drafts</option>
              <option value="finalized">Finalized</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label>Salesperson</label>
            <select className="form-select" value={salesPersonFilter} onChange={e => { setSalesPersonFilter(e.target.value); setPage(1); }}>
              <option value="">All Sales Reps</option>
              <option value="Direct Sales">Direct Sales</option>
              <option value="Field Agent 1">Field Agent 1</option>
              <option value="Field Agent 2">Field Agent 2</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary" style={{ height: 40, width: '100%' }}>
            Search
          </button>
        </form>
      </div>

      {/* Invoices List Table */}
      <div className="admin-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Shop Name</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Salesperson</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 45 }}>
                    <div className="spinner" style={{ margin: 'auto' }} />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>
                    No invoice transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-h)' }}>{inv.invoice_number}</td>
                    <td>{inv.customer_name}</td>
                    <td>{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                    <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : 'Immediate'}</td>
                    <td>{inv.sales_person || 'Direct'}</td>
                    <td style={{ fontWeight: 700 }}>₹{parseFloat(inv.grand_total).toFixed(2)}</td>
                    <td>
                      <span className={`tag-status ${inv.status}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <Link to={`/admin/invoices/${inv.id}`} className="btn btn-secondary btn-xs" title="View details">
                          <Eye size={12} />
                        </Link>
                        
                        <button className="btn btn-secondary btn-xs" onClick={() => handleDownloadPDF(inv.id, inv.invoice_number)} title="Download PDF">
                          <FileDown size={12} />
                        </button>
                        
                        <button className="btn btn-secondary btn-xs" onClick={() => handleEmailPDF(inv.id, inv.customer_email)} title="Email PDF">
                          <Mail size={12} />
                        </button>
                        
                        <button className="btn btn-secondary btn-xs" onClick={() => handleDuplicate(inv.id)} title="Duplicate Draft">
                          <Copy size={12} />
                        </button>

                        {inv.status === 'draft' && (
                          <Link to={`/admin/invoices/${inv.id}/edit`} className="btn btn-secondary btn-xs" title="Edit Draft">
                            <Pencil size={12} />
                          </Link>
                        )}
                        
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(inv.id, inv.invoice_number)} title="Delete / Cancel">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-xs" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={14} /> Previous
              </button>
              <button className="btn btn-secondary btn-xs" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
