import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './db';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateQuiz from './pages/CreateQuiz';
import Quiz from './pages/Quiz';
import SyncPage from './pages/SyncPage';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect } from 'react';

// Route Logger Component
function RouteLogger() {
  const location = useLocation();
  
  useEffect(() => {
    const user = getCurrentUser();
    console.log('🔀 [ROUTER] Route changed:', {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      user: user ? `${user.username} (${user.role})` : 'Not logged in',
      timestamp: new Date().toISOString()
    });
  }, [location]);
  
  return null;
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
};

// Teacher-Only Route Component
const TeacherRoute = ({ children }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'teacher') {
    alert('Access denied. Only teachers can access this page.');
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Student-Only Route Component
const StudentRoute = ({ children }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'student') {
    alert('Access denied. Only students can take quizzes.');
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Role-Based Dashboard Component
const RoleDashboard = () => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  
  // Route based on user role
  if (user.role === 'teacher') {
    return <TeacherDashboard />;
  } else {
    return <StudentDashboard />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <RouteLogger />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RoleDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-quiz"
              element={
                <TeacherRoute>
                  <Layout>
                    <CreateQuiz />
                  </Layout>
                </TeacherRoute>
              }
            />
            <Route
              path="/quiz/:id"
              element={
                <StudentRoute>
                  <Layout>
                    <Quiz />
                  </Layout>
                </StudentRoute>
              }
            />
            <Route
              path="/sync"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SyncPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
