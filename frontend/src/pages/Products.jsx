import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Pencil, Trash2, AlertTriangle, Download, Upload } from 'lucide-react';
import { getProducts, deleteProduct } from '../api/productsApi';
import { exportReport } from '../api/reportsApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CATEGORIES = ['all','grains','pulses','oils','spices','dairy','beverages','packaged','flour','sugar_salt','other'];
const fmtINR = (v) => `₹${Number(v||0).toLocaleString('en-IN')}`;

export default function Products() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (filter === 'lowStock') params.lowStock = true;
      if (filter === 'expiring') params.expiring = true;
      const res = await getProducts(params);
      setProducts(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [page, search, category, filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try { await deleteProduct(id); toast.success('Product deactivated'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const handleExport = async () => {
    try {
      const res = await exportReport({ type: 'products' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = 'products.xlsx'; a.click();
      window.URL.revokeObjectURL(url); toast.success('Exported!');
    } catch { toast.error('Export failed'); }
  };

  const pages = Math.ceil(total / LIMIT);
  const isExpiring = (d) => d && new Date(d) <= new Date(Date.now()+30*864e5) && new Date(d) >= new Date();
  const isExpired = (d) => d && new Date(d) < new Date();

  return (
    <div>
      <div className="page-header">
        <div><h2>{t('products.title')}</h2><p style={{color:'var(--text-muted)'}}>{total} products</p></div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14}/> Export</button>
          <button className="btn btn-primary" onClick={() => navigate('/products/add')}><Plus size={16}/> {t('products.addProduct')}</button>
        </div>
      </div>

      <div className="card" style={{marginBottom:16,display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
        <div className="search-bar" style={{flex:1,minWidth:200}}>
          <Search size={15} color="var(--text-muted)"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search products..."/>
        </div>
        <select className="form-select" style={{width:'auto'}} value={category} onChange={e=>{setCategory(e.target.value);setPage(1);}}>
          {CATEGORIES.map(c=><option key={c} value={c}>{c==='all'?'All Categories':t(`categories.${c}`)}</option>)}
        </select>
        <div className="tabs">
          {['all','lowStock','expiring'].map(f=>(
            <button key={f} className={`tab-btn ${filter===f?'active':''}`} onClick={()=>{setFilter(f);setPage(1);}}>
              {f==='all'?'All':f==='lowStock'?'⚠️ Low Stock':'🕐 Expiring'}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrapper">
          {loading ? <div className="loading-center"><div className="spinner"/></div> :
           products.length===0 ? <div className="empty-state"><h3>No products found</h3></div> : (
            <table className="data-table">
              <thead><tr><th>Product</th><th>Category</th><th>SKU</th><th>Stock</th><th>Cost</th><th>Selling</th><th>Margin</th><th>Expiry</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p=>{
                  const low=p.quantity<=p.lowStockThreshold;
                  const expiring=isExpiring(p.expiryDate); const expired=isExpired(p.expiryDate);
                  return(
                  <tr key={p._id}>
                    <td><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{p.unit}</div></td>
                    <td><span className="badge badge-info">{t(`categories.${p.category}`)}</span></td>
                    <td style={{fontFamily:'monospace',fontSize:12,color:'var(--text-muted)'}}>{p.sku}</td>
                    <td>
                      <span style={{fontWeight:600,color:p.quantity===0?'var(--red)':low?'var(--yellow)':'var(--green)'}}>
                        {p.quantity} {p.unit}
                      </span>
                      {low&&p.quantity>0&&<AlertTriangle size={12} color="var(--yellow)" style={{marginLeft:4}}/>}
                      {p.quantity===0&&<span className="badge badge-danger" style={{marginLeft:4}}>Out</span>}
                    </td>
                    <td>{fmtINR(p.costPrice)}</td>
                    <td style={{color:'var(--teal)',fontWeight:600}}>{fmtINR(p.sellingPrice)}</td>
                    <td><span className="badge badge-success">{p.profitMargin}%</span></td>
                    <td>
                      {p.expiryDate?(
                        <span className={`badge ${expired?'badge-danger':expiring?'badge-warning':'badge-teal'}`}>
                          {format(new Date(p.expiryDate),'dd MMM yy')}
                        </span>
                      ):<span style={{color:'var(--text-muted)'}}>—</span>}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>navigate(`/products/edit/${p._id}`)}><Pencil size={13}/></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={()=>handleDelete(p._id,p.name)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>
        {pages>1&&(
          <div className="pagination" style={{padding:'12px 16px'}}>
            <span style={{fontSize:13,color:'var(--text-muted)'}}>{total} total</span>
            <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
            {Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p=>(
              <button key={p} className={`page-btn ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={page===pages} onClick={()=>setPage(p=>p+1)}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
