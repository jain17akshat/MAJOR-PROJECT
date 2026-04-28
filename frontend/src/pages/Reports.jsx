import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet } from 'lucide-react';
import { exportReport } from '../api/reportsApi';
import toast from 'react-hot-toast';

const REPORTS = [
  { type: 'products', label: 'Products Report', desc: 'All products with pricing, stock levels, and supplier info', icon: '📦' },
  { type: 'sales', label: 'Sales Report', desc: 'Sales history with invoice details, amounts, and profit', icon: '🧾' },
  { type: 'transactions', label: 'Stock Transactions', desc: 'Complete stock-in/out transaction log', icon: '📋' },
];

export default function Reports() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState({});

  const handleExport = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await exportReport({ type, format: 'xlsx', startDate: startDate || undefined, endDate: endDate || undefined });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url; a.download = `AadishTraders_${type}_${date}.xlsx`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${type} report downloaded!`);
    } catch (err) { toast.error('Export failed: ' + err.message); }
    finally { setLoading(prev => ({ ...prev, [type]: false })); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>{t('reports.title')}</h2><p style={{ color: 'var(--text-muted)' }}>Export data to Excel (.xlsx)</p></div>
      </div>

      {/* Date Filter */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileSpreadsheet size={18} color="var(--teal)" />
          <span style={{ fontWeight: 600 }}>Date Range Filter</span>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">From</label>
          <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: 'auto' }} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">To</label>
          <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: 'auto' }} />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setStartDate(''); setEndDate(''); }}>Clear</button>
      </div>

      {/* Report Cards */}
      <div className="grid-3">
        {REPORTS.map(r => (
          <div key={r.type} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 40 }}>{r.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{r.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</div>
            </div>
            {(startDate || endDate) && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '6px 10px', borderRadius: 6 }}>
                {startDate ? `From: ${startDate}` : ''} {endDate ? `To: ${endDate}` : ''}
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={() => handleExport(r.type)}
              disabled={loading[r.type]}
              style={{ marginTop: 'auto' }}
            >
              <Download size={15} />
              {loading[r.type] ? 'Generating...' : 'Download XLSX'}
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>📌 Bulk Import</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
          Import products in bulk via Excel (.xlsx) or CSV. Go to Products page and use the Import button.
          The file should have columns: name, category, unit, costPrice, sellingPrice, quantity, lowStockThreshold.
        </p>
        <a href="/products/add" className="btn btn-secondary btn-sm">Go to Products → Import</a>
      </div>
    </div>
  );
}
