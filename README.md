# 👻 GhostClass

> **Offline-First PWA for Rural Education** | *"Teach even when the internet ghosts you."*

An educational platform that works 100% offline and syncs when connectivity returns. Built for India's 36.5% of schools without internet access.

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Start everything
docker-compose up

# Access the app
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```

### Option 2: Local Development
```bash
# Terminal 1 - Frontend
cd frontend
npm install
npm run dev

# Terminal 2 - Backend
cd backend
npm install
npm run dev
```

**Prerequisites:** Docker & Docker Compose OR Node.js 18+

---

## 🧪 Testing the Offline Magic

1. **Login** → Use any username (e.g., "DemoTeacher")
2. **Create Quiz** → Add questions while online
3. **Go Offline** → DevTools → Network → Check "Offline"
4. **Create Another Quiz** → Still works! Data saves to IndexedDB
5. **Take Quiz Offline** → Submit answers
6. **Go Online** → Uncheck "Offline" → Watch burst sync happen
7. **Check Sync Page** → See real-time sync activity

---

## 📁 Project Structure

```
EdgeClass/
├── docker-compose.yml           # Single-command deployment
│
├── frontend/                    # React PWA (Port 5173)
│   ├── src/
│   │   ├── db/                  # 📦 IndexedDB Layer (Primary Database)
│   │   │   ├── index.js         # Dexie setup + Device ID
│   │   │   ├── quizzes.js       # Quiz CRUD operations
│   │   │   ├── attempts.js      # Attempt operations
│   │   │   └── users.js         # User operations
│   │   │
│   │   ├── sync/                # 🔄 Sync Engine
│   │   │   ├── syncManager.js   # Burst sync with exponential backoff
│   │   │   └── useSyncStatus.js # React hook for sync status
│   │   │
│   │   ├── pages/               # 📄 Main Pages
│   │   │   ├── Login.jsx        # Device-based auth
│   │   │   ├── Dashboard.jsx    # Stats + Quiz/Attempt views
│   │   │   ├── CreateQuiz.jsx   # Multi-question builder
│   │   │   ├── Quiz.jsx         # Question navigator + offline submit
│   │   │   └── SyncPage.jsx     # Real-time sync activity
│   │   │
│   │   ├── components/          # 🧩 UI Components
│   │   │   ├── Layout.jsx       # App shell with header
│   │   │   ├── OfflineBadge.jsx # Connection indicator
│   │   │   ├── SyncStatus.jsx   # Sync progress display
│   │   │   ├── QuizCard.jsx     # Quiz grid item
│   │   │   └── LoadingSpinner.jsx
│   │   │
│   │   └── App.jsx              # Router + sync initialization
│   │
│   ├── public/
│   │   └── manifest.json        # PWA configuration
│   └── vite.config.js           # Service Worker setup (vite-plugin-pwa)
│
└── backend/                     # Node.js API (Port 3000)
    ├── server.js                # Express server + routes
    ├── db/
    │   └── init.js              # SQLite schema (backup database)
    └── routes/
        ├── sync.js              # POST /api/sync
        └── stats.js             # GET /api/stats
```

---

## 🏗️ Architecture Explained

**Core Philosophy:** *"The device is truth. The server is backup."*

```
USER DEVICE (Primary)              SYNC SERVER (Backup)
┌─────────────────┐                ┌──────────────┐
│  React PWA      │                │  Node.js API │
│  ┌───────────┐  │                │              │
│  │ IndexedDB │◄─┼────────────────┼─ Never reads │
│  │ (Dexie)   │  │  Writes only   │   from here  │
│  └───────────┘  │                │              │
│       ▲         │                │  ┌─────────┐ │
│       │ CRUD    │   Burst Sync   │  │ SQLite  │ │
│       │         │   (5s→15s→45s) │  │ (Backup)│ │
│  ┌────┴──────┐  │◄──────────────►│  └─────────┘ │
│  │ UI Pages  │  │  When online   │              │
│  └───────────┘  │                │  Analytics + │
│                 │                │  Audit Trail │
│  Service Worker │                └──────────────┘
│  (Workbox)      │
└─────────────────┘
```

**Flow:**
1. User creates quiz → Saved to IndexedDB instantly
2. Data added to sync queue with `pending` status
3. Sync manager checks connectivity every 5 seconds
4. When online → Batch sends to backend (max 5 items)
5. Backend stores in SQLite (backup + analytics)
6. Retry with exponential backoff if sync fails (5s → 15s → 45s)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Fast HMR, modern dev experience |
| | Dexie.js | Promise-based IndexedDB wrapper |
| | Workbox | Service Worker caching strategies |
| | Tailwind CSS | Utility-first styling |
| **Backend** | Express | Lightweight sync API |
| | Better-SQLite3 | Synchronous DB for burst sync |
| **DevOps** | Docker Compose | Single-command deployment |

---

## 💻 Development Guide

### Adding New Features

#### 1. **Add a New Page**
```javascript
// frontend/src/pages/NewPage.jsx
import { Layout } from '../components/Layout';

