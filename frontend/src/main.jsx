import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n/i18n.js';
import { Toaster } from 'react-hot-toast';

// Import theme store so it runs on load (applies data-theme attribute)
import './stores/themeStore.js';

function ThemedToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-accent)',
          borderRadius: '12px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: 'var(--teal)', secondary: 'var(--bg-card)' } },
        error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--bg-card)' } },
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ThemedToaster />
  </React.StrictMode>
);
