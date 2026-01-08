# Edge Class

> **"Teach even when the internet ghosts you."**

An offline-first education platform that works 100% without internet and syncs when connectivity returns. Built for India's 36.5% of schools lacking reliable internet access.

---

## The Problem

In rural India, internet connectivity is unpredictable or non-existent, making traditional cloud-based education platforms unusable. Teachers and students lose access to their work mid-session, face data loss, and cannot complete educational tasks without constant connectivity.

## The Solution

Edge Class treats the user's device as the **primary source of truth**, not the server. All operations happen locally first, with intelligent background synchronization when connectivity returns.

**One-liner:** *Local-first education PWA that enables quiz creation, test-taking, and grading entirely offline with automatic sync.*

---

## Core Features

### For Teachers
- Create quizzes with multiple questions **completely offline**
- Manage questions with automatic local storage
- View student attempts and analytics
- All data persists locally and syncs automatically

### For Students  
- Take quizzes without internet connection
- Submit answers offline (stored locally)
- View scores and performance history
- Seamless sync when online

### Smart Sync System
- **Batched Synchronization**: Groups offline actions and syncs efficiently
- **Exponential Backoff**: Retries failed syncs intelligently (5s → 10s → 20s...)
- **Conflict Resolution**: Last-write-wins strategy for data conflicts
- **Queue Management**: Respects foreign key dependencies during sync
- **Visual Feedback**: Real-time sync status indicator

---

## Architecture

### Local-First Design
```
User Device (Primary Source of Truth)
├─ IndexedDB (Dexie) - All user data stored locally
├─ Service Worker - Offline caching & PWA functionality  
├─ Sync Manager - Queues & retries failed operations
└─ React PWA - Offline-first UI

Server (Backup & Sync Endpoint)
├─ Node.js + Express - REST API
├─ SQLite - Persistent storage
└─ Rate Limiting - API protection
```

**Data Flow:**
1. User creates/submits data → Saved to **IndexedDB immediately**
2. Action queued in **syncQueue** table
3. When online → Sync Manager sends to server
4. Server persists to **SQLite**
5. Conflict? Server version wins, logs maintained

### Key Design Principles
- **Zero Data Loss**: All operations succeed locally first
- **Offline-First**: Network is enhancement, not requirement
- **Progressive Enhancement**: Works without JavaScript, better with it
- **Device Independence**: Each device has unique ID for sync tracking

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool with HMR
- **Dexie.js** - IndexedDB wrapper (primary data store)
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Phosphor Icons** - Icon system
- **Workbox** - Service Worker & PWA
- **Vite PWA Plugin** - PWA generation

### Backend
- **Node.js + Express** - REST API server
- **Better-SQLite3** - Persistent storage
- **Zod** - Schema validation
- **Express Rate Limit** - API protection
- **CORS** - Cross-origin handling

### DevOps
- **Docker + Docker Compose** - Containerization
- **Vercel** - Frontend hosting (CDN)
- **Render** - Backend hosting
- **GitHub Actions** - CI/CD (implicit)

---

## Quick Start

### Using Docker (Recommended)
```bash
./start.sh
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Manual Setup
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

**Prerequisites:** Docker OR Node.js 18+

---

## Testing Offline Functionality

### Teacher Flow
1. Login as "Teacher" (any username)
2. Create a quiz with questions
3. **Go offline** (DevTools → Network → Offline)
4. Create another quiz - **still works!**
5. Go online - watch automatic sync in Sync Status page

### Student Flow
1. Login as "Student" (any username)
2. Browse available quizzes
3. **Go offline**
4. Take quiz and submit - **works perfectly!**
5. Go online - see answers sync automatically

### Verify Sync Behavior
- Check **Sync Status** page for queue visualization
- See pending items turn green when synced
- Test retry logic by going offline mid-sync

---

## Database Schema

### Local (IndexedDB - Dexie)
- `users` - Authentication data
- `quizzes` - Quiz metadata
- `questions` - Quiz questions & answers
- `attempts` - Student submissions
- `syncQueue` - Pending sync operations

### Server (SQLite)
- `users` - User registry
- `quizzes` - Synced quizzes
- `questions` - Synced questions
- `attempts` - Synced student attempts
- `sync_logs` - Sync audit trail

---

## Live Deployment

**Frontend:** https://edge-class-pi.vercel.app  
**Backend:** https://edgeclass.onrender.com

### Deploy Your Own

**Split Deployment (Free):**
```bash
# Frontend to Vercel
vercel --prod

# Backend to Render  
# (Connect GitHub repo in Render dashboard)
```

**Environment Variables:**
```env
# Frontend (.env)
VITE_API_URL=https://your-backend.onrender.com

