import { Bell, RefreshCw, Globe, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useThemeStore from '../../stores/themeStore';

const PAGE_TITLES = {
  '/': 'Dashboard', '/products': 'Products', '/products/add': 'Add Product',
  '/stock': 'Stock Management', '/sales': 'Sales', '/analytics': 'Analytics',
  '/reports': 'Reports', '/suppliers': 'Suppliers', '/notifications': 'Notifications',
  '/audit-logs': 'Audit Logs', '/users': 'Users', '/settings': 'Settings',
};

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'hi', label: 'HI', flag: '🇮🇳' },
  { code: 'mr', label: 'MR', flag: '🪔' },
];

export default function Topbar({ onRefresh }) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLang, setShowLang] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

  const title = PAGE_TITLES[location.pathname] || 'Aadish Traders';
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{now}</div>
      </div>
      <div className="topbar-actions">
        {onRefresh && (
          <button className="btn btn-secondary btn-icon" onClick={onRefresh} title="Refresh">
            <RefreshCw size={16} />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="icon icon-enter" key="sun" />
          ) : (
            <Moon size={18} className="icon icon-enter" key="moon" />
          )}
        </button>

        {/* Language Switcher */}
        <div style={{ position: 'relative' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowLang(v => !v)}>
            <Globe size={14} /> {i18n.language.toUpperCase()}
          </button>
          {showLang && (
            <div style={{
              position: 'absolute', right: 0, top: '110%',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '10px', overflow: 'hidden', zIndex: 200, minWidth: '120px',
            }}>
              {LANGS.map(l => (
                <button key={l.code}
                  onClick={() => { i18n.changeLanguage(l.code); setShowLang(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '10px 16px', background: i18n.language === l.code ? 'rgba(0,212,168,0.1)' : 'none',
                    border: 'none', color: i18n.language === l.code ? 'var(--teal)' : 'var(--text-primary)',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  }}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-secondary btn-icon" onClick={() => navigate('/notifications')}>
          <Bell size={18} />
        </button>

        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--teal), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, color: 'var(--btn-primary-text)', cursor: 'pointer'
        }}>AT</div>
      </div>
    </header>
  );
}
