import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { SpeedInsights } from '@vercel/speed-insights/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <SpeedInsights />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#1c1c1e',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(37,99,235,0.12)',
          border: '1px solid rgba(37,99,235,0.08)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#2563eb', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#e74c3c', secondary: '#fff' },
        },
      }}
    />
  </React.StrictMode>,
)
