import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Registro del Service Worker para capacidades PWA Offline-First
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[GlaciAgua PWA] Service Worker registrado exitosamente:', reg.scope)
      })
      .catch((err) => {
        console.warn('[GlaciAgua PWA] Error al registrar Service Worker:', err)
      })
  })
} else if ('serviceWorker' in navigator) {
  // En desarrollo o testing local en navegador
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.log('[GlaciAgua PWA Dev] SW registration info:', err))
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
