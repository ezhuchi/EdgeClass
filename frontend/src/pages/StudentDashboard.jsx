import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes } from '../db/quizzes';
import { getAllAttempts } from '../db/attempts';
import { getCurrentUser } from '../db';
import db from '../db';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSyncStatus } from '../sync/useSyncStatus';

const StudentDashboard = () => {
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('quizzes'); // 'quizzes' or 'scores'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { syncStats } = useSyncStatus();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get all quizzes
      const allQuizzes = await getQuizzes();
      
      // Get all teacher users
      const teachers = await db.users.where('role').equals('teacher').toArray();
      const teacherIds = new Set(teachers.map(t => t.id));
      
      // Filter to show only quizzes created by teachers (not by other students or self)
      const teacherQuizzes = allQuizzes.filter(q => teacherIds.has(q.createdBy));
      
      // Get my attempts
      const allAttempts = await getAllAttempts();
      const studentAttempts = allAttempts.filter(a => a.userId === user?.id);
      
      setAvailableQuizzes(teacherQuizzes);
      setMyAttempts(studentAttempts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter quizzes by search term
  const filteredQuizzes = availableQuizzes
    .filter(quiz => 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Filter attempts by search term
  const filteredAttempts = myAttempts
    .filter(attempt => {
      const quiz = availableQuizzes.find(q => q.id === attempt.quizId);
      return quiz && quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  const handleTakeQuiz = (quiz) => {
    navigate(`/quiz/${quiz.id}`);
  };

  // Check if student has already attempted a quiz
  const hasAttempted = (quizId) => {
    return myAttempts.some(a => a.quizId === quizId);
  };

  // Get student's best score for a quiz
  const getBestScore = (quizId) => {
    const quizAttempts = myAttempts.filter(a => a.quizId === quizId);
    if (quizAttempts.length === 0) return null;
    
    const best = quizAttempts.reduce((max, attempt) => {
      const percentage = (attempt.score / attempt.totalQuestions) * 100;
      const maxPercentage = (max.score / max.totalQuestions) * 100;
      return percentage > maxPercentage ? attempt : max;
    });
    
    return Math.round((best.score / best.totalQuestions) * 100);
  };

  if (loading) {
    return <LoadingSpinner message="Loading student dashboard..." />;
  }

  // Calculate average score
  const avgScore = myAttempts.length > 0
    ? Math.round(
        myAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) /
          myAttempts.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          🎓 Welcome, {user?.username}!
        </h1>
        <p className="text-blue-100">
          Take quizzes and track your progress. Everything works offline!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Available Quizzes</p>
              <p className="text-3xl font-bold text-blue-600">{availableQuizzes.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600">{myAttempts.length}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800 font-medium">Avg Score</p>
              <p className="text-3xl font-bold text-purple-600">{avgScore}%</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800 font-medium">Pending Sync</p>
              <p className="text-3xl font-bold text-yellow-600">{syncStats.pending}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('quizzes')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'quizzes'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 Available Quizzes ({filteredQuizzes.length})
          </button>
          <button
            onClick={() => setView('scores')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'scores'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏆 My Scores ({filteredAttempts.length})
          </button>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          {view === 'quizzes' && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">A-Z</option>
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {view === 'quizzes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              {searchTerm ? (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No quizzes found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try a different search term
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn btn-secondary"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No quizzes available yet
                  </h3>
                  <p className="text-gray-600">
                    Your teachers haven't created any quizzes yet. Check back later!
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const attempted = hasAttempted(quiz.id);
              const bestScore = getBestScore(quiz.id);
              
              return (
                <div key={quiz.id} className="card hover:shadow-lg transition-shadow">
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-lg text-gray-900 flex-1">{quiz.title}</h3>
                      {attempted && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                          ✓ Taken
                        </span>
                      )}
                    </div>
                    {quiz.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    {bestScore !== null && (
                      <>
                        <span>•</span>
                        <span className={`font-medium ${
                          bestScore >= 70 ? 'text-green-600' : 
                          bestScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          Best: {bestScore}%
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleTakeQuiz(quiz)}
                    className="btn btn-primary w-full"
                  >
                    {attempted ? '🔄 Retake Quiz' : '▶️ Take Quiz'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm ? (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No scores found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try a different search term
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn btn-secondary"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No quiz attempts yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Take a quiz to see your scores here
                  </p>
                  <button
                    onClick={() => setView('quizzes')}
                    className="btn btn-primary"
                  >
                    Browse Quizzes
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredAttempts.map((attempt) => {
              const quiz = availableQuizzes.find((q) => q.id === attempt.quizId);
              const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
              
              return (
                <div key={attempt.id} className="card flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {quiz?.title || 'Unknown Quiz'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Completed: {new Date(attempt.completedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {attempt.score}/{attempt.totalQuestions}
                      </p>
                      <p className={`text-sm font-medium ${
                        percentage >= 70 ? 'text-green-600' : 
                        percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {percentage}%
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-medium ${
                      attempt.syncStatus === 'synced'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {attempt.syncStatus === 'synced' ? '✓ Synced' : '⏳ Pending'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
