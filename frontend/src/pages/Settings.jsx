import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Globe, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const LANGS = [
  { code:'en', label:'English', flag:'🇬🇧' },
  { code:'hi', label:'हिन्दी (Hindi)', flag:'🇮🇳' },
  { code:'mr', label:'मराठी (Marathi)', flag:'🪔' },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const handleSave = () => {
    i18n.changeLanguage(lang);
    toast.success('Settings saved!');
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div><h2>{t('settings.title')}</h2><p style={{ color:'var(--text-muted)' }}>Configure your IMS preferences</p></div>
      </div>

      {/* Language */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <Globe size={18} color="var(--teal)"/>
          <span style={{ fontWeight:700, fontSize:15 }}>{t('settings.language')}</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {LANGS.map(l => (
            <label key={l.code} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:10, border:`1px solid ${lang===l.code?'var(--teal)':'var(--border)'}`, cursor:'pointer', background:lang===l.code?'rgba(0,212,168,0.07)':'none', transition:'all 0.2s' }}>
              <input type="radio" name="lang" value={l.code} checked={lang===l.code} onChange={()=>setLang(l.code)} style={{ accentColor:'var(--teal)' }}/>
              <span style={{ fontSize:22 }}>{l.flag}</span>
              <span style={{ fontWeight:500, fontSize:14 }}>{l.label}</span>
              {lang===l.code && <span className="badge badge-teal" style={{ marginLeft:'auto' }}>Active</span>}
            </label>
          ))}
        </div>
      </div>

      {/* Business Info */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>🏪 Business Information</div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Business Name</label><input className="form-input" defaultValue="Aadish Traders" readOnly style={{ opacity:0.7 }}/></div>
          <div className="form-group"><label className="form-label">GST Number</label><input className="form-input" placeholder="Enter GSTIN"/></div>
          <div className="form-group"><label className="form-label">City</label><input className="form-input" placeholder="e.g. Pune"/></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+91 XXXXXXXXXX"/></div>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>⚙️ Alert Configuration</div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Expiry Warning Days</label><input className="form-input" type="number" defaultValue={30} min={1}/></div>
          <div className="form-group"><label className="form-label">Critical Expiry Days</label><input className="form-input" type="number" defaultValue={7} min={1}/></div>
        </div>
        <div className="card" style={{ marginTop:12, background:'rgba(0,212,168,0.06)', border:'1px solid rgba(0,212,168,0.2)' }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <Info size={16} color="var(--teal)" style={{ flexShrink:0, marginTop:2 }}/>
            <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
              The system automatically runs daily checks at 8:00 AM for expiry and low-stock alerts. Alerts appear in the Notifications panel and the sidebar badge.
            </p>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave}><Save size={16}/> {t('settings.save')}</button>

      {/* System Info */}
      <div className="card" style={{ marginTop:20 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>ℹ️ System Information</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13 }}>
          {[['App Name','Aadish Traders IMS'],['Version','v1.0.0'],['Backend','Node.js + Express'],['Database','MongoDB'],['Frontend','React + Vite']].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'var(--bg-primary)', borderRadius:8 }}>
              <span style={{ color:'var(--text-muted)' }}>{k}</span>
              <span style={{ fontWeight:600, color:'var(--teal)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
