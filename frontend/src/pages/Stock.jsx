import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownToLine, ArrowUpFromLine, History } from 'lucide-react';
import { stockIn, stockOut, getTransactions } from '../api/stockApi';
import { getProducts } from '../api/productsApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Stock() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('in');
  const [products, setProducts] = useState([]);
  const [txns, setTxns] = useState([]);
  const [txnTotal, setTxnTotal] = useState(0);
  const [txnPage, setTxnPage] = useState(1);
  const [form, setForm] = useState({ productId: '', quantity: '', reason: '', notes: '', unitPrice: '', batchNo: '', expiryDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProducts({ limit: 200, isActive: true }).then(r => setProducts(r.data.data)).catch(() => {});
  }, []);

  const loadTxns = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getTransactions({ page: txnPage, limit: 15 });
      setTxns(r.data.data); setTxnTotal(r.data.pagination.total);
    } catch { } finally { setLoading(false); }
  }, [txnPage]);

  useEffect(() => { loadTxns(); }, [loadTxns]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.quantity) return toast.error('Product and quantity required');
    setSubmitting(true);
    try {
      const payload = { productId: form.productId, quantity: Number(form.quantity), reason: form.reason, notes: form.notes };
      if (tab === 'in') {
        if (form.unitPrice) payload.unitPrice = Number(form.unitPrice);
        if (form.batchNo) payload.batchNo = form.batchNo;
        if (form.expiryDate) payload.expiryDate = form.expiryDate;
        await stockIn(payload);
        toast.success('Stock added successfully!');
      } else {
        await stockOut(payload);
        toast.success('Stock deducted successfully!');
      }
      setForm({ productId: '', quantity: '', reason: '', notes: '', unitPrice: '', batchNo: '', expiryDate: '' });
      loadTxns();
      getProducts({ limit: 200 }).then(r => setProducts(r.data.data)).catch(() => {});
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const selectedProduct = products.find(p => p._id === form.productId);
  const TXNPAGES = Math.ceil(txnTotal / 15);

  return (
    <div>
      <div className="page-header">
        <div><h2>{t('stock.title')}</h2><p style={{ color: 'var(--text-muted)' }}>Record stock in/out transactions</p></div>
      </div>
      <div className="grid-2" style={{ marginBottom: 24, alignItems: 'start' }}>
        {/* Form */}
        <div className="card">
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab-btn ${tab === 'in' ? 'active' : ''}`} onClick={() => setTab('in')}>
              <ArrowDownToLine size={14} style={{ display: 'inline', marginRight: 6 }} />{t('stock.stockIn')}
            </button>
            <button className={`tab-btn ${tab === 'out' ? 'active' : ''}`} onClick={() => setTab('out')}>
              <ArrowUpFromLine size={14} style={{ display: 'inline', marginRight: 6 }} />{t('stock.stockOut')}
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">{t('stock.selectProduct')} *</label>
              <select className="form-select" value={form.productId} onChange={e => set('productId', e.target.value)}>
                <option value="">-- Select Product --</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (Stock: {p.quantity} {p.unit})</option>
                ))}
              </select>
            </div>
            {selectedProduct && (
              <div style={{ padding: '10px 14px', background: 'rgba(0,212,168,0.08)', borderRadius: 8, fontSize: 13 }}>
                Current Stock: <strong style={{ color: 'var(--teal)' }}>{selectedProduct.quantity} {selectedProduct.unit}</strong>
                &nbsp;| Threshold: <strong>{selectedProduct.lowStockThreshold}</strong>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">{t('stock.quantity')} *</label>
              <input className="form-input" type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
            </div>
            {tab === 'in' && (
              <>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹)</label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.unitPrice} onChange={e => set('unitPrice', e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label className="form-label">Batch No</label>
                  <input className="form-input" value={form.batchNo} onChange={e => set('batchNo', e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">{t('stock.reason')}</label>
              <input className="form-input" value={form.reason} onChange={e => set('reason', e.target.value)} placeholder={tab === 'in' ? 'e.g. Purchase, Return' : 'e.g. Sale, Damage'} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('stock.notes')}</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Processing...' : tab === 'in' ? '📥 Add Stock' : '📤 Deduct Stock'}
            </button>
          </form>
        </div>

        {/* Recent Transactions */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={16} color="var(--teal)" />
            <span style={{ fontWeight: 600 }}>Recent Transactions</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{txnTotal} total</span>
          </div>
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div>
              {txns.map(tx => (
                <div key={tx._id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{tx.product?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.reason || '—'} · {format(new Date(tx.createdAt), 'dd MMM, hh:mm a')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, color: tx.type === 'stock_in' ? 'var(--green)' : 'var(--red)', fontSize: 14 }}>
                      {tx.type === 'stock_in' ? '+' : '-'}{tx.quantity} {tx.product?.unit}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.previousQty} → {tx.newQty}</div>
                  </div>
                </div>
              ))}
              {TXNPAGES > 1 && (
                <div className="pagination" style={{ padding: '10px 16px' }}>
                  <button className="page-btn" disabled={txnPage === 1} onClick={() => setTxnPage(p => p - 1)}>‹</button>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{txnPage}/{TXNPAGES}</span>
                  <button className="page-btn" disabled={txnPage === TXNPAGES} onClick={() => setTxnPage(p => p + 1)}>›</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
