import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Search, X, Truck, FileText, Calendar } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal and Shiprocket specific state variables
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [shiprocketLoading, setShiprocketLoading] = useState(false);
  const [packageWeight, setPackageWeight] = useState(0.5);
  const [packageLength, setPackageLength] = useState(10);
  const [packageBreadth, setPackageBreadth] = useState(10);
  const [packageHeight, setPackageHeight] = useState(10);

  const fetchOrders = async (targetOrderIdToUpdate = null) => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN_ORDERS);
      const d = res.data;
      const orderList = Array.isArray(d) ? d : (d?.orders || []);
      setOrders(orderList);
      
      // Update selected order detail modal state with fresh database values
      if (targetOrderIdToUpdate) {
        const found = orderList.find(o => o.id === targetOrderIdToUpdate);
        if (found) {
          setSelectedOrder(found);
        }
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(ENDPOINTS.ADMIN_ORDER_STATUS(id), { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      setSelectedOrder(prev => prev && prev.id === id ? { ...prev, status } : prev);
      toast.success(`Order status updated to ${status}`);
    } catch { 
      toast.error('Failed to update status'); 
    }
  };

  const hasShiprocketData = (order) => !!order.shiprocket_order_id;
  const hasAWB = (order) => !!order.awb_number;

  const handleCreateShipment = async (orderId) => {
    setShiprocketLoading(true);
    try {
      const res = await api.post(`/shiprocket/create-shipment/${orderId}`, {
        weight: parseFloat(packageWeight),
        length: parseInt(packageLength),
        breadth: parseInt(packageBreadth),
        height: parseInt(packageHeight)
      });
      if (res.data?.success) {
        toast.success('Shipment created successfully!');
        await fetchOrders(orderId);
      } else {
        toast.error(res.data?.error || 'Failed to create shipment');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create shipment. Make sure "Primary" pickup location exists on Shiprocket.');
    } finally {
      setShiprocketLoading(false);
    }
  };

  const handleAssignCourier = async (orderId) => {
    setShiprocketLoading(true);
    try {
      const res = await api.post(`/shiprocket/assign-courier/${orderId}`);
      if (res.data?.success) {
        toast.success('Courier assigned & AWB generated successfully!');
        await fetchOrders(orderId);
      } else {
        toast.error(res.data?.error || 'Failed to assign courier');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign courier');
    } finally {
      setShiprocketLoading(false);
    }
  };

  const handleDownloadLabel = async (orderId) => {
    setShiprocketLoading(true);
    try {
      const res = await api.post(`/shiprocket/generate-label/${orderId}`);
      if (res.data?.success && res.data.data?.label_url) {
        window.open(res.data.data.label_url, '_blank');
        toast.success('Label generated successfully!');
        await fetchOrders(orderId);
      } else {
        toast.error('Failed to generate label');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate label');
    } finally {
      setShiprocketLoading(false);
    }
  };

  const handleSchedulePickup = async (orderId) => {
    setShiprocketLoading(true);
    try {
      const res = await api.post(`/shiprocket/request-pickup/${orderId}`);
      if (res.data?.success) {
        toast.success('Pickup scheduled successfully!');
        await fetchOrders(orderId);
      } else {
        toast.error(res.data?.error || 'Failed to schedule pickup');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to schedule pickup');
    } finally {
      setShiprocketLoading(false);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setPackageWeight(0.5);
    setPackageLength(10);
    setPackageBreadth(10);
    setPackageHeight(10);
    setShowModal(true);
  };

  const closeOrderDetails = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const filtered = orders.filter(o => {
    const matchSearch = !searchQ || String(o.id).includes(searchQ) || (o.user_name || '').toLowerCase().includes(searchQ.toLowerCase());
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders</h1>
      </div>
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, color: 'var(--text-light)' }} />
              <input className="form-input" style={{ paddingLeft: 36, width: 200 }} placeholder="Search order..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <select className="form-input form-select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
            </select>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} orders</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : filtered.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700 }}>#{order.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.user_name || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{order.email}</div>
                  </td>
                  <td>{order.items?.length || order.item_count || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(order.total_amount || 0).toFixed(0)}</td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <select
                      className="form-input form-select"
                      style={{ fontSize: '0.78rem', padding: '4px 30px 4px 8px', width: 130, background: (STATUS_COLORS[order.status] || '#999') + '20', color: STATUS_COLORS[order.status] || '#999', fontWeight: 700, border: 'none' }}
                      value={order.status || 'pending'}
                      onChange={e => updateStatus(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openOrderDetails(order)}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Shipment Fulfillment Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeOrderDetails()}>
          <div className="modal" style={{ maxWidth: 850, width: '90%' }}>
            <div className="modal-header">
              <div className="modal-title">Manage Order #{selectedOrder.id}</div>
              <button className="modal-close" onClick={closeOrderDetails}><X size={20} /></button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', textAlign: 'left' }}>
                
                {/* Left Side: Order details & items */}
                <div>
                  <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    <h3 style={{ margin: '0 0 6px 0', color: 'var(--primary)', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Order Details</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      Placed on: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('en-IN') : '—'}
                    </div>
                  </div>

                  {/* Customer details */}
                  <div style={{ marginBottom: '24px', background: 'var(--social-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-h)', fontWeight: 'bold' }}>Customer Details</h4>
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text)' }}>
                      <strong>Name:</strong> {selectedOrder.shipping_full_name || selectedOrder.user_name || '—'}<br />
                      <strong>Email:</strong> {selectedOrder.user_email || selectedOrder.email || '—'}<br />
                      <strong>Phone:</strong> {selectedOrder.shipping_phone_number || '—'}<br />
                      <strong>Address:</strong> {selectedOrder.shipping_address_line1 || '—'}
                      {selectedOrder.shipping_address_line2 ? `, ${selectedOrder.shipping_address_line2}` : ''}, {selectedOrder.shipping_city || '—'}, {selectedOrder.shipping_state || '—'} - {selectedOrder.shipping_postal_code || selectedOrder.shipping_pincode || '—'}<br />
                      <strong>Payment Method:</strong> {selectedOrder.payment_method_display || selectedOrder.payment_method || '—'}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-h)', fontWeight: 'bold' }}>Order Items ({selectedOrder.items?.length || 0})</h4>
                    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <table className="admin-table" style={{ width: '100%', fontSize: '0.82rem', margin: 0 }}>
                        <thead>
                          <tr style={{ background: 'var(--social-bg)' }}>
                            <th style={{ padding: '8px 12px' }}>Product</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Price</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items?.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.product_name || '—'}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.quantity}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{parseFloat(item.price_at_time || 0).toFixed(0)}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{(parseFloat(item.price_at_time || 0) * item.quantity).toFixed(0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div style={{ background: 'var(--social-bg)', padding: '16px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Subtotal:</span>
                      <span>₹{(selectedOrder.items?.reduce((sum, item) => sum + (parseFloat(item.price_at_time || 0) * item.quantity), 0) || 0).toFixed(0)}</span>
                    </div>
                    {parseFloat(selectedOrder.discount_amount || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#22c55e', fontWeight: 600 }}>
                        <span>Discount:</span>
                        <span>-₹{parseFloat(selectedOrder.discount_amount).toFixed(0)}</span>
                      </div>
                    )}
                    {parseFloat(selectedOrder.delivery_charge || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>Delivery Charge:</span>
                        <span>₹{parseFloat(selectedOrder.delivery_charge).toFixed(0)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' }}>
                      <span>Total Amount:</span>
                      <span style={{ color: 'var(--primary)' }}>₹{parseFloat(selectedOrder.total_amount || 0).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Status Picker and Shiprocket Integration */}
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                  
                  {/* Status Picker */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-h)', fontWeight: 'bold' }}>Order Status</h4>
                    <select
                      className="form-input form-select"
                      style={{
                        width: '100%',
                        background: (STATUS_COLORS[selectedOrder.status] || '#999') + '15',
                        color: STATUS_COLORS[selectedOrder.status] || '#999',
                        fontWeight: 700,
                        border: '1px solid ' + (STATUS_COLORS[selectedOrder.status] || '#ccc'),
                        padding: '10px'
                      }}
                      value={selectedOrder.status || 'pending'}
                      onChange={e => updateStatus(selectedOrder.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                    </select>
                  </div>

                  {/* Shiprocket Delivery Section */}
                  <div style={{ background: '#fcfbf9', border: '1px solid var(--border)', borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ margin: '0', fontSize: '0.95rem', color: 'var(--text-h)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={18} style={{ color: 'var(--primary)' }} />
                      <span>Shiprocket Fulfillment</span>
                    </h4>

                    {shiprocketLoading && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} />
                        <span>Processing request...</span>
                      </div>
                    )}

                    {/* Step 1: Create Shipment */}
                    <div>
                      {!hasShiprocketData(selectedOrder) && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block', fontWeight: 600 }}>Weight (kg)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100%' }}
                              value={packageWeight}
                              onChange={e => setPackageWeight(e.target.value)}
                              disabled={shiprocketLoading}
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block', fontWeight: 600 }}>Length (cm)</label>
                            <input
                              type="number"
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100%' }}
                              value={packageLength}
                              onChange={e => setPackageLength(e.target.value)}
                              disabled={shiprocketLoading}
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block', fontWeight: 600 }}>Breadth (cm)</label>
                            <input
                              type="number"
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100%' }}
                              value={packageBreadth}
                              onChange={e => setPackageBreadth(e.target.value)}
                              disabled={shiprocketLoading}
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block', fontWeight: 600 }}>Height (cm)</label>
                            <input
                              type="number"
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100%' }}
                              value={packageHeight}
                              onChange={e => setPackageHeight(e.target.value)}
                              disabled={shiprocketLoading}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn"
                        style={{ 
                          width: '100%', 
                          padding: '10px 14px', 
                          fontSize: '0.85rem', 
                          fontWeight: 600,
                          backgroundColor: hasShiprocketData(selectedOrder) ? '#ccc' : 'var(--primary)',
                          color: hasShiprocketData(selectedOrder) ? '#666' : '#fff',
                          border: 'none',
                          cursor: hasShiprocketData(selectedOrder) ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => handleCreateShipment(selectedOrder.id)}
                        disabled={hasShiprocketData(selectedOrder) || shiprocketLoading}
                      >
                        {hasShiprocketData(selectedOrder) ? '✓ Shipment Created' : 'Create Shiprocket Shipment'}
                      </button>
                    </div>

                    {/* Step 2: Assign Courier & AWB */}
                    {hasShiprocketData(selectedOrder) && (
                      <div>
                        {hasAWB(selectedOrder) ? (
                          <button
                            type="button"
                            className="btn"
                            style={{ 
                              width: '100%', 
                              padding: '10px 14px', 
                              fontSize: '0.85rem', 
                              fontWeight: 600,
                              backgroundColor: '#ccc',
                              color: '#666',
                              border: 'none',
                              cursor: 'not-allowed'
                            }}
                            disabled={true}
                          >
                            ✓ Courier Assigned & AWB Generated
                          </button>
                        ) : (
                          <div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '10px', lineHeight: '1.4' }}>
                              Shipment ID: {selectedOrder.shiprocket_shipment_id}
                            </p>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem', fontWeight: 600 }}
                              onClick={() => handleAssignCourier(selectedOrder.id)}
                              disabled={shiprocketLoading}
                            >
                              Assign Courier & Get AWB
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Actions (Label & Pickup) */}
                    {hasAWB(selectedOrder) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '10px' }}>
                          <strong>AWB Number:</strong> {selectedOrder.awb_number}<br />
                          <strong>Courier:</strong> {selectedOrder.courier_name || 'Assigned Courier'}
                        </div>
                        
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '10px', fontSize: '0.85rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
                          onClick={() => handleDownloadLabel(selectedOrder.id)}
                          disabled={shiprocketLoading}
                        >
                          <FileText size={16} />
                          <span>Download Shipping Label</span>
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '10px', fontSize: '0.85rem', width: '100%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
                          onClick={() => handleSchedulePickup(selectedOrder.id)}
                          disabled={shiprocketLoading || selectedOrder.shipment_status === 'pickup_scheduled'}
                        >
                          <Calendar size={16} />
                          <span>
                            {selectedOrder.shipment_status === 'pickup_scheduled' ? '✓ Pickup Scheduled' : 'Request Pickup'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--social-bg)' }}>
              <button className="btn btn-ghost" type="button" onClick={closeOrderDetails}>Close Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

