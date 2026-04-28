import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTrends, getTopProducts, getSlowMoving, getCategoryBreakdown, getRestockSuggestions } from '../api/analyticsApi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#00d4a8','#6366f1','#ff7b54','#f59e0b','#ec4899','#10b981','#3b82f6','#8b5cf6'];
const fmtINR = v => `₹${Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:0})}`;

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
      <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{label}</div>
      {payload.map((p,i) => <div key={i} style={{ color:p.color, fontSize:13, fontWeight:600 }}>{p.name}: {typeof p.value === 'number' && p.name !== 'Sales' ? fmtINR(p.value) : p.value}</div>)}
    </div>
  );
};

export default function Analytics() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('daily');
  const [trends, setTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [slowMoving, setSlowMoving] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restock, setRestock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trends');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTrends({ period, days: period === 'daily' ? 30 : period === 'weekly' ? 84 : 365 }),
      getTopProducts({ limit: 10, days: 30 }),
      getSlowMoving({ days: 30 }),
      getCategoryBreakdown(),
      getRestockSuggestions(),
    ]).then(([t, tp, sm, c, r]) => {
      setTrends(t.data.data); setTopProducts(tp.data.data);
      setSlowMoving(sm.data.data); setCategories(c.data.data);
      setRestock(r.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h2>{t('analytics.title')}</h2><p style={{ color:'var(--text-muted)' }}>Business insights & performance</p></div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {['trends','topProducts','slowMoving','categories','restock'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>
            {tab==='trends'?'📈 Trends':tab==='topProducts'?'🏆 Top Products':tab==='slowMoving'?'🐢 Slow Moving':tab==='categories'?'🗂 Categories':'🔄 Restock'}
          </button>
        ))}
      </div>

      {activeTab === 'trends' && (
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div><div className="chart-title">Sales Trends</div><div className="chart-subtitle">Revenue and profit over time</div></div>
            <div className="tabs">
              {['daily','weekly','monthly'].map(p => (
                <button key={p} className={`tab-btn ${period===p?'active':''}`} onClick={() => setPeriod(p)}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill:'#64748b', fontSize:11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill:'#64748b', fontSize:11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<TTip />} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#00d4a8" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="sales" name="Sales" stroke="#ff7b54" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'topProducts' && (
        <div className="card">
          <div className="chart-title" style={{ marginBottom:4 }}>Top Selling Products</div>
          <div className="chart-subtitle">Last 30 days by revenue</div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill:'#64748b', fontSize:11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="productName" tick={{ fill:'#94a3b8', fontSize:12 }} width={160} />
              <Tooltip content={<TTip />} />
              <Bar dataKey="totalRevenue" name="Revenue" fill="url(#tealGrad)" radius={[0,6,6,0]}>
                {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="table-wrapper" style={{ marginTop:20 }}>
            <table className="data-table">
              <thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
              <tbody>
                {topProducts.map((p,i) => (
                  <tr key={p._id}><td style={{ color:'var(--text-muted)' }}>#{i+1}</td><td style={{ fontWeight:600 }}>{p.productName}</td><td>{p.totalQty}</td><td style={{ color:'var(--teal)', fontWeight:700 }}>{fmtINR(p.totalRevenue)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'slowMoving' && (
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
            <div className="chart-title">Slow Moving / Dead Stock</div>
            <div className="chart-subtitle">Products with no sales in last 30 days</div>
          </div>
          <table className="data-table">
            <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Stock Value</th></tr></thead>
            <tbody>
              {slowMoving.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>🎉 All products are moving!</td></tr>
              ) : slowMoving.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight:600 }}>{p.name}</td>
                  <td><span className="badge badge-info">{p.category}</span></td>
                  <td>{p.quantity} {p.unit}</td>
                  <td style={{ color:'var(--yellow)', fontWeight:600 }}>{fmtINR(p.stockValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid-2">
          <div className="card">
            <div className="chart-title" style={{ marginBottom:16 }}>Inventory by Category</div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categories} dataKey="totalValue" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label={({ _id, percent }) => `${_id} (${(percent*100).toFixed(0)}%)`} labelLine={false}>
                  {categories.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmtINR(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding:0 }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:600 }}>Category Summary</div>
            <table className="data-table">
              <thead><tr><th>Category</th><th>Products</th><th>Stock Value</th></tr></thead>
              <tbody>
                {categories.map((c,i) => (
                  <tr key={c._id}>
                    <td><span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:COLORS[i%COLORS.length], marginRight:8 }} />{c._id}</td>
                    <td>{c.count}</td>
                    <td style={{ color:'var(--teal)', fontWeight:600 }}>{fmtINR(c.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'restock' && (
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
            <div className="chart-title">🔄 Restock Suggestions</div>
            <div className="chart-subtitle">Based on 7-day sales average</div>
          </div>
          <table className="data-table">
            <thead><tr><th>Product</th><th>Current Stock</th><th>Avg/Day</th><th>Days Left</th><th>Suggest Reorder</th><th>Est. Cost</th><th>Urgency</th></tr></thead>
            <tbody>
              {restock.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No urgent restock needed!</td></tr>
              ) : restock.map(r => (
                <tr key={r.productId}>
                  <td style={{ fontWeight:600 }}>{r.productName}</td>
                  <td>{r.currentStock} {r.unit}</td>
                  <td>{r.avgDailySales}</td>
                  <td style={{ color:r.daysOfStock<=3?'var(--red)':r.daysOfStock<=7?'var(--yellow)':'var(--text-primary)', fontWeight:600 }}>{r.daysOfStock} days</td>
                  <td style={{ color:'var(--teal)', fontWeight:700 }}>{r.suggestedReorderQty} {r.unit}</td>
                  <td>{fmtINR(r.estimatedCost)}</td>
                  <td><span className={`badge ${r.urgency==='critical'?'badge-danger':r.urgency==='high'?'badge-warning':'badge-info'}`}>{r.urgency}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
