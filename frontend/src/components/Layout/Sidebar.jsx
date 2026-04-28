import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Package, ArrowLeftRight, ShoppingCart,
  BarChart2, FileText, Truck, Bell, ClipboardList, Users, Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getNotifications } from '../../api/notificationsApi';

const NAV = [
  { section: 'Main', items: [
    { to: '/', label: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'nav.products', icon: Package },
    { to: '/stock', label: 'nav.stock', icon: ArrowLeftRight },
    { to: '/sales', label: 'nav.sales', icon: ShoppingCart },
  ]},
  { section: 'Insights', items: [
    { to: '/analytics', label: 'nav.analytics', icon: BarChart2 },
    { to: '/reports', label: 'nav.reports', icon: FileText },
  ]},
  { section: 'Management', items: [
    { to: '/suppliers', label: 'nav.suppliers', icon: Truck },
    { to: '/notifications', label: 'nav.notifications', icon: Bell, badge: true },
    { to: '/audit-logs', label: 'nav.auditLogs', icon: ClipboardList },
    { to: '/users', label: 'nav.users', icon: Users },
    { to: '/settings', label: 'nav.settings', icon: Settings },
  ]},
];

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getNotifications({ unreadOnly: true, limit: 1 })
      .then(r => setUnread(r.data.unreadCount || 0))
      .catch(() => {});
    const iv = setInterval(() => {
      getNotifications({ unreadOnly: true, limit: 1 })
        .then(r => setUnread(r.data.unreadCount || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🏪 Aadish Traders</h1>
        <p>Inventory Management System</p>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="nav-section-title">{group.section}</div>
            {group.items.map(({ to, label, icon: Icon, badge }) => {
              const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
              return (
                <Link key={to} to={to} className={`nav-item ${active ? 'active' : ''}`}>
                  <Icon size={18} className="nav-icon" />
                  {t(label)}
                  {badge && unread > 0 && <span className="nav-badge">{unread > 99 ? '99+' : unread}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
        v1.0.0 · Aadish Traders IMS
      </div>
    </aside>
  );
}
