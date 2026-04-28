import { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '../api/auditApi';
import { format } from 'date-fns';

const ACTION_CLASS = { CREATE:'badge-success', UPDATE:'badge-info', DELETE:'badge-danger', STOCK_IN:'badge-teal', STOCK_OUT:'badge-warning' };

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [loading, setLoading] = useState(true);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getAuditLogs({ page, limit: LIMIT, entity: entity || undefined });
      setLogs(r.data.data); setTotal(r.data.pagination.total);
    } catch { } finally { setLoading(false); }
  }, [page, entity]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="page-header">
        <div><h2>Audit Logs</h2><p style={{ color:'var(--text-muted)' }}>{total} log entries</p></div>
      </div>

      <div className="card" style={{ marginBottom:16, display:'flex', gap:12, alignItems:'center' }}>
        <label className="form-label" style={{ margin:0 }}>Filter by Entity:</label>
        <select className="form-select" style={{ width:'auto' }} value={entity} onChange={e=>{setEntity(e.target.value);setPage(1);}}>
          <option value="">All</option>
          <option value="Product">Product</option>
          <option value="StockTransaction">Stock</option>
          <option value="Sale">Sale</option>
          <option value="Supplier">Supplier</option>
        </select>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrapper">
          {loading ? <div className="loading-center"><div className="spinner"/></div> : (
            <table className="data-table">
              <thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>Name</th><th>Performed By</th><th>IP</th></tr></thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No audit logs found</td></tr>
                ) : logs.map(l => (
                  <tr key={l._id}>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{format(new Date(l.createdAt),'dd MMM yy, hh:mm a')}</td>
                    <td><span className={`badge ${ACTION_CLASS[l.action]||'badge-info'}`}>{l.action}</span></td>
                    <td style={{ color:'var(--purple)', fontSize:13 }}>{l.entity}</td>
                    <td style={{ fontWeight:500, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.entityName||'—'}</td>
                    <td>{l.performedBy?.name||'System'}</td>
                    <td style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'monospace' }}>{l.ip||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pages > 1 && (
          <div className="pagination" style={{ padding:'12px 16px' }}>
            <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{page}/{pages}</span>
            <button className="page-btn" disabled={page===pages} onClick={()=>setPage(p=>p+1)}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
