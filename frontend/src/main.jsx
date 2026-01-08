import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { migrateSyncQueueEndpoints } from './utils/migrateSyncQueue.js'; // Migration utility

// Migrate old sync queue endpoints on app load
console.log('🔄 [STARTUP] Migrating sync queue endpoints...');
migrateSyncQueueEndpoints()
  .then(() => console.log('✅ [STARTUP] Sync queue migration complete'))
  .catch(err => console.error('❌ [STARTUP] Migration failed:', err));

// Log online/offline status
window.addEventListener('online', () => {
  console.log('🟢 [NETWORK] Status changed: ONLINE');
});

window.addEventListener('offline', () => {
  console.log('🔴 [NETWORK] Status changed: OFFLINE');
});

// Detailed app startup logging
const startupInfo = {
  mode: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  online: navigator.onLine,
  userAgent: navigator.userAgent,
  location: window.location.href,
  timestamp: new Date().toISOString()
};

console.log(`
╔════════════════════════════════════════╗
║      🌾 Edge Class - Client Ready     ║
╠════════════════════════════════════════╣
║   Mode: ${import.meta.env.MODE.padEnd(27)}║
║   API: ${(import.meta.env.VITE_API_URL || 'http://localhost:3000').substring(0, 28).padEnd(28)}║
║   Network: ${navigator.onLine ? 'Online 🟢' : 'Offline 🔴'}                  ║
║   Route: ${window.location.pathname.padEnd(28)}║
╚════════════════════════════════════════╝
`);

console.log('📊 [STARTUP] Full configuration:', startupInfo);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
