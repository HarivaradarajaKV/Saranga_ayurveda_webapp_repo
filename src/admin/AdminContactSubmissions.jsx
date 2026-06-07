import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Mail, Calendar, User, Phone, MessageSquare } from 'lucide-react';

export default function AdminContactSubmissions() {
  const toast = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(ENDPOINTS.ADMIN_CONTACT_SUBMISSIONS)
      .then(res => {
        setSubmissions(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        toast.error('Failed to load contact submissions');
        setSubmissions([]);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Contact Submissions</h1>
      </div>
      
      <div className="admin-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Details</th>
                <th>Contact Info</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date Received</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ margin: 'auto' }} />
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
                    No contact submissions received yet.
                  </td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text)' }}>
                        <User size={14} style={{ color: 'var(--primary)' }} />
                        {sub.full_name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={12} style={{ color: 'var(--text-light)' }} />
                          {sub.email}
                        </span>
                        {(sub.phone_number || sub.phoneNumber) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={12} style={{ color: 'var(--text-light)' }} />
                            {sub.phone_code || ''} {sub.phone_number || sub.phoneNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                      {sub.subject}
                    </td>
                    <td style={{ maxWidth: 300, whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {sub.message}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <Calendar size={12} style={{ color: 'var(--text-light)' }} />
                        {sub.created_at ? new Date(sub.created_at).toLocaleString('en-IN') : '—'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
