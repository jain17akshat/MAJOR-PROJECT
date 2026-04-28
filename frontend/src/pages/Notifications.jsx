import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { getNotifications, markRead, markAllRead, deleteNotification } from '../api/notificationsApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_ICON = { low_stock:'⚠️', expiry_warning:'🕐', expiry_critical:'❌', stock_out:'📦', info:'ℹ️' };
const TYPE_CLASS = { low_stock:'badge-warning', expiry_warning:'badge-warning', expiry_critical:'badge-danger', stock_out:'badge-danger', info:'badge-info' };

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getNotifications({ page, limit: LIMIT, unreadOnly: filter === 'unread' ? true : undefined });
      setNotifs(r.data.data); setTotal(r.data.pagination.total); setUnread(r.data.unreadCount);
    } catch { } finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const handleRead = async (id) => {
    try { await markRead(id); load(); } catch { }
  };

  const handleMarkAll = async () => {
    try { await markAllRead(); toast.success('All marked as read'); load(); } catch { }
  };

  const handleDelete = async (id) => {
    try { await deleteNotification(id); load(); } catch { }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <p style={{ color:'var(--text-muted)' }}>{unread} unread · {total} total</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAll}><CheckCheck size={14}/> Mark All Read</button>
        )}
      </div>

      <div className="tabs" style={{ marginBottom:16 }}>
        {['all','unread'].map(f => (
          <button key={f} className={`tab-btn ${filter===f?'active':''}`} onClick={()=>{setFilter(f);setPage(1);}}>
            {f==='all'?`All (${total})`:`Unread (${unread})`}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        {loading ? <div className="loading-center"><div className="spinner"/></div> : (
          notifs.length === 0 ? (
            <div className="empty-state"><Bell size={48}/><h3>No notifications</h3><p>You're all caught up!</p></div>
          ) : notifs.map(n => (
            <div key={n._id} className={`notif-item${!n.isRead?' unread':''}`} onClick={()=>!n.isRead&&handleRead(n._id)}>
              <div style={{ fontSize:24, flexShrink:0 }}>{TYPE_ICON[n.type]}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontWeight:600, fontSize:14 }}>{n.title}</span>
                  <span className={`badge ${TYPE_CLASS[n.type]}`}>{n.type.replace('_',' ')}</span>
                  {!n.isRead && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--teal)', display:'inline-block' }}/>}
                </div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>{n.message}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{format(new Date(n.createdAt),'dd MMM yyyy, hh:mm a')}</div>
              </div>
              <button className="btn btn-danger btn-icon btn-sm" onClick={e=>{e.stopPropagation();handleDelete(n._id);}}><Trash2 size={12}/></button>
            </div>
          ))
        )}
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
