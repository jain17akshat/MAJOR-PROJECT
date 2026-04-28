import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n/i18n.js';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1a2235',
          color: '#e2e8f0',
          border: '1px solid rgba(0,212,168,0.2)',
          borderRadius: '12px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#00d4a8', secondary: '#1a2235' } },
        error: { iconTheme: { primary: '#ff4d6a', secondary: '#1a2235' } },
      }}
    />
  </React.StrictMode>
);
