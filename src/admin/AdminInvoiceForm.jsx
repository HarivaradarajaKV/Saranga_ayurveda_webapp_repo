import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Search, ArrowLeft, AlertCircle, Save, Check } from 'lucide-react';
import './Invoices.css';

const DEFAULT_LINE = {
  product_id: '',
  batch_id: '',
  product_name: '',
  batch_number: '',
  expiry_date: '',
  quantity: 0,
  free_quantity: 0,
  mrp: 0.00,
  rate: 0.00,
  discount_percentage: 0.00,
  discount_amount: 0.00,
  discount_type: 'percent', // 'percent' or 'flat'
  discount_value: 0, // input value
  gst_percentage: 0.00,
  gst_amount: 0.00,
  taxable_amount: 0.00,
  total_amount: 0.00,
  available_stock: 0,
  hsn_code: '',
  unit: 'PCS',
  mfr: '',
  size: ''
};

export default function AdminInvoiceForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const location = useLocation(); // For duplicate mode

  const isEditMode = !!id;

  // Invoice Header Fields
  const [companyAddresses, setCompanyAddresses] = useState([]);
  const [companyAddressId, setCompanyAddressId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customersList, setCustomersList] = useState([]);
  
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [transport, setTransport] = useState('Direct');
  const [poNumber, setPoNumber] = useState('');
  const [salesPerson, setSalesPerson] = useState('Direct Sales');
  
  // Custom Bank Details
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  
  // Invoice Items
  const [items, setItems] = useState([ { ...DEFAULT_LINE, id: Math.random() } ]);
  
  // Product Search autocomplete states per row
  const [productSearchIndex, setProductSearchIndex] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const searchInputRef = useRef(null);

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [netPayable, setNetPayable] = useState(0);

  // Warnings
  const [warnings, setWarnings] = useState([]);
  const [saving, setSaving] = useState(false);

  // Initialize
  useEffect(() => {
    fetchCompanyAddresses();
    if (isEditMode) {
      fetchInvoiceForEdit();
    } else if (location.state?.duplicateFrom) {
      prepopulateDuplicated(location.state.duplicateFrom);
    }
  }, [id]);

  // Fetch company billing profiles
  const fetchCompanyAddresses = async () => {
    try {
      const res = await api.get('/admin/invoices/company-addresses');
      setCompanyAddresses(res.data || []);
      const def = res.data.find(a => a.is_default);
      if (def) setCompanyAddressId(String(def.id));
      else if (res.data.length > 0) setCompanyAddressId(String(res.data[0].id));
    } catch (err) {}
  };

  // Prepopulate form when duplicating
  const prepopulateDuplicated = (source) => {
    setCompanyAddressId(String(source.company_address_id));
    setSelectedCustomer({
      id: source.customer_address_id,
      shop_name: source.customer_name,
      state: source.customer_state,
      phone: source.customer_phone,
      gst_number: source.customer_gst,
      drug_license: source.customer_dl
    });
    setCustomerSearch(source.customer_name);
    setTransport(source.transport || 'Direct');
    setPoNumber(source.po_number || '');
    setSalesPerson(source.sales_person || 'Direct Sales');

    setBankName(source.bank_name || '');
    setBankAccountNo(source.bank_account_no || '');
    setBankIfsc(source.bank_ifsc || '');
    setBankBranch(source.bank_branch || '');

    const mappedItems = source.items.map(item => {
      const isFlat = parseFloat(item.discount_percentage) === 0 && parseFloat(item.discount_amount) > 0;
      return {
        ...DEFAULT_LINE,
        id: Math.random(),
        product_id: item.product_id,
        batch_id: item.batch_id,
        product_name: item.product_name,
        batch_number: item.batch_number,
        expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
        quantity: item.quantity,
        free_quantity: item.free_quantity,
        rate: parseFloat(item.rate),
        gst_percentage: parseFloat(item.gst_percentage),
        hsn_code: item.product_hsn,
        unit: item.product_unit,
        mfr: item.product_mfr,
        size: item.product_size,
        discount_type: isFlat ? 'flat' : 'percent',
        discount_value: isFlat ? parseFloat(item.discount_amount) : parseFloat(item.discount_percentage),
        available_stock: 9999 // placeholder, will verify
      };
    });
    setItems(mappedItems);
    toast.show('Populated details from duplicate source. Modify details and save.', 'info');
  };

  // Fetch invoice details for editing
  const fetchInvoiceForEdit = async () => {
    try {
      const res = await api.get(`/admin/invoices/${id}`);
      const inv = res.data;
      
      setCompanyAddressId(String(inv.company_address_id));
      setSelectedCustomer({
        id: inv.customer_address_id,
        shop_name: inv.customer_name,
        state: inv.customer_state,
        phone: inv.customer_phone,
        gst_number: inv.customer_gst,
        drug_license: inv.customer_dl
      });
      setCustomerSearch(inv.customer_name);
      setInvoiceDate(inv.invoice_date ? inv.invoice_date.split('T')[0] : '');
      setDueDate(inv.due_date ? inv.due_date.split('T')[0] : '');
      setTransport(inv.transport || '');
      setPoNumber(inv.po_number || '');
      setSalesPerson(inv.sales_person || '');

      setBankName(inv.bank_name || '');
      setBankAccountNo(inv.bank_account_no || '');
      setBankIfsc(inv.bank_ifsc || '');
      setBankBranch(inv.bank_branch || '');

      const mappedItems = inv.items.map(item => {
        const isFlat = parseFloat(item.discount_percentage) === 0 && parseFloat(item.discount_amount) > 0;
        return {
          ...DEFAULT_LINE,
          id: item.id,
          product_id: item.product_id,
          batch_id: item.batch_id,
          product_name: item.product_name,
          batch_number: item.batch_number,
          expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
          quantity: item.quantity,
          free_quantity: item.free_quantity,
          rate: parseFloat(item.rate),
          gst_percentage: parseFloat(item.gst_percentage),
          hsn_code: item.product_hsn,
          unit: item.product_unit,
          mfr: item.product_mfr,
          size: item.product_size,
          discount_type: isFlat ? 'flat' : 'percent',
          discount_value: isFlat ? parseFloat(item.discount_amount) : parseFloat(item.discount_percentage),
          available_stock: 9999 // placeholder
        };
      });
      setItems(mappedItems);
    } catch (err) {
      toast.show('Failed to fetch invoice details', 'error');
      navigate('/admin/invoices');
    }
  };

  // Search customers as they type or on focus
  useEffect(() => {
    // If a customer is already selected and the search string matches their shop name, don't query
    if (selectedCustomer && selectedCustomer.shop_name === customerSearch) {
      setCustomersList([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const query = customerSearch.trim();
        const res = await api.get(`/admin/invoices/customers?q=${encodeURIComponent(query)}`);
        setCustomersList(res.data || []);
      } catch (err) {}
    }, 200);
    return () => clearTimeout(delay);
  }, [customerSearch, selectedCustomer]);

  // Product batch search autocomplete lookup
  useEffect(() => {
    if (productSearchIndex !== null) {
      const activeLine = items[productSearchIndex];
      // If the product details are already selected and query matches product name + batch number, don't query
      if (activeLine && activeLine.product_id && `${activeLine.product_name} - ${activeLine.batch_number}` === productSearchQuery) {
        setProductSearchResults([]);
        return;
      }
      
      const delay = setTimeout(async () => {
        try {
          const query = productSearchQuery.trim();
          const res = await api.get(`/admin/invoices/products-search?q=${encodeURIComponent(query)}`);
          setProductSearchResults(res.data || []);
        } catch (err) {}
      }, 200);
      return () => clearTimeout(delay);
    } else {
      setProductSearchResults([]);
    }
  }, [productSearchQuery, productSearchIndex, items]);

  // Run Calculations on items or addresses modification
  useEffect(() => {
    calculateInvoiceTotals();
  }, [items, selectedCustomer, companyAddressId]);

  const calculateInvoiceTotals = () => {
    let sub = 0;
    let disc = 0;
    let tax = 0;
    const computedItems = items.map(item => {
      const qty = parseInt(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0.00;
      const gstPct = parseFloat(item.gst_percentage) || 0.00;
      
      const gross = qty * rate;
      let dAmt = 0;
      let dPct = 0;

      if (item.discount_type === 'percent') {
        dPct = parseFloat(item.discount_value) || 0;
        dAmt = (gross * dPct) / 100;
      } else {
        dAmt = parseFloat(item.discount_value) || 0;
        dPct = gross > 0 ? (dAmt / gross) * 100 : 0;
      }

      const netInclusive = gross - dAmt;
      const taxable = netInclusive / (1 + gstPct / 100);
      const gstAmt = netInclusive - taxable;

      sub += taxable;
      disc += dAmt;
      tax += gstAmt;

      return {
        ...item,
        discount_percentage: dPct,
        discount_amount: dAmt,
        taxable_amount: taxable,
        gst_amount: gstAmt,
        total_amount: netInclusive
      };
    });

    // Check states to toggle IGST vs CGST/SGST
    const selectedCompany = companyAddresses.find(a => String(a.id) === companyAddressId);
    const isSameState = selectedCustomer && selectedCompany && 
      (selectedCustomer.state || '').trim().toLowerCase() === (selectedCompany.state || '').trim().toLowerCase();

    setSubtotal(sub);
    setTotalDiscount(disc);

    if (isSameState) {
      setCgst(tax / 2);
      setSgst(tax / 2);
      setIgst(0);
    } else {
      setCgst(0);
      setSgst(0);
      setIgst(tax);
    }

    const unroundedGrand = sub + tax; // taxable subtotal + tax = net sum after discount
    const roundedNet = Math.round(unroundedGrand);
    const roundValue = roundedNet - unroundedGrand;

    setGrandTotal(unroundedGrand);
    setRoundOff(roundValue);
    setNetPayable(roundedNet);

    // Formulate warnings (stock checks)
    const newWarnings = [];
    computedItems.forEach((item, idx) => {
      if (item.product_id) {
        const totalReq = parseInt(item.quantity) + parseInt(item.free_quantity || 0);
        if (totalReq > 0) {
          if (item.available_stock !== undefined && totalReq > item.available_stock) {
            newWarnings.push(`Line ${idx + 1}: Requested quantity (${totalReq}) exceeds available stock (${item.available_stock})`);
          }
        }
      }
    });
    setWarnings(newWarnings);
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  // Add empty row
  const addLineItem = () => {
    setItems([...items, { ...DEFAULT_LINE, id: Math.random() }]);
  };

  // Remove row
  const removeLineItem = (idx) => {
    const list = [...items];
    list.splice(idx, 1);
    setItems(list.length === 0 ? [{ ...DEFAULT_LINE, id: Math.random() }] : list);
  };

  // Row columns changes handler
  const handleLineFieldChange = (idx, field, val) => {
    const list = [...items];
    const item = { ...list[idx], [field]: val };
    
    // Recalculate row totals
    const qty = parseInt(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0.00;
    const gstPct = parseFloat(item.gst_percentage) || 0.00;
    const gross = qty * rate;
    
    let dAmt = 0;
    let dPct = 0;
    if (item.discount_type === 'percent') {
      dPct = parseFloat(item.discount_value) || 0;
      dAmt = (gross * dPct) / 100;
    } else {
      dAmt = parseFloat(item.discount_value) || 0;
      dPct = gross > 0 ? (dAmt / gross) * 100 : 0;
    }
    
    const netInclusive = gross - dAmt;
    item.discount_percentage = dPct;
    item.discount_amount = dAmt;
    item.taxable_amount = netInclusive / (1 + gstPct / 100);
    item.gst_amount = netInclusive - item.taxable_amount;
    item.total_amount = netInclusive;
    
    list[idx] = item;
    setItems(list);
  };

  // Auto-select customer
  const selectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setCustomerSearch(cust.shop_name);
    setShowCustomerDropdown(false);
  };

  // Initialize row details when product autocomplete is selected
  const handleSelectProductBatch = (idx, selected) => {
    const list = [...items];
    
    const rate = parseFloat(selected.default_selling_price) || 0.00;
    const gstPct = parseFloat(selected.gst_percentage) || 0.00;
    const qty = parseInt(list[idx].quantity) || 1;
    const gross = qty * rate;
    
    const discVal = parseFloat(list[idx].discount_value) || 0;
    const discType = list[idx].discount_type || 'percent';
    
    let dAmt = 0;
    let dPct = 0;
    if (discType === 'percent') {
      dPct = discVal;
      dAmt = (gross * dPct) / 100;
    } else {
      dAmt = discVal;
      dPct = gross > 0 ? (dAmt / gross) * 100 : 0;
    }
    
    const netInclusive = gross - dAmt;
    const taxable = netInclusive / (1 + gstPct / 100);
    const gstAmt = netInclusive - taxable;

    list[idx] = {
      ...list[idx],
      product_id: selected.product_id,
      batch_id: '',
      product_name: selected.product_name,
      batch_number: 'N/A',
      expiry_date: '',
      mrp: rate,
      rate,
      quantity: qty,
      gst_percentage: gstPct,
      discount_percentage: dPct,
      discount_amount: dAmt,
      taxable_amount: taxable,
      gst_amount: gstAmt,
      total_amount: netInclusive,
      sku: selected.sku || '',
      available_stock: selected.available_stock || 0,
      hsn_code: selected.hsn_code || '',
      unit: selected.unit || 'PCS',
      mfr: selected.manufacturer || '',
      size: selected.package_size || ''
    };
    
    setItems(list);
    setShowProductDropdown(false);
    setProductSearchIndex(null);
  };

  // Save invoice (draft or finalize)
  const handleSaveInvoice = async (saveStatus) => {
    if (!selectedCustomer) {
      toast.show('Please select a customer before saving', 'warning');
      return;
    }
    if (!companyAddressId) {
      toast.show('Please select a company billing address', 'warning');
      return;
    }

    // Line items verification
    const filteredItems = items.filter(i => i.product_id);
    if (filteredItems.length === 0) {
      toast.show('Please add at least one valid product line item', 'warning');
      return;
    }

    // Force validation checks on finalization
    if (saveStatus === 'finalized') {
      const stockErrors = filteredItems.filter(item => {
        const totalReq = parseInt(item.quantity) + parseInt(item.free_quantity || 0);
        return totalReq > item.available_stock;
      });
      if (stockErrors.length > 0) {
        toast.show('Cannot finalize sale: Some lines exceed available stock.', 'error');
        return;
      }
    }

    setSaving(true);
    const payload = {
      company_address_id: parseInt(companyAddressId),
      customer_address_id: selectedCustomer.id,
      invoice_date: invoiceDate,
      due_date: dueDate || null,
      transport,
      po_number: poNumber,
      sales_person: salesPerson,
      subtotal,
      discount: totalDiscount,
      cgst,
      sgst,
      igst,
      grand_total: netPayable,
      round_off: roundOff,
      status: saveStatus,
      bank_name: bankName || null,
      bank_account_no: bankAccountNo || null,
      bank_ifsc: bankIfsc || null,
      bank_branch: bankBranch || null,
      items: filteredItems.map(i => ({
        product_id: i.product_id,
        batch_id: i.batch_id || null,
        quantity: parseInt(i.quantity) || 0,
        free_quantity: parseInt(i.free_quantity) || 0,
        rate: parseFloat(i.rate) || 0.00,
        discount_percentage: i.discount_type === 'percent' ? parseFloat(i.discount_value) || 0.00 : 0.00,
        discount_amount: i.discount_type === 'flat' ? parseFloat(i.discount_value) || 0.00 : 0.00,
        gst_percentage: parseFloat(i.gst_percentage) || 0.00,
        gst_amount: parseFloat(i.gst_amount) || 0.00,
        taxable_amount: parseFloat(i.taxable_amount) || 0.00,
        total_amount: parseFloat(i.total_amount) || 0.00,
        expiry_date: i.expiry_date || null,
        batch_number: i.batch_number || null
      }))
    };

    try {
      let savedInvoice = null;
      if (isEditMode) {
        await api.put(`/admin/invoices/${id}`, payload);
        toast.show('Invoice updated successfully', 'success');
      } else {
        const res = await api.post('/admin/invoices', payload);
        savedInvoice = res.data;
        toast.show('Invoice created successfully', 'success');
      }
      
      navigate('/admin/invoices');
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to save invoice transaction', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-fade-in invoices-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => navigate('/admin/invoices')}>
            <ArrowLeft size={16} />
          </button>
          <h1 className="admin-page-title">{isEditMode ? 'Modify Invoice Draft' : 'Generate Tax Invoice'}</h1>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="alert-warning">
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <AlertCircle size={14} /> Attention Required (Warnings):
          </div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {warnings.map((w, idx) => <li key={idx}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Header parameters */}
      <div className="invoice-card">
        <div className="invoice-section-title">Invoice Header details</div>
        
        <div className="invoice-grid-2">
          {/* Company address dropdown */}
          <div className="form-group">
            <label>From Company Profile *</label>
            <select className="form-select" value={companyAddressId} onChange={e => setCompanyAddressId(e.target.value)}>
              {companyAddresses.map(addr => (
                <option key={addr.id} value={addr.id}>{addr.company_name} - GST: {addr.gst_number}</option>
              ))}
            </select>
          </div>

          {/* Customer Search Autocomplete */}
          <div className="form-group">
            <label>Search & Select Customer *</label>
            <div className="autocomplete-wrapper">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: 10, color: 'var(--text-light)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: 36 }}
                  placeholder="Type shop name, owner or phone..." 
                  value={customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomer(null); setShowCustomerDropdown(true); }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                />
              </div>

              {showCustomerDropdown && customersList.length > 0 && (
                <div className="autocomplete-dropdown">
                  {customersList.map(cust => (
                    <div 
                      key={cust.id} 
                      className="autocomplete-item" 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectCustomer(cust);
                      }}
                    >
                      <div className="autocomplete-item-title">{cust.shop_name}</div>
                      <div className="autocomplete-item-subtitle">Owner: {cust.owner_name} | GST: {cust.gst_number || 'N/A'} | State: {cust.state}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Metadata grid */}
        <div className="invoice-grid-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="form-group">
            <label>Invoice Date *</label>
            <input 
              type="date" 
              className="form-input" 
              value={invoiceDate} 
              onChange={e => {
                const newDate = e.target.value;
                setInvoiceDate(newDate);
                if (dueDate && dueDate < newDate) {
                  setDueDate('');
                }
              }} 
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={dueDate} 
              min={invoiceDate} 
              onChange={e => setDueDate(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Transport mode</label>
            <input type="text" className="form-input" placeholder="e.g. Direct / VRL" value={transport} onChange={e => setTransport(e.target.value)} />
          </div>
          <div className="form-group">
            <label>PO Number</label>
            <input type="text" className="form-input" placeholder="PO-12345" value={poNumber} onChange={e => setPoNumber(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Salesperson</label>
            <select className="form-select" value={salesPerson} onChange={e => setSalesPerson(e.target.value)}>
              <option value="Direct Sales">Direct Sales</option>
              <option value="Field Agent 1">Field Agent 1</option>
              <option value="Field Agent 2">Field Agent 2</option>
            </select>
          </div>
        </div>

        {/* Bank Information Grid */}
        <div style={{ marginTop: 20, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
          <div className="invoice-section-title" style={{ fontSize: '0.9rem', marginBottom: 12 }}>Bank Billing Details (Optional)</div>
          <div className="invoice-grid-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Bank Name</label>
              <input type="text" className="form-input" placeholder="e.g. State Bank of India" value={bankName} onChange={e => setBankName(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Account Number</label>
              <input type="text" className="form-input" placeholder="e.g. 123456789012" value={bankAccountNo} onChange={e => setBankAccountNo(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>IFSC Code</label>
              <input type="text" className="form-input" placeholder="e.g. SBIN0001234" value={bankIfsc} onChange={e => setBankIfsc(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Branch Name</label>
              <input type="text" className="form-input" placeholder="e.g. MG Road, Bangalore" value={bankBranch} onChange={e => setBankBranch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Selected Customer Snapshot */}
        {selectedCustomer && (
          <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 'var(--radius-sm)', marginTop: 8, fontSize: '0.8rem', border: '1px solid var(--border-light)', textAlign: 'left' }}>
            <strong>Selected Customer Details:</strong> Shop Name: <strong>{selectedCustomer.shop_name}</strong> | State: <strong>{selectedCustomer.state}</strong> | GSTIN: <strong>{selectedCustomer.gst_number || 'N/A'}</strong> | Phone: <strong>{selectedCustomer.phone}</strong> | Drug License: <strong>{selectedCustomer.drug_license || 'None'}</strong>
          </div>
        )}
      </div>

      {/* Line Items Grid Table */}
      <div className="invoice-card" style={{ padding: '20px 10px' }}>
        <div className="invoice-section-title" style={{ paddingLeft: 14 }}>Line Items</div>
        
        <div className="invoice-items-table-wrap">
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th style={{ width: '4%' }}>Sr</th>
                <th style={{ width: '22%' }}>Product Selection</th>
                <th style={{ width: '8%' }}>HSN Code</th>
                <th style={{ width: '8%' }}>SKU</th>
                <th style={{ width: '7%' }}>Qty</th>
                <th style={{ width: '7%' }}>Free</th>
                <th style={{ width: '9%' }}>Rate (₹)</th>
                <th style={{ width: '13%' }}>Discount (Editable)</th>
                <th style={{ width: '7%' }}>GST %</th>
                <th style={{ width: '11%' }}>Net Amt (₹)</th>
                <th style={{ width: '4%' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                  
                  {/* Searchable autocomplete row input */}
                  <td>
                    <div className="autocomplete-wrapper">
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ textAlign: 'left', fontWeight: item.product_id ? 600 : 'normal' }}
                        placeholder="Search product SKU or name..." 
                        value={productSearchIndex === idx ? productSearchQuery : (item.product_id ? `${item.product_name} (SKU: ${item.sku || 'N/A'})` : '')}
                        onChange={e => {
                          setProductSearchIndex(idx);
                          setProductSearchQuery(e.target.value);
                          setShowProductDropdown(true);
                        }}
                        onFocus={() => {
                          setProductSearchIndex(idx);
                          setProductSearchQuery('');
                          setShowProductDropdown(true);
                        }}
                        onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                      />
                      
                      {productSearchIndex === idx && showProductDropdown && productSearchResults.length > 0 && (
                        <div className="autocomplete-dropdown" style={{ width: '380px' }}>
                          {productSearchResults.map(res => (
                            <div 
                              key={res.product_id} 
                              className="autocomplete-item" 
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectProductBatch(idx, res);
                              }}
                            >
                              <div className="autocomplete-item-title">{res.product_name}</div>
                              <div className="autocomplete-item-subtitle">
                                SKU: <strong>{res.sku || 'N/A'}</strong> | Stock: <strong>{res.available_stock || 0}</strong> | Price (Incl. GST): ₹<strong>{res.default_selling_price}</strong> | Unit: <strong>{res.unit || 'PCS'}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {item.product_id && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Available Stock: <strong>{item.available_stock}</strong> {item.unit}</span>
                        {item.mfr && <span>MFR: {item.mfr}</span>}
                      </div>
                    )}
                  </td>

                  {/* HSN */}
                  <td>
                    <input type="text" className="form-input" value={item.hsn_code} onChange={e => handleLineFieldChange(idx, 'hsn_code', e.target.value)} />
                  </td>

                  {/* SKU */}
                  <td>
                    <input type="text" className="form-input" readOnly value={item.sku || '—'} />
                  </td>

                  {/* Qty */}
                  <td>
                    <input type="number" min="1" className="form-input" required value={item.quantity || ''} onChange={e => handleLineFieldChange(idx, 'quantity', parseInt(e.target.value) || 0)} />
                  </td>

                  {/* Free Qty */}
                  <td>
                    <input type="number" min="0" className="form-input" value={item.free_quantity || ''} onChange={e => handleLineFieldChange(idx, 'free_quantity', parseInt(e.target.value) || 0)} />
                  </td>

                  {/* Rate */}
                  <td>
                    <input type="number" step="0.01" className="form-input" required value={item.rate || ''} onChange={e => handleLineFieldChange(idx, 'rate', parseFloat(e.target.value) || 0.00)} />
                  </td>

                  {/* Discount toggle options (flat or percent) */}
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ width: '60%' }} 
                        value={item.discount_value || ''} 
                        onChange={e => handleLineFieldChange(idx, 'discount_value', parseFloat(e.target.value) || 0)} 
                      />
                      <select 
                        className="form-select" 
                        style={{ width: '40%', padding: '4px 6px' }}
                        value={item.discount_type} 
                        onChange={e => handleLineFieldChange(idx, 'discount_type', e.target.value)}
                      >
                        <option value="percent">%</option>
                        <option value="flat">₹</option>
                      </select>
                    </div>
                  </td>

                  {/* GST */}
                  <td>
                    <input type="number" className="form-input" disabled value={item.gst_percentage || 0} />
                  </td>

                  {/* Net Amount calculated */}
                  <td style={{ fontWeight: 700, textAlign: 'right', paddingRight: 15 }}>
                    ₹{parseFloat(item.total_amount || 0).toFixed(2)}
                  </td>

                  {/* Delete row button */}
                  <td>
                    <button type="button" className="btn btn-danger btn-xs" style={{ padding: 6 }} onClick={() => removeLineItem(idx)}>
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" className="btn btn-secondary btn-xs" onClick={addLineItem} style={{ marginLeft: 10 }}>
          <Plus size={12} /> Add Item Row
        </button>
      </div>

      {/* Invoice Totals Summaries */}
      <div className="invoice-summary-grid">
        <div className="invoice-summary-left">
          <div className="invoice-card" style={{ height: '100%' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: 8, textTransform: 'uppercase' }}>
              Declaration Notes & Terms
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              1. Goods once sold cannot be taken back or exchanged.<br />
              2. Bills not paid within the due date will attract 24% interest charge.<br />
              3. We certify that the items sold are registered under GST Act 2017.<br />
              4. All disputes subject to local jurisdiction authorities only.
            </p>
          </div>
        </div>

        <div className="invoice-summary-right">
          <div className="summary-row">
            <span>Gross Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Scheme Discount:</span>
            <span>-₹{totalDiscount.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Taxable Value:</span>
            <span>₹{(subtotal - totalDiscount).toFixed(2)}</span>
          </div>
          
          {igst > 0 ? (
            <div className="summary-row">
              <span>IGST (Out of State):</span>
              <span>₹{igst.toFixed(2)}</span>
            </div>
          ) : (
            <>
              <div className="summary-row">
                <span>CGST (Central Tax):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>SGST (State Tax):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="summary-row">
            <span>Rounding Off:</span>
            <span>₹{roundOff.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>NET PAYABLE:</span>
            <span>₹{netPayable.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Save Draft vs Finalize Controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10, marginBottom: 30 }}>
        <button 
          type="button" 
          className="btn btn-secondary" 
          disabled={saving} 
          onClick={() => handleSaveInvoice('draft')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Save size={16} /> Save as Draft
        </button>
        <button 
          type="button" 
          className="btn btn-primary" 
          disabled={saving} 
          onClick={() => handleSaveInvoice('finalized')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Check size={16} /> Finalize & Save Invoice
        </button>
      </div>
    </div>
  );
}
