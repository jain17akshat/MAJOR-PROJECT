import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Package, AlertTriangle, Clock, IndianRupee, ShoppingCart, Layers } from 'lucide-react';
import { getDashboard, getTrends, getTopProducts, getCategoryBreakdown } from '../api/analyticsApi';
import { getSales } from '../api/salesApi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#00d4a8', '#6366f1', '#ff7b54', '#f59e0b', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6'];

const fmtCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function KPICard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="kpi-card" style={{ borderColor: `${color}22` }}>
      <div className="kpi-icon" style={{ background: bg, color }}><Icon size={22} /></div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={{ fontSize: 22 }}>{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {p.name === 'Sales' ? p.value : fmtCurrency(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { t } = useTranslation();
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [kRes, tRes, tpRes, cRes, sRes] = await Promise.all([
        getDashboard(), getTrends({ period: 'daily', days: 14 }),
        getTopProducts({ limit: 5, days: 30 }),
        getCategoryBreakdown(), getSales({ limit: 5 }),
      ]);
      setKpis(kRes.data.data);
      setTrends(tRes.data.data);
      setTopProducts(tpRes.data.data);
      setCategories(cRes.data.data);
      setRecentSales(sRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{t('dashboard.title')}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{t('dashboard.welcome')}</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <KPICard icon={IndianRupee} label={t('dashboard.todayRevenue')} value={fmtCurrency(kpis?.today?.revenue)} sub={`${kpis?.today?.sales || 0} transactions`} color="#00d4a8" bg="rgba(0,212,168,0.12)" />
        <KPICard icon={TrendingUp} label={t('dashboard.todayProfit')} value={fmtCurrency(kpis?.today?.profit)} sub="Today's margin" color="#10b981" bg="rgba(16,185,129,0.12)" />
        <KPICard icon={ShoppingCart} label={t('dashboard.monthRevenue')} value={fmtCurrency(kpis?.month?.revenue)} sub={`${kpis?.month?.sales || 0} sales this month`} color="#6366f1" bg="rgba(99,102,241,0.12)" />
        <KPICard icon={Layers} label={t('dashboard.inventoryValue')} value={fmtCurrency(kpis?.inventory?.inventoryValue)} sub={`${kpis?.inventory?.totalProducts || 0} products`} color="#ff7b54" bg="rgba(255,123,84,0.12)" />
      </div>
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <KPICard icon={Package} label={t('dashboard.totalProducts')} value={kpis?.inventory?.totalProducts || 0} color="#3b82f6" bg="rgba(59,130,246,0.12)" />
        <KPICard icon={AlertTriangle} label={t('dashboard.lowStock')} value={kpis?.inventory?.lowStock || 0} sub="Need restocking" color="#f59e0b" bg="rgba(245,158,11,0.12)" />
        <KPICard icon={Clock} label={t('dashboard.expiringSoon')} value={kpis?.inventory?.expiring || 0} sub="Within 30 days" color="#ec4899" bg="rgba(236,72,153,0.12)" />
        <KPICard icon={TrendingDown} label={t('dashboard.outOfStock')} value={kpis?.inventory?.outOfStock || 0} sub="Immediate attention" color="#ff4d6a" bg="rgba(255,77,106,0.12)" />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <div className="chart-title">Revenue & Profit Trend (14 Days)</div>
          <div className="chart-subtitle">Daily revenue vs profit</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#00d4a8" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#6366f1" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Category Value Breakdown</div>
          <div className="chart-subtitle">Inventory value by category</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categories} dataKey="totalValue" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmtCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        <div className="chart-card">
          <div className="chart-title">Top Products (30 Days)</div>
          <div className="chart-subtitle">By revenue generated</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="productName" tick={{ fill: '#94a3b8', fontSize: 11 }} width={130} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalRevenue" name="Revenue" fill="#00d4a8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Recent Sales</div>
          <div className="chart-subtitle">Last 5 transactions</div>
          <div>
            {recentSales.map((s, i) => (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recentSales.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.invoiceNo}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {s.customerName || 'Walk-in'} · {format(new Date(s.createdAt), 'dd MMM, hh:mm a')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>{fmtCurrency(s.totalAmount)}</div>
                  <div style={{ fontSize: 11, color: 'var(--green)' }}>+{fmtCurrency(s.profit)} profit</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
