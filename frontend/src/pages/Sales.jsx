import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { createSale, getSales } from '../api/salesApi';
import { getProducts } from '../api/productsApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const fmtINR = v => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const PAYMENT_MODES = ['cash', 'upi', 'credit', 'cheque', 'neft'];

export default function Sales() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('list');
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: '' }]);
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const LIMIT = 15;

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getSales({ page, limit: LIMIT });
      setSales(r.data.data); setTotal(r.data.pagination.total);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { loadSales(); }, [loadSales]);
  useEffect(() => {
    getProducts({ limit: 200, isActive: true }).then(r => setProducts(r.data.data)).catch(() => {});
  }, []);

  const addItem = () => setItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: '' }]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, k, v) => setItems(prev => prev.map((item, idx) => {
    if (idx !== i) return item;
    const updated = { ...item, [k]: v };
    if (k === 'productId') {
      const p = products.find(p => p._id === v);
      if (p) updated.unitPrice = p.sellingPrice;
    }
    return updated;
  }));

  const subtotal = items.reduce((sum, item) => {
    const p = products.find(p => p._id === item.productId);
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || p?.sellingPrice || 0);
  }, 0);
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (!validItems.length) return toast.error('Add at least one item');
    setSubmitting(true);
    try {
      await createSale({
        items: validItems.map(i => ({ productId: i.productId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) || undefined })),
        paymentMode, customerName: customer, customerPhone: phone,
      });
      toast.success('Sale recorded successfully!');
      setItems([{ productId: '', quantity: 1, unitPrice: '' }]);
      setCustomer(''); setPhone(''); setPaymentMode('cash');
      setTab('list'); loadSales();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="page-header">
        <div><h2>{t('sales.title')}</h2><p style={{ color: 'var(--text-muted)' }}>{total} total sales</p></div>
        <button className="btn btn-primary" onClick={() => setTab(tab === 'new' ? 'list' : 'new')}>
          <Plus size={16} /> {tab === 'new' ? 'View Sales' : t('sales.newSale')}
        </button>
      </div>

      {tab === 'new' ? (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>🧾 New Sale</div>
            <form onSubmit={handleSubmit}>
              {/* Items */}
              {items.map((item, i) => {
                const p = products.find(p => p._id === item.productId);
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 36px', gap: 10, marginBottom: 12, alignItems: 'end' }}>
                    <div className="form-group">
                      {i === 0 && <label className="form-label">Product</label>}
                      <select className="form-select" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                        <option value="">Select product</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.quantity} {p.unit})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      {i === 0 && <label className="form-label">Qty</label>}
                      <input className="form-input" type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                    </div>
                    <div className="form-group">
                      {i === 0 && <label className="form-label">Unit Price (₹)</label>}
                      <input className="form-input" type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} placeholder={p?.sellingPrice || ''} />
                    </div>
                    <button type="button" className="btn btn-danger btn-icon" onClick={() => removeItem(i)} style={{ alignSelf: 'flex-end' }}><Trash2 size={13} /></button>
                  </div>
                );
              })}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginBottom: 20 }}>
                <Plus size={13} /> Add Item
              </button>

              {/* Summary */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>{fmtINR(subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: 'var(--text-muted)' }}>GST (5%)</span><span>{fmtINR(gst)}</span></div>
                <hr className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}><span>Total</span><span style={{ color: 'var(--teal)' }}>{fmtINR(grandTotal)}</span></div>
              </div>

              {/* Customer & Payment */}
              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input className="form-input" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Walk-in" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select className="form-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                <ShoppingCart size={16} /> {submitting ? 'Recording...' : 'Record Sale'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            {loading ? <div className="loading-center"><div className="spinner" /></div> : (
              <table className="data-table">
                <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Profit</th><th>Payment</th></tr></thead>
                <tbody>
                  {sales.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600, color: 'var(--teal)', fontFamily: 'monospace' }}>{s.invoiceNo}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(s.createdAt), 'dd MMM yy, hh:mm a')}</td>
                      <td>{s.customerName || 'Walk-in'}</td>
                      <td style={{ fontSize: 12 }}>{s.items.length} item{s.items.length !== 1 ? 's' : ''}</td>
                      <td style={{ fontWeight: 700 }}>{fmtINR(s.totalAmount)}</td>
                      <td style={{ color: 'var(--green)', fontWeight: 600 }}>{fmtINR(s.profit)}</td>
                      <td><span className="badge badge-info">{s.paymentMode?.toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {pages > 1 && (
            <div className="pagination" style={{ padding: '12px 16px' }}>
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{page}/{pages}</span>
              <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
