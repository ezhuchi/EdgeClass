import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../db/users';

const Login = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student'); // Default to student
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const trimmedUsername = username.trim();
    
    // Validation
    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }
    
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (trimmedUsername.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('👤 [AUTH] Logging in:', trimmedUsername, `(${role})`);
      await loginUser(trimmedUsername, role);
      console.log('✅ [AUTH] Login successful, redirecting to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ [AUTH] Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-block text-8xl mb-4">�</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Edge Class</h1>
          <p className="text-gray-600 text-lg">Teach even when the internet ghosts you</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'student'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-1">🎓</div>
                  <div className="font-semibold">Student</div>
                  <div className="text-xs mt-1 opacity-75">Take quizzes</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'teacher'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-1">👨‍🏫</div>
                  <div className="font-semibold">Teacher</div>
                  <div className="text-xs mt-1 opacity-75">Create quizzes</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(''); // Clear error on input
                }}
                placeholder="e.g., john_doe or teacher_maya"
                className={`input ${
                  error ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                required
                autoFocus
                minLength={3}
                maxLength={20}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{error}</span>
                </p>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                💡 Choose any username (3-20 characters). It's saved locally.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Logging in...' : `Login as ${role === 'teacher' ? 'Teacher' : 'Student'}`}
            </button>
          </form>

          {/* Offline Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>✨ Works Offline!</strong>
              <br />
              Your login is saved locally. No internet required after first login.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl mb-1">📱</div>
            <p className="text-xs text-gray-600">PWA Ready</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl mb-1">🔄</div>
            <p className="text-xs text-gray-600">Auto Sync</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl mb-1">💾</div>
            <p className="text-xs text-gray-600">Local First</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
