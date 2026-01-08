import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import OfflineBadge from './OfflineBadge';
import { getCurrentUser, clearCurrentUser } from '../db';
import { useNavigate } from 'react-router-dom';
import { networkDetector } from '../utils/networkDetector';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();
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
    return <div className="min-h-screen bg-[--bg-primary] text-[--text-primary]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[--bg-primary] text-[--text-primary] flex flex-col">
      {/* Header */}
      <header className="bg-[--bg-primary] border-b border-[--border-color] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-3xl">�</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edge Class</h1>
                <p className="text-xs text-gray-500">Offline-First Education</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-[--accent-color] border-b-2 border-[--accent-color]'
                    : 'text-[--text-secondary] hover:text-[--text-primary]'
                }`}
              >
                Dashboard
              </Link>
              {user?.role === 'teacher' && (
                <Link
                  to="/create-quiz"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/create-quiz')
                      ? 'text-[--accent-color] border-b-2 border-[--accent-color]'
                      : 'text-[--text-secondary] hover:text-[--text-primary]'
                  }`}
                >
                  Create Quiz
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-[--bg-tertiary] text-[--text-secondary] hover:text-[--text-primary] transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-1.414-1.414a2 2 0 10-2.828 0l-1.414 1.414a1 1 0 101.414 1.414l.707-.707.707.707a1 1 0 001.414-1.414zm2.828-10.9a1 1 0 00-1.414-1.414l-.707.707-.707-.707a1 1 0 10-1.414 1.414l1.414 1.414-1.414 1.415a1 1 0 101.414 1.414l.707-.707.707.707a1 1 0 001.414-1.414l-1.414-1.415z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Lite Mode Toggle - Hidden on very small screens */}
              <button
                onClick={toggleLiteMode}
                className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isLiteMode
                    ? 'bg-[--accent-color] text-white'
                    : 'bg-[--bg-tertiary] text-[--text-secondary] hover:text-[--text-primary]'
                }`}
                title={`${isLiteMode ? 'Disable' : 'Enable'} Lite Mode (data saver)`}
              >
                <span>{isLiteMode ? '✓' : '○'}</span>
                <span className="hidden md:inline">Lite</span>
              </button>

              <OfflineBadge />
              
              {user && (
                <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-[--border-color]">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-[--text-primary]">{user.username}</p>
                    <p className="text-xs text-[--text-tertiary]">
                      {user.role === 'teacher' ? 'Teacher' : 'Student'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs sm:text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors"
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[--bg-secondary] border-t border-[--border-color] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>👻 Edge Class - Built for offline-first education</p>
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