# Backend (.env)
PORT=3000
NODE_ENV=production
```

---

## Key Metrics

- **Offline-first**: 100% functionality without internet
- **Zero data loss**: All operations saved locally first
- **Auto-sync**: Background sync when online
- **PWA**: Installable on mobile/desktop
- **Rate limiting**: 100 req/15min for sync endpoints
- **Response time**: <100ms local operations

---

## Security

- **Content Security Policy** headers
- **Rate limiting** on all endpoints
- **Input validation** with Zod schemas
- **XSS protection** headers
- **Device ID tracking** for audit trails
- **Conflict resolution** with logging

---

## Project Structure

```
edge-class/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── db/             # IndexedDB (Dexie) setup
│   │   ├── sync/           # Sync manager & hooks
│   │   ├── utils/          # Network detector, helpers
│   │   └── constants/      # Centralized copy
│   └── public/             # PWA manifest, icons
├── backend/
│   ├── routes/             # API endpoints (/sync, /stats)
│   ├── db/                 # SQLite initialization
│   └── validation/         # Zod schemas
└── docker-compose.yml      # Container orchestration
```

---

## Educational Impact

**Target Users:**  
- Rural schools with intermittent connectivity
- Teachers in low-bandwidth areas
- Students with limited data plans
- Offline-first learning environments

**Use Cases:**
- Classroom assessments without WiFi
- Homework submission in connectivity-challenged areas
- Practice tests during commutes
- Educational continuity during network outages

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

MIT License - feel free to use for educational purposes

---

## Acknowledgments

Built for **Build2Break Hackathon** to solve real-world connectivity challenges in rural education.

**Architecture Philosophy:** Inspired by local-first software principles - treating the user's device as the authoritative data source, with servers as synchronization endpoints rather than centralized truth.

```
EdgeClass/
├── docker-compose.yml           # Single-command deployment
│
├── frontend/                    # React PWA (Port 5173)
│   ├── src/
│   │   ├── db/                  # IndexedDB Layer (Primary Database)
│   │   │   ├── index.js         # Dexie setup + Device ID
│   │   │   ├── quizzes.js       # Quiz CRUD operations
│   │   │   ├── attempts.js      # Attempt operations
│   │   │   └── users.js         # User operations
│   │   │
│   │   ├── sync/                # Sync Engine
│   │   │   ├── syncManager.js   # Burst sync with exponential backoff
│   │   │   └── useSyncStatus.js # React hook for sync status
│   │   │
│   │   ├── pages/               # Main Pages
│   │   │   ├── Login.jsx        # Device-based auth
│   │   │   ├── Dashboard.jsx    # Stats + Quiz/Attempt views
│   │   │   ├── CreateQuiz.jsx   # Multi-question builder
│   │   │   ├── Quiz.jsx         # Question navigator + offline submit
│   │   │   └── SyncPage.jsx     # Real-time sync activity
│   │   │
│   │   ├── components/          # UI Components
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

## Architecture Overview

**Design Philosophy:** The user's device is the primary database. The server only acts as a backup and sync point.

### Data Flow

```
USER DEVICE                          SYNC SERVER
┌─────────────────┐                 ┌──────────────┐
│  React App      │                 │  Node.js API │
│  ┌───────────┐  │                 │              │
│  │ IndexedDB │  │   Sync Queue    │  ┌─────────┐ │
│  │ (Primary) │◄─┼────────────────►│  │ SQLite  │ │
│  └───────────┘  │   When Online   │  │ (Backup)│ │
│       ▲         │                 │  └─────────┘ │
│       │         │                 │              │
│  ┌────┴──────┐  │                 │  Analytics + │
│  │ UI Pages  │  │                 │  Audit Trail │
│  └───────────┘  │                 └──────────────┘
│                 │
│  Service Worker │
│  (Offline Cache)│
└─────────────────┘
```

### How It Works

1. **User creates data** → Saved to IndexedDB instantly (no wait)
2. **Added to sync queue** → Marked as 'pending'
3. **Sync manager runs** → Checks connectivity every 5 seconds
4. **When online** → Sends data to backend in batches (max 5 items)
5. **Backend stores** → Saves to SQLite for backup and analytics
6. **Retry on failure** → Exponential backoff (5s → 15s → 45s → 135s)

### Key Design Decisions

- **IndexedDB First**: All reads/writes happen locally for instant response
- **Eventual Consistency**: Server eventually receives all data when online
- **Conflict-Free**: Device ID + timestamps prevent data conflicts
- **Graceful Degradation**: App fully functional offline, enhanced when online

---

## Tech Stack

### Frontend
- **React 18** - UI framework with hooks
- **Vite** - Fast build tool with HMR
- **Dexie.js** - IndexedDB wrapper for client-side storage
- **Workbox** - Service Worker for offline caching
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend
- **Express** - Lightweight Node.js web framework
- **Better-SQLite3** - Synchronous SQLite database
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker** - Containerization for development
- **Render** - Production hosting platform
- **GitHub** - Version control and CI/CD trigger


---

## Development Guide

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

## Key Concepts

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

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port 5173 already in use** | `docker-compose down` or kill process on port |
| **PostCSS errors** | Ensure `postcss.config.js` uses `export default` (not `module.exports`) |
| **Tailwind classes not working** | Check `tailwind.config.js` content paths include all source files |
| **Sync not working** | Check DevTools console for errors, verify backend is running on port 3000 |
| **IndexedDB not updating** | Clear browser data or use Incognito mode for fresh state |

---

## Additional Resources

- **IndexedDB Guide:** [Dexie.js Documentation](https://dexie.org)
- **Service Workers:** [Workbox Docs](https://developer.chrome.com/docs/workbox/)
- **PWA Best Practices:** [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps/)

---

## Demo Script (5 min)

1. **Problem** (30s): "36.5% of Indian schools have no internet. Teachers can't use cloud-first EdTech."
2. **Solution** (30s): "Offline-first PWA. Device is database. Server is backup."
3. **Live Demo** (3m):
   - Login → Create quiz online
   - Go offline → Create quiz → Take quiz
   - Go online → Show burst sync
4. **Tech Deep Dive** (1m): "IndexedDB, Service Workers, exponential backoff sync"

---

**Built for rural educators. Ready to deploy, ready to scale.**
