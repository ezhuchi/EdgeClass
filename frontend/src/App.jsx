import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './db';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import Quiz from './pages/Quiz';
import SyncPage from './pages/SyncPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-quiz"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateQuiz />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Quiz />
              </Layout>
            </ProtectedRoute>
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
  );
}

export default App;
