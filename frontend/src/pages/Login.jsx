import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../db/users';

const Login = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      await loginUser(username.trim());
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-block text-8xl mb-4">👻</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GhostClass</h1>
          <p className="text-gray-600 text-lg">Teach even when the internet ghosts you</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="input"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
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
