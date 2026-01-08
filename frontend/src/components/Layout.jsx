import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import OfflineBadge from './OfflineBadge';
import { getCurrentUser, clearCurrentUser } from '../db';
import { useNavigate } from 'react-router-dom';
import { networkDetector } from '../utils/networkDetector';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isLiteMode, setIsLiteMode] = useState(networkDetector.getLiteMode());
  const [networkInfo, setNetworkInfo] = useState(networkDetector.getNetworkInfo());

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = networkDetector.subscribe((info) => {
      setNetworkInfo(info);
      setIsLiteMode(info.isLiteMode);
    });
    
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    clearCurrentUser();
    navigate('/login');
  };

  const toggleLiteMode = () => {
    const newMode = networkDetector.toggleLiteMode();
    setIsLiteMode(newMode);
  };

  const isActive = (path) => location.pathname === path;

  // Don't show nav on login page
  if (location.pathname === '/login') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-3xl">👻</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GhostClass</h1>
                <p className="text-xs text-gray-500">Offline-First Education</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              {user?.role === 'teacher' && (
                <Link
                  to="/create-quiz"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/create-quiz')
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Create Quiz
                </Link>
              )}
              <Link
                to="/sync"
                className={`text-sm font-medium transition-colors ${
                  isActive('/sync')
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sync Status
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Lite Mode Toggle */}
              <button
                onClick={toggleLiteMode}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isLiteMode
                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
                title={`${isLiteMode ? 'Disable' : 'Enable'} Lite Mode (data saver)`}
              >
                <span className="text-base">{isLiteMode ? '🐢' : '🚀'}</span>
                <span>
                  {isLiteMode ? 'Lite Mode' : networkInfo.effectiveType.toUpperCase()}
                </span>
              </button>

              <OfflineBadge />
              
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">
                      {user.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>👻 GhostClass - Built for offline-first education</p>
            <p className="text-xs text-gray-500 mt-1">
              "Teach even when the internet ghosts you"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
