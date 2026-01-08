import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes, deleteQuiz } from '../db/quizzes';
import { getAllAttempts } from '../db/attempts';
import { getCurrentUser } from '../db';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSyncStatus } from '../sync/useSyncStatus';

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('quizzes'); // 'quizzes' or 'attempts'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title'
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { syncStats } = useSyncStatus();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [quizzesData, attemptsData] = await Promise.all([
        getQuizzes(),
        getAllAttempts()
      ]);
      setQuizzes(quizzesData);
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter and sort quizzes
  const filteredQuizzes = quizzes
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
  
  // Filter and sort attempts
  const filteredAttempts = attempts
    .filter(attempt => {
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      return quiz && quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  const handleTakeQuiz = (quiz) => {
    navigate(`/quiz/${quiz.id}`);
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await deleteQuiz(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username || 'Student'}! 👋
        </h1>
        <p className="text-primary-100">
          Continue learning even without internet. All your progress is saved locally.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Total Quizzes</p>
              <p className="text-3xl font-bold text-blue-600">{quizzes.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600">{attempts.length}</p>
            </div>
            <div className="text-4xl">✅</div>
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

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800 font-medium">Avg Score</p>
              <p className="text-3xl font-bold text-purple-600">
                {attempts.length > 0
                  ? Math.round(
                      attempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) /
                        attempts.length
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Ready to create a quiz?
            </h3>
            <p className="text-sm text-gray-600">
              Create engaging quizzes that work offline
            </p>
          </div>
          <button
            onClick={() => navigate('/create-quiz')}
            className="btn btn-primary"
          >
            ➕ Create Quiz
          </button>
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
            onClick={() => setView('attempts')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'attempts'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Attempts ({filteredAttempts.length})
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
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No quizzes yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first quiz to get started
                  </p>
                  <button
                    onClick={() => navigate('/create-quiz')}
                    className="btn btn-primary"
                  >
                    Create Quiz
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onTakeQuiz={handleTakeQuiz}
                onDelete={handleDeleteQuiz}
              />
            ))
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
                    No attempts found
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
                    No attempts yet
                  </h3>
                  <p className="text-gray-600">
                    Take a quiz to see your results here
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredAttempts.map((attempt) => {
              const quiz = quizzes.find((q) => q.id === attempt.quizId);
              const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
              
              return (
                <div key={attempt.id} className="card flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {quiz?.title || 'Quiz'}
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
                        percentage >= 70 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {percentage}%
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-medium ${
                      attempt.syncStatus === 'synced'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {attempt.syncStatus === 'synced' ? '✓ Synced' : 'Pending'}
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

export default Dashboard;
