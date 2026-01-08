# Doubts/Q&A System - Feature Documentation

## Overview
Complete doubts management system allowing students to ask questions with file attachments, teachers to respond with documents, and threaded conversations until resolution.

## Features Implemented

### For Students
1. **Create Doubts**
   - Add question with chapter and topic categorization
   - Attach multiple files (images, PDFs, documents)
   - Automatic offline queueing for sync

2. **View Doubts**
   - List of all their doubts with status badges
   - Filter and search functionality
   - View full conversation thread

3. **Reply to Teachers**
   - Continue conversation if doubt not cleared
   - Attach additional files
   - Real-time status updates

4. **Mark Resolved**
   - Students can mark doubts as resolved
   - Visual confirmation with status change

5. **Status Tracking**
   - **Open** (Yellow) - New doubt, no teacher response yet
   - **Answered** (Blue) - Teacher has replied
   - **Resolved** (Green) - Student satisfied with answer

### For Teachers
1. **View All Doubts**
   - See doubts from all students
   - Student name displayed with each doubt
   - Filter by status (open/answered/resolved)
   - Search by question, topic, chapter, or student name

2. **Reply with Attachments**
   - Send detailed responses
   - Upload supporting documents (PDFs, images, docs)
   - Multiple files per reply

3. **Status Dashboard**
   - Quick stats: Total, Open, Answered, Resolved
   - Visual indicators for pending doubts
   - Easy navigation between doubt details

4. **Threaded Conversations**
   - View full conversation history
   - Teacher replies highlighted visually
   - Chronological order maintained

## Technical Implementation

### Database Schema

#### Frontend (IndexedDB via Dexie)
```javascript
doubts: 'id, studentId, topic, chapter, question, createdAt, syncStatus, updatedAt, deviceId, status'
doubtReplies: 'id, doubtId, userId, message, createdAt, syncStatus, updatedAt, deviceId'
```

#### Backend (SQLite)
```sql
CREATE TABLE doubts (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  topic TEXT,
  chapter TEXT,
  question TEXT NOT NULL,
  attachments TEXT, -- JSON array
  status TEXT NOT NULL DEFAULT 'open',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deviceId TEXT NOT NULL,
  syncedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE doubt_replies (
  id TEXT PRIMARY KEY,
  doubtId TEXT NOT NULL,
  userId TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT, -- JSON array
  createdAt TEXT NOT NULL,
  deviceId TEXT NOT NULL,
  syncedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doubtId) REFERENCES doubts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### File Attachments
- **Storage**: Base64 encoded in IndexedDB
- **Metadata**: `{name, type, size, data}`
- **Supported Types**: Images (JPG, PNG, GIF), PDFs, DOC/DOCX, TXT
- **Multiple Files**: Yes, per doubt and per reply
- **Download**: Via data URL blob download

### API Endpoints

#### Sync Endpoints
- `POST /api/sync/doubts` - Sync doubts from client
- `POST /api/sync/doubt-replies` - Sync replies from client
- `POST /api/sync/doubt-status` - Update doubt status
- `DELETE /api/sync/doubts/:id` - Delete doubt

#### Query Endpoints
- `GET /api/doubts` - Get all doubts (with filters)
- `GET /api/doubts/:doubtId/replies` - Get replies for a doubt

### Sync Priority
```
users → quizzes → questions → attempts → doubts → doubt_replies → doubt_status
```

### Files Modified/Created

#### Frontend
- **Created**: `src/components/StudentDoubts.jsx` (584 lines)
- **Created**: `src/components/TeacherDoubts.jsx` (476 lines)
- **Created**: `src/db/doubts.js` (120 lines)
- **Modified**: `src/db/index.js` - Added doubts tables
- **Modified**: `src/pages/StudentDashboard.jsx` - Added Doubts tab
- **Modified**: `src/pages/TeacherDashboard.jsx` - Added Doubts tab
- **Modified**: `src/sync/syncManager.js` - Added doubts sync order

#### Backend
- **Created**: `routes/doubts.js` - All doubt API endpoints
- **Modified**: `db/init.js` - Added doubts/doubt_replies tables
- **Modified**: `server.js` - Registered doubts routes

## User Workflow

### Student Creates Doubt
1. Navigate to Dashboard → Doubts tab
2. Click "Ask a Doubt" button
3. Fill in chapter, topic, question
4. Optionally attach files (images, PDFs, etc.)
5. Submit - saved locally with "pending" sync status
6. When online, auto-syncs to backend

### Teacher Responds
1. Navigate to Dashboard → Doubts tab
2. View list of all doubts from all students
3. Click on a doubt to see details
4. View student's question and attachments
5. Write response message
6. Optionally attach documents/images
7. Submit reply - doubt status changes to "answered"

### Continued Conversation
1. Student receives teacher's reply
2. If doubt not cleared, student replies back
3. Teacher sees new reply notification
4. Conversation continues in thread

### Resolution
1. When satisfied, student clicks "Mark as Resolved"
2. Status changes to "resolved" (green)
3. Teacher sees resolved status
4. Conversation archived but still viewable

## Offline Support
✅ Create doubts offline
✅ View existing doubts offline
✅ Reply to doubts offline
✅ All operations queued for sync
✅ Automatic sync when connection restored
✅ Exponential backoff retry on failures

## UI Features
- **Status Badges**: Color-coded (Open/Answered/Resolved)
- **User Avatars**: Visual identification of teacher vs student
- **File Preview**: Display attached file names with download links
- **Search**: Find doubts by keyword
- **Filters**: By status (all/open/answered/resolved)
- **Stats Dashboard**: Quick overview of doubt counts
- **Responsive Design**: Works on all screen sizes

## Testing Checklist
- [ ] Student creates doubt with attachments
- [ ] Doubt appears in teacher's list
- [ ] Teacher replies with document
- [ ] Student sees reply and downloads attachment
- [ ] Student replies back
- [ ] Teacher sees continued conversation
- [ ] Student marks as resolved
- [ ] Status updates correctly
- [ ] Offline mode - all operations queue
- [ ] Sync when coming back online
- [ ] Multiple file attachments work
- [ ] Search and filters work correctly

## Future Enhancements (Optional)
- Push notifications for new replies
- Rich text editor for replies
- Image preview/thumbnails
- File size limits and validation
- Doubt analytics dashboard
- Export conversation as PDF
- Tag system for better categorization
