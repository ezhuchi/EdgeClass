import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes, deleteQuiz } from '../db/quizzes';
import { getAllAttempts } from '../db/attempts';
import { getCurrentUser } from '../db';
import db from '../db';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSyncStatus } from '../sync/useSyncStatus';

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [studentUsers, setStudentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('quizzes'); // 'quizzes' or 'attempts'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { syncStats } = useSyncStatus();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get all quizzes created by this teacher
      const allQuizzes = await getQuizzes();
      const myQuizzes = allQuizzes.filter(q => q.createdBy === user?.id);
      
      // Get only attempts for MY quizzes (not other teachers' quizzes)
      const allAttempts = await getAllAttempts();
      const myQuizIds = new Set(myQuizzes.map(q => q.id));
      const attempts = allAttempts.filter(a => myQuizIds.has(a.quizId));
      
      // Get all student users
      const users = await db.users.where('role').equals('student').toArray();
      
      setQuizzes(myQuizzes);
      setAllAttempts(attempts);
      setStudentUsers(users);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter my quizzes by search term
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

  // Get attempts for a specific quiz
  const getQuizAttempts = (quizId) => {
    return allAttempts.filter(a => a.quizId === quizId);
  };

  // Get student name by ID
  const getStudentName = (userId) => {
    const student = studentUsers.find(u => u.id === userId);
    return student ? student.username : 'Unknown Student';
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz? This will also delete all student attempts.')) return;

    try {
      await deleteQuiz(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  const handleViewAttempts = (quizId) => {
    setSelectedQuizId(quizId);
    setView('attempts');
  };

  if (loading) {
    return <LoadingSpinner message="Loading teacher dashboard..." />;
  }

  // Get quiz-specific stats
  const selectedQuiz = selectedQuizId ? quizzes.find(q => q.id === selectedQuizId) : null;
  const quizAttempts = selectedQuizId ? getQuizAttempts(selectedQuizId) : allAttempts;
  const totalStudents = new Set(allAttempts.map(a => a.userId)).size;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          👨‍🏫 Teacher Dashboard - Welcome, {user?.username}!
        </h1>
        <p className="text-purple-100">
          Create and manage quizzes. View student performance even offline.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800 font-medium">My Quizzes</p>
              <p className="text-3xl font-bold text-purple-600">{quizzes.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">Total Attempts</p>
              <p className="text-3xl font-bold text-green-600">{allAttempts.length}</p>
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
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Ready to create a new quiz?
            </h3>
            <p className="text-sm text-gray-600">
              Build engaging quizzes that work offline for your students
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
            onClick={() => { setView('quizzes'); setSelectedQuizId(null); }}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'quizzes'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 My Quizzes ({filteredQuizzes.length})
          </button>
          <button
            onClick={() => setView('attempts')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'attempts'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Student Attempts ({quizAttempts.length})
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
            filteredQuizzes.map((quiz) => {
              const attempts = getQuizAttempts(quiz.id);
              return (
                <div key={quiz.id} className="card hover:shadow-lg transition-shadow">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>👥 {attempts.length} attempts</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewAttempts(quiz.id)}
                      className="btn btn-secondary flex-1 text-sm"
                    >
                      📊 View Attempts
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="btn bg-red-500 text-white hover:bg-red-600 px-4 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {selectedQuiz && (
            <div className="card bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Viewing attempts for: {selectedQuiz.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {quizAttempts.length} total attempts
                  </p>
                </div>
                <button
                  onClick={() => setSelectedQuizId(null)}
                  className="btn btn-secondary text-sm"
                >
                  View All Attempts
                </button>
              </div>
            </div>
          )}

          {quizAttempts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No attempts yet
              </h3>
              <p className="text-gray-600">
                {selectedQuiz 
                  ? 'No students have attempted this quiz yet' 
                  : 'Students haven\'t taken any quizzes yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizAttempts.map((attempt) => {
                const quiz = quizzes.find((q) => q.id === attempt.quizId);
                const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                
                return (
                  <div key={attempt.id} className="card flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        👤 {getStudentName(attempt.userId)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quiz: {quiz?.title || 'Unknown Quiz'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(attempt.completedAt).toLocaleString()}
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
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
