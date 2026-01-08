import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { migrateSyncQueueEndpoints } from './utils/migrateSyncQueue.js'; // Migration utility

// Migrate old sync queue endpoints on app load
migrateSyncQueueEndpoints().catch(console.error);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

// Log online/offline status
window.addEventListener('online', () => {
  console.log('🟢 Network: Online');
});

window.addEventListener('offline', () => {
  console.log('🔴 Network: Offline');
});

// Log app startup
console.log(`
╔════════════════════════════════════════╗
║      👻 GhostClass - Client Ready     ║
╠════════════════════════════════════════╣
║   Mode: ${import.meta.env.MODE}                    ║
║   PWA:  ${('serviceWorker' in navigator) ? 'Supported ✅' : 'Not Supported ❌'}        ║
║   Network: ${navigator.onLine ? 'Online 🟢' : 'Offline 🔴'}             ║
╚════════════════════════════════════════╝
`);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