export default function NewPage() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold">New Page</h1>
    </Layout>
  );
}

// Add route in App.jsx
import NewPage from './pages/NewPage';
// In <Routes>:
<Route path="/new" element={<NewPage />} />
```

#### 2. **Add a New IndexedDB Table**
```javascript
// frontend/src/db/index.js
export const db = new Dexie('GhostClassDB');
db.version(1).stores({
  // ... existing tables
  newTable: '++id, field1, field2, createdAt'
});

// Create operations file: frontend/src/db/newTable.js
import { db } from './index';

export async function createItem(data) {
  return await db.newTable.add({
    ...data,
    createdAt: Date.now()
  });
}
```

#### 3. **Add a Sync Endpoint**
```javascript
// backend/routes/newSync.js
export function syncNewItems(req, res) {
  const { items } = req.body;
  const stmt = db.prepare(
    'INSERT INTO new_table (id, data) VALUES (?, ?)'
  );
  
  const transaction = db.transaction(() => {
    items.forEach(item => stmt.run(item.id, item.data));
  });
  
  transaction();
  res.json({ synced: items.length });
}

// Register in backend/server.js
import { syncNewItems } from './routes/newSync.js';
app.post('/api/sync/new', syncNewItems);
```

### Debugging Tips

**Check IndexedDB:**
- DevTools → Application → IndexedDB → GhostClassDB
- Inspect tables: quizzes, questions, attempts, syncQueue

**Monitor Sync:**
- Navigate to `/sync` page in app
- See real-time sync activity and errors

**Backend Logs:**
```bash
docker-compose logs -f backend
```

**Frontend Build Issues:**
```bash
# Clear cache and rebuild
docker-compose down
docker-compose up --build
```

---

## 🎯 Key Concepts

### Offline-First Pattern
- **Write:** Always to IndexedDB (instant)
- **Sync:** Queue operations, retry with backoff
- **Conflict:** Latest timestamp wins

### Service Worker Caching
- Configured in `vite.config.js` with `vite-plugin-pwa`
- Caches assets automatically
- Updates on new deployment

### Sync Queue
- Every mutation adds to `syncQueue` table
- Status: `pending` → `synced` or `failed`
- Auto-retry: 5 attempts with exponential backoff (5s, 15s, 45s, 2m, 5m)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port 5173 already in use** | `docker-compose down` or kill process on port |
| **PostCSS errors** | Ensure `postcss.config.js` uses `export default` (not `module.exports`) |
| **Tailwind classes not working** | Check `tailwind.config.js` content paths include all source files |
| **Sync not working** | Check DevTools console for errors, verify backend is running on port 3000 |
| **IndexedDB not updating** | Clear browser data or use Incognito mode for fresh state |

---

## 📚 Additional Resources

- **IndexedDB Guide:** [Dexie.js Documentation](https://dexie.org)
- **Service Workers:** [Workbox Docs](https://developer.chrome.com/docs/workbox/)
- **PWA Best Practices:** [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps/)

---

## 🎤 Demo Script (5 min)

1. **Problem** (30s): "36.5% of Indian schools have no internet. Teachers can't use cloud-first EdTech."
2. **Solution** (30s): "Offline-first PWA. Device is database. Server is backup."
3. **Live Demo** (3m):
   - Login → Create quiz online
   - Go offline → Create quiz → Take quiz
   - Go online → Show burst sync
4. **Tech Deep Dive** (1m): "IndexedDB, Service Workers, exponential backoff sync"

---

**Built with ❤️ for rural educators. Ready to deploy, ready to scale.**
