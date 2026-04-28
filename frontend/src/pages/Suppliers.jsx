import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliersApi';
import toast from 'react-hot-toast';

const EMPTY = { name:'', contactPerson:'', phone:'', email:'', address:'', city:'', gstin:'', paymentTerms:'Net 30', notes:'' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getSuppliers({ search, limit: 50 });
      setSuppliers(r.data.data); setTotal(r.data.pagination.total);
    } catch { } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (s) => { setEditing(s._id); setForm({ name:s.name||'', contactPerson:s.contactPerson||'', phone:s.phone||'', email:s.email||'', address:s.address||'', city:s.city||'', gstin:s.gstin||'', paymentTerms:s.paymentTerms||'Net 30', notes:s.notes||'' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Supplier name required');
    setSaving(true);
    try {
      if (editing) { await updateSupplier(editing, form); toast.success('Supplier updated'); }
      else { await createSupplier(form); toast.success('Supplier added'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await deleteSupplier(id); toast.success('Supplier removed'); load(); }
    catch (err) { toast.error(err.message); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div><h2>Suppliers</h2><p style={{ color:'var(--text-muted)' }}>{total} suppliers</p></div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/> Add Supplier</button>
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <div className="search-bar">
          <Search size={15} color="var(--text-muted)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search suppliers..."/>
        </div>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrapper">
          {loading ? <div className="loading-center"><div className="spinner"/></div> : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Contact Person</th><th>Phone</th><th>Email</th><th>City</th><th>GSTIN</th><th>Actions</th></tr></thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No suppliers found</td></tr>
                ) : suppliers.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight:600 }}>{s.name}</td>
                    <td>{s.contactPerson||'—'}</td>
                    <td style={{ color:'var(--teal)' }}>{s.phone||'—'}</td>
                    <td style={{ fontSize:12 }}>{s.email||'—'}</td>
                    <td>{s.city||'—'}</td>
                    <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.gstin||'—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>openEdit(s)}><Pencil size={13}/></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={()=>handleDelete(s._id,s.name)}><Trash2 size={13}/></button>
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
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Supplier' : 'Add Supplier'}</div>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Supplier name"/></div>
                <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contactPerson} onChange={e=>set('contactPerson',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e=>set('city',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">GSTIN</label><input className="form-input" value={form.gstin} onChange={e=>set('gstin',e.target.value)} placeholder="27AABCM..."/></div>
                <div className="form-group"><label className="form-label">Payment Terms</label><input className="form-input" value={form.paymentTerms} onChange={e=>set('paymentTerms',e.target.value)}/></div>
              </div>
              <div className="form-group"><label className="form-label">Address</label><textarea className="form-textarea" rows={2} value={form.address} onChange={e=>set('address',e.target.value)}/></div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Save Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
