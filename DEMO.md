# Edge Class - 5-Minute Demo Script

**Objective:** Demonstrate offline-first functionality and burst sync capabilities

---

## Prerequisites
- Browser with DevTools (Chrome/Edge recommended)
- Backend running on http://localhost:3000
- Frontend running on http://localhost:5173

---

## Demo Flow (5 minutes)

### 1. **Initial Setup** (30 seconds)

```bash
# Start the application
./start.sh

# Or manually:
docker-compose up --build
```

**Expected:** Frontend loads at http://localhost:5173

---

### 2. **Teacher Creates Quiz ONLINE** (60 seconds)

1. **Navigate to** http://localhost:5173/login
2. **Login as Teacher:**
   - Username: `demo_teacher`
   - Role: Teacher
3. **Click "Create Quiz"**
4. **Fill quiz details:**
   - Title: "Offline Demo Quiz"
   - Description: "Testing offline capabilities"
5. **Add 3 questions:**
   ```
   Q1: What is 2+2?
   Options: 2, 3, 4, 5
   Correct: 4

   Q2: Capital of France?
   Options: London, Paris, Berlin, Madrid
   Correct: Paris

   Q3: Is offline-first cool?
   Options: Yes, No, Maybe, Very Cool
   Correct: Very Cool
   ```
6. **Click "Create Quiz"**

**Verify in DevTools Console:**
```
✅ [DATABASE] Quiz created: {...}
🔄 [SYNC] Added to queue: POST /api/sync/quizzes
✅ [SYNC] Synced successfully
```

**Verify in IndexedDB:**
- DevTools → Application → IndexedDB → EdgeClassDB → quizzes
- Should see quiz with `syncStatus: 'synced'`

---

### 3. **Go OFFLINE & Create Quiz** (90 seconds)

1. **Open DevTools** (F12 or Cmd+Option+I)
2. **Go to Network tab** → Check "Offline"
3. **Click "Create Quiz"** again
4. **Create another quiz:**
   - Title: "Offline Quiz"
   - Description: "Created while offline"
5. **Add 2 questions** (any content)
6. **Click "Create Quiz"**

**Verify in Console:**
```
💾 [DATABASE] Quiz saved locally
🔴 [NETWORK] Status: OFFLINE
⏳ [SYNC] Added to queue (status: pending)
```

**Verify in IndexedDB:**
- EdgeClassDB → quizzes → See quiz with `syncStatus: 'pending'`
- EdgeClassDB → syncQueue → See pending sync operations

---

### 4. **Student Takes Quiz OFFLINE** (90 seconds)

1. **Still offline** (Network → Offline checked)
2. **Logout** → Login as Student:
   - Username: `demo_student`
   - Role: Student
3. **View available quizzes** (only "Offline Demo Quiz" shows - not synced yet)
4. **Click "Take Quiz"**
5. **Answer all 3 questions**
6. **Submit quiz**

**Verify in Console:**
```
✅ [DATABASE] Attempt saved: score: 66%
⏳ [SYNC] Attempt queued for sync
```

**Verify in IndexedDB:**
- EdgeClassDB → attempts → See attempt with score
- EdgeClassDB → syncQueue → See pending attempt sync

---

### 5. **Go ONLINE & Watch Burst Sync** (60 seconds)

1. **DevTools → Network** → Uncheck "Offline"
2. **Refresh page** or wait 5 seconds

**Watch Console (Burst Sync in Action):**
```
🟢 [NETWORK] Status changed: ONLINE
🔄 [SYNC] Starting burst sync...
📤 [SYNC] Batch 1/2: Syncing users...
✅ [SYNC] Batch 1/2 complete
📤 [SYNC] Batch 2/2: Syncing quizzes...
✅ [SYNC] Batch 2/2 complete
🎉 [SYNC] All pending items synced!
```

**Verify Sync Success:**
- Navigate to `/sync` page
- See "0 pending items"
- All items show `syncStatus: 'synced'`

---

### 6. **Verify on Backend** (30 seconds)

**Check Backend Logs:**
```bash
docker-compose logs -f backend
```

**Should see:**
```
POST /api/sync/quizzes - 200 OK
POST /api/sync/questions - 200 OK
POST /api/sync/attempts - 200 OK
```

**Check Stats Endpoint:**
```bash
curl http://localhost:3000/api/stats
```

**Expected Response:**
```json
{
  "totalUsers": 2,
  "totalQuizzes": 2,
  "totalAttempts": 1,
  "recentQuizzes": [...]
}
```

---

## Key Observations to Highlight

✅ **Zero Latency:** Quiz creation is instant (no server wait)
✅ **Offline Capable:** Full functionality without internet
✅ **Burst Sync:** Intelligent batching when connection returns
✅ **No Data Loss:** All offline actions preserved
✅ **Adaptive:** 2G/3G/4G aware (check `networkDetector`)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 in use | `lsof -ti:5173 \| xargs kill -9` |
| Backend not responding | `docker-compose restart backend` |
| Sync not triggering | Navigate to `/sync` and click "Sync Now" |
| IndexedDB corrupt | Clear browser data, refresh |

---

## Optional Deep Dive (if time permits)

### Show Exponential Backoff:
1. Stop backend: `docker-compose stop backend`
2. Go offline → Create quiz → Go online
3. Watch console: retry at 5s → 15s → 45s → 135s intervals

### Show Network Adaptation:
1. DevTools → Network → Throttling → Slow 3G
2. Create quiz with 10 questions
3. Observe smaller batch sizes (2 items vs 5 items on 4G)

---

**Total Time:** ~5 minutes
**Wow Factor:** 🚀 High (works completely offline!)
