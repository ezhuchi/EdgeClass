import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChartBar, Lightbulb, Sparkle, ArrowsClockwise } from '@phosphor-icons/react';
import { loginUser } from '../db/users';
import { copy } from '../constants/copy';

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
    
    //Validation
    if (!trimmedUsername) {
      setError(copy.login.errors.emptyUsername);
      return;
    }
    
    if (trimmedUsername.length < 3) {
      setError(copy.login.errors.shortUsername);
      return;
    }
    
    if (trimmedUsername.length > 20) {
      setError(copy.login.errors.longUsername);
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
          <div className="inline-block mb-4">
            <GraduationCap size={96} weight="duotone" className="text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{copy.appName}</h1>
          <p className="text-gray-600 text-lg">{copy.tagline}</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {copy.login.title}
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {copy.login.roleLabel}
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
                  <div className="mb-2 flex justify-center">
                    <GraduationCap size={40} weight="duotone" className={role === 'student' ? 'text-primary-600' : 'text-gray-400'} />
                  </div>
                  <div className="font-semibold">{copy.login.studentRole}</div>
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
                  <div className="mb-2 flex justify-center">
                    <ChartBar size={40} weight="duotone" className={role === 'teacher' ? 'text-primary-600' : 'text-gray-400'} />
                  </div>
                  <div className="font-semibold">{copy.login.teacherRole}</div>
                  <div className="text-xs mt-1 opacity-75">Create quizzes</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {copy.login.usernameLabel}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(''); // Clear error on input
                }}
                placeholder={copy.login.usernamePlaceholder}
                className={`input ${ error ? 'border-red-500 focus:ring-red-500' : ''
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
                {copy.login.usernameHint}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Logging in...' : role === 'teacher' ? copy.login.teacherCTA : copy.login.studentCTA}
            </button>
          </form>

          {/* Offline Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
            <Sparkle size={24} weight="duotone" className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <strong>{copy.login.offlineNotice}</strong>
              <br />
              {copy.login.offlineDescription}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="mb-2 flex justify-center">
              <GraduationCap size={32} weight="duotone" className="text-primary-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">PWA Ready</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="mb-2 flex justify-center">
              <ArrowsClockwise size={32} weight="duotone" className="text-green-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Auto Sync</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="mb-2 flex justify-center">
              <Lightbulb size={32} weight="duotone" className="text-amber-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Local First</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
