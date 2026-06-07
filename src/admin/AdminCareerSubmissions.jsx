import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useToast } from '../context/ToastContext';
import { FileText, Calendar, User, Phone, Mail, GraduationCap, ArrowUpRight, Search } from 'lucide-react';

export default function AdminCareerSubmissions() {
  const toast = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    api.get(ENDPOINTS.ADMIN_CAREER_SUBMISSIONS)
      .then(res => {
        setSubmissions(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        toast.error('Failed to load career submissions');
        setSubmissions([]);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const filteredSubmissions = submissions.filter(sub => {
    if (filterType === 'all') return true;
    return (sub.position_type || sub.positionType || '').toLowerCase() === filterType.toLowerCase();
  });

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Career & Internship Applications</h1>
        
        {/* Filters */}
        <div className="filter-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({submissions.length})
          </button>
          <button 
            className={`filter-btn ${filterType === 'career' ? 'active' : ''}`}
            onClick={() => setFilterType('career')}
          >
            Careers ({submissions.filter(s => (s.position_type || s.positionType || '').toLowerCase() === 'career').length})
          </button>
          <button 
            className={`filter-btn ${filterType === 'internship' ? 'active' : ''}`}
            onClick={() => setFilterType('internship')}
          >
            Internships ({submissions.filter(s => (s.position_type || s.positionType || '').toLowerCase() === 'internship').length})
          </button>
        </div>
      </div>
      
      <div className="admin-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Academic Details</th>
                <th>Position Applied</th>
                <th>Documents</th>
                <th>About / Pitch</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ margin: 'auto' }} />
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
                    No applications matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text)' }}>
                          <User size={14} style={{ color: 'var(--primary)' }} />
                          {sub.full_name}
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                          <Mail size={12} style={{ color: 'var(--text-light)' }} />
                          {sub.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                          <Phone size={12} style={{ color: 'var(--text-light)' }} />
                          {sub.phone_code || ''} {sub.phone_number || sub.phoneNumber}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                          <GraduationCap size={14} style={{ color: 'var(--primary-light)' }} />
                          {sub.college}
                        </span>
                        <span>Degree: {sub.degree}</span>
                        <span>Semester: {sub.semester}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{
                          display: 'inline-block',
                          alignSelf: 'flex-start',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          backgroundColor: (sub.position_type || sub.positionType || '').toLowerCase() === 'internship' ? '#eff6ff' : '#fdf2f8',
                          color: (sub.position_type || sub.positionType || '').toLowerCase() === 'internship' ? '#3b82f6' : '#db2777'
                        }}>
                          {(sub.position_type || sub.positionType || 'career')}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>
                          Interest: {sub.field_interest || sub.fieldInterest}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {sub.resume_url || sub.resumeUrl ? (
                          <a 
                            href={sub.resume_url || sub.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                              color: 'var(--primary)',
                              textDecoration: 'none',
                              fontWeight: 600
                            }}
                          >
                            <FileText size={14} /> Resume <ArrowUpRight size={12} />
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>No Resume</span>
                        )}
                        {(sub.cover_letter_url || sub.coverLetterUrl) && (
                          <a 
                            href={sub.cover_letter_url || sub.coverLetterUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                              color: 'var(--text-muted)',
                              textDecoration: 'none'
                            }}
                          >
                            <FileText size={14} /> Cover Letter <ArrowUpRight size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ maxWidth: 260, whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {sub.about}
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
