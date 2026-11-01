import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { I18nProvider } from './i18n/I18nContext'

// Registro del Service Worker para capacidades PWA Offline-First
if ('serviceWorker' in navigator && import.meta.env.PROD) {
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
  // En modo desarrollo: limpiar y desregistrar SW para evitar colisiones con Vite HMR
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
)
