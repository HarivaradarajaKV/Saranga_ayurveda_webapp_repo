import { useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Search, UserCheck, UserX } from 'lucide-react';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    api.get(ENDPOINTS.ADMIN_USERS)
      .then(res => { const d = res.data; setUsers(Array.isArray(d) ? d : (d?.users || [])); })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !searchQ || (u.name || '').toLowerCase().includes(searchQ.toLowerCase()) || (u.email || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="page-fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users</h1>
      </div>
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, color: 'var(--text-light)' }} />
            <input className="form-input" style={{ paddingLeft: 36, width: 240 }} placeholder="Search users..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} users</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name || '—'}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>{u.role || 'user'}</span></td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td><span className={`badge ${u.is_active !== false ? 'badge-success' : 'badge-danger'}`}>{u.is_active !== false ? 'Active' : 'Blocked'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
