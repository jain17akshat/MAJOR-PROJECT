import { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, Pencil, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { format } from 'date-fns';

const EMPTY_USER = { name:'', email:'', password:'', role:'staff' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_USER);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/users'); setUsers(r.data.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_USER); setShowModal(true); };
  const openEdit = (u) => { setEditing(u._id); setForm({ name:u.name, email:u.email, password:'', role:u.role }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name||!form.email) return toast.error('Name and email required');
    if (!editing && !form.password) return toast.error('Password required for new user');
    setSaving(true);
    try {
      if (editing) {
        const payload = { name:form.name, role:form.role };
        await api.put(`/users/${editing}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/auth/register', form);
        toast.success('User created');
      }
      setShowModal(false); load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div>
      <div className="page-header">
        <div><h2>User Management</h2><p style={{ color:'var(--text-muted)' }}>{users.length} users</p></div>
        <button className="btn btn-primary" onClick={openAdd}><UserPlus size={16}/> Add User</button>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrapper">
          {loading ? <div className="loading-center"><div className="spinner"/></div> : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'var(--btn-primary-text)', flexShrink:0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color:'var(--text-muted)', fontSize:13 }}>{u.email}</td>
                    <td><span className={`badge ${u.role==='admin'?'badge-teal':'badge-info'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.isActive?'badge-success':'badge-danger'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{u.lastLogin?format(new Date(u.lastLogin),'dd MMM yy, hh:mm a'):'Never'}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>openEdit(u)}><Pencil size={13}/></button>
                        <button className={`btn btn-sm btn-icon ${u.isActive?'btn-danger':'btn-secondary'}`} onClick={()=>toggleActive(u)} title={u.isActive?'Deactivate':'Activate'}><Power size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing?'Edit User':'Add User'}</div>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} disabled={!!editing}/></div>
              {!editing && <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min 6 characters"/></div>}
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={e=>set('role',e.target.value)}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Save User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
