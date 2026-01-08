import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../db/users';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    try {
      await loginUser(username.trim(), role);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[--bg-primary] text-[--text-primary] flex items-center justify-center px-4 py-8">
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-lg bg-[--bg-tertiary] text-[--text-secondary] hover:text-[--text-primary] transition-colors"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
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

      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-lg bg-[--accent-color] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <h1 className="text-3xl font-bold text-[--text-primary] mb-2">EdgeClass</h1>
          <p className="text-[--text-secondary] text-sm">Offline-first education platform</p>
        </div>

        {/* Login Card */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-[--text-primary] mb-8 text-center">
            Get Started
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selector */}
            <div>
              <label className="label mb-3">Select your role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    role === 'student'
                      ? 'border-[--accent-color] bg-[--bg-tertiary] text-[--text-primary]'
                      : 'border-[--border-color] bg-[--bg-secondary] text-[--text-secondary] hover:border-[--border-color]'
                  }`}
                >
                  <div className="mb-2">Student</div>
                  <div className="text-xs text-[--text-tertiary]">Take quizzes</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    role === 'teacher'
                      ? 'border-[--accent-color] bg-[--bg-tertiary] text-[--text-primary]'
                      : 'border-[--border-color] bg-[--bg-secondary] text-[--text-secondary] hover:border-[--border-color]'
                  }`}
                >
                  <div className="mb-2">Teacher</div>
                  <div className="text-xs text-[--text-tertiary]">Create quizzes</div>
                </button>
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Enter your username"
                className="input"
                required
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-opacity-10 bg-[--danger-color] text-[--danger-color] rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="btn btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-[--bg-tertiary] rounded-lg border border-[--border-color]">
            <p className="text-xs text-[--text-secondary] leading-relaxed">
              Works offline. Your data is saved locally and synced when connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
