#!/bin/bash

# Professional Cleanup Script - Remove all emojis from codebase

echo "Starting professional cleanup - removing emojis..."
echo ""

# Backend server.js
sed -i '' 's/📦 //g' backend/server.js
sed -i '' 's/👻 //g' backend/server.js

# Frontend pages - Login
sed -i '' 's/🎓 //g' frontend/src/pages/Login.jsx
sed -i '' 's/👨‍🏫 //g' frontend/src/pages/Login.jsx
sed -i '' 's/📚 //g' frontend/src/pages/Login.jsx

# Frontend pages - Dashboard
sed -i '' 's/📊 //g' frontend/src/pages/Dashboard.jsx
sed -i '' 's/✅ //g' frontend/src/pages/Dashboard.jsx
sed -i '' 's/⏳ //g' frontend/src/pages/Dashboard.jsx
sed -i '' 's/❌ //g' frontend/src/pages/Dashboard.jsx

# Frontend pages - TeacherDashboard
sed -i '' 's/👩‍🏫 //g' frontend/src/pages/TeacherDashboard.jsx
sed -i '' 's/📝 //g' frontend/src/pages/TeacherDashboard.jsx
sed -i '' 's/📚 //g' frontend/src/pages/TeacherDashboard.jsx
sed -i '' 's/👥 //g' frontend/src/pages/TeacherDashboard.jsx
sed -i '' 's/🔍 //g' frontend/src/pages/TeacherDashboard.jsx
sed -i '' 's/➕ //g' frontend/src/pages/TeacherDashboard.jsx
sed -i '' 's/✏️ //g' frontend/src/pages/TeacherDashboard.jsx
sed -i '' 's/🗑️ //g' frontend/src/pages/TeacherDashboard.jsx
sed -i '' 's/👁️ //g' frontend/src/pages/TeacherDashboard.jsx
sed -i '' 's/✓ //g' frontend/src/pages/TeacherDashboard.jsx

# Frontend pages - StudentDashboard  
sed -i '' 's/🎓 //g' frontend/src/pages/StudentDashboard.jsx
sed -i '' 's/📚 //g' frontend/src/pages/StudentDashboard.jsx
sed -i '' 's/✅ //g' frontend/src/pages/StudentDashboard.jsx
sed -i '' 's/💯 //g' frontend/src/pages/StudentDashboard.jsx
sed -i '' 's/🏆 //g' frontend/src/pages/StudentDashboard.jsx
sed -i '' 's/🔍 //g' frontend/src/pages/StudentDashboard.jsx
sed -i '' 's/✓ //g' frontend/src/pages/StudentDashboard.jsx
sed -i '' 's/▶️ //g' frontend/src/pages/StudentDashboard.jsx
sed -i '' 's/🔄 //g' frontend/src/pages/StudentDashboard.jsx
sed -i '' 's/🎯 //g' frontend/src/pages/StudentDashboard.jsx

# Frontend pages - CreateQuiz
sed -i '' 's/➕ //g' frontend/src/pages/CreateQuiz.jsx
sed -i '' 's/🗑️ //g' frontend/src/pages/CreateQuiz.jsx
sed -i '' 's/💾 //g' frontend/src/pages/CreateQuiz.jsx
sed -i '' 's/✅ //g' frontend/src/pages/CreateQuiz.jsx

# Frontend pages - Quiz
sed -i '' 's/⬅️ //g' frontend/src/pages/Quiz.jsx
sed -i '' 's/➡️ //g' frontend/src/pages/Quiz.jsx
sed -i '' 's/📝 //g' frontend/src/pages/Quiz.jsx
sed -i '' 's/🎉 //g' frontend/src/pages/Quiz.jsx
sed -i '' 's/🔄 //g' frontend/src/pages/Quiz.jsx

# Frontend pages - SyncPage
sed -i '' 's/🔄 //g' frontend/src/pages/SyncPage.jsx
sed -i '' 's/✅ //g' frontend/src/pages/SyncPage.jsx
sed -i '' 's/⏳ //g' frontend/src/pages/SyncPage.jsx
sed -i '' 's/❌ //g' frontend/src/pages/SyncPage.jsx
sed -i '' 's/📊 //g' frontend/src/pages/SyncPage.jsx

# Components
sed -i '' 's/🔌 //g' frontend/src/components/OfflineBadge.jsx
sed -i '' 's/🌐 //g' frontend/src/components/OfflineBadge.jsx
sed -i '' 's/🟢 //g' frontend/src/components/Layout.jsx
sed -i '' 's/🔴 //g' frontend/src/components/Layout.jsx
sed -i '' 's/✅ //g' frontend/src/components/SyncStatus.jsx
sed -i '' 's/⏳ //g' frontend/src/components/SyncStatus.jsx

# Scripts
sed -i '' 's/👻 //g' start.sh
sed -i '' 's/❌ //g' start.sh
sed -i '' 's/✅ //g' start.sh
sed -i '' 's/⚠️ //g' start.sh
sed -i '' 's/🚀 //g' start.sh

sed -i '' 's/✅ //g' commit.sh

# Documentation
sed -i '' 's/👻 //g' README.md
sed -i '' 's/🚀 //g' README.md
sed -i '' 's/🧪 //g' README.md
sed -i '' 's/📁 //g' README.md
sed -i '' 's/📦 //g' README.md
sed -i '' 's/🔄 //g' README.md
sed -i '' 's/📄 //g' README.md
sed -i '' 's/🧩 //g' README.md
sed -i '' 's/🏗️ //g' README.md
sed -i '' 's/✅ //g' README.md

sed -i '' 's/🚀 //g' RAILWAY_DEPLOY.md
sed -i '' 's/✅ //g' RAILWAY_DEPLOY.md
sed -i '' 's/📦 //g' RAILWAY_DEPLOY.md
sed -i '' 's/💾 //g' RAILWAY_DEPLOY.md
sed -i '' 's/🌐 //g' RAILWAY_DEPLOY.md
sed -i '' 's/🔨 //g' RAILWAY_DEPLOY.md
sed -i '' 's/⚠️ //g' RAILWAY_DEPLOY.md
sed -i '' 's/📊 //g' RAILWAY_DEPLOY.md
sed -i '' 's/📝 //g' RAILWAY_DEPLOY.md
sed -i '' 's/🔔 //g' RAILWAY_DEPLOY.md

sed -i '' 's/🚀 //g' DEPLOYMENT.md
sed -i '' 's/✅ //g' DEPLOYMENT.md
sed -i '' 's/📦 //g' DEPLOYMENT.md

echo "Cleanup complete! All emojis removed."
echo "Please review the changes before committing."
