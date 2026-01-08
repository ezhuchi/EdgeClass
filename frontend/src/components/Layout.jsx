import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { House, ChartBar, ArrowsClockwise, NotePencil, SignOut, GraduationCap } from '@phosphor-icons/react';
import OfflineBadge from './OfflineBadge';
import SyncStatusIndicator from './SyncStatusIndicator';
import OnboardingModal from './OnboardingModal';
import { getCurrentUser, clearCurrentUser } from '../db';
import { useNavigate } from 'react-router-dom';
import { networkDetector } from '../utils/networkDetector';
import { copy } from '../constants/copy';

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
              <GraduationCap size={32} weight="duotone" className="text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{copy.appName}</h1>
                <p className="text-xs text-gray-500">Offline-First Education</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/dashboard')
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <House size={18} weight={isActive('/dashboard') ? 'fill' : 'regular'} />
                Dashboard
              </Link>
              {user?.role === 'teacher' && (
                <Link
                  to="/create-quiz"
                  className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive('/create-quiz')
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <NotePencil size={18} weight={isActive('/create-quiz') ? 'fill' : 'regular'} />
                  Create Quiz
                </Link>
              )}
              <Link
                to="/sync"
                className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/sync')
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowsClockwise size={18} weight={isActive('/sync') ? 'fill' : 'regular'} />
                Sync Status
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Sync Status Indicator */}
              <SyncStatusIndicator />

              {/* Network Info Tooltip */}
              <div className="hidden lg:block text-xs text-gray-600">
                {copy.networkInfo[networkInfo.effectiveType] || networkInfo.effectiveType}
              </div>
              
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                      {user.role === 'teacher' ? (
                        <>
                          <ChartBar size={14} weight="bold" />
                          Teacher
                        </>
                      ) : (
                        <>
                          <GraduationCap size={14} weight="bold" />
                          Student
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                  >
                    <SignOut size={18} />
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

      {/* Onboarding Modal */}
      <OnboardingModal />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>🌾 {copy.appName} - Built for offline-first education</p>
            <p className="text-xs text-gray-500 mt-1">
              "{copy.tagline}"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
