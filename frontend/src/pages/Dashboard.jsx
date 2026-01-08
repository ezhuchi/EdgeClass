import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes, deleteQuiz } from '../db/quizzes';
import { getAllAttempts } from '../db/attempts';
import { getCurrentUser } from '../db';
import db from '../db';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSyncStatus } from '../sync/useSyncStatus';

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('quizzes');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { syncStats, lastSyncEvent } = useSyncStatus();

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh when sync completes
  useEffect(() => {
    if (lastSyncEvent?.type === 'sync_completed' || lastSyncEvent?.type === 'item_synced') {
      loadData();
    }
  }, [lastSyncEvent]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [quizzesData, attemptsData] = await Promise.all([
        getQuizzes(),
        getAllAttempts()
      ]);
      
      // Load questions for each quiz
      const quizzesWithQuestions = await Promise.all(
        quizzesData.map(async (quiz) => {
          const questions = await db.questions.where('quizId').equals(quiz.id).toArray();
          return {
            ...quiz,
            questions: questions.map(q => ({
              ...q,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
            }))
          };
        })
      );
      
      setQuizzes(quizzesWithQuestions);
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
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
    if (!confirm('Delete this quiz? This cannot be undone.')) return;

    try {
      await deleteQuiz(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  const getAttemptCountForQuiz = (quizId) => {
    return attempts.filter(a => a.quizId === quizId).length;
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const avgScore = attempts.length > 0
    ? Math.round(
        attempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) /
          attempts.length
      )
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[--text-primary] mb-1">
          Welcome back, {user?.username}
        </h1>
        <p className="text-[--text-secondary]">
          {user?.role === 'teacher' ? 'Manage and create quizzes' : 'Take quizzes and track your progress'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid-responsive-2 lg:grid-cols-4">
        <div className="card">
          <div className="text-sm text-[--text-tertiary] font-medium mb-2">Total Quizzes</div>
          <div className="text-3xl font-bold text-[--text-primary]">{quizzes.length}</div>
        </div>

        <div className="card">
          <div className="text-sm text-[--text-tertiary] font-medium mb-2">Completed</div>
          <div className="text-3xl font-bold text-[--text-primary]">{attempts.length}</div>
        </div>

        <div className="card">
          <div className="text-sm text-[--text-tertiary] font-medium mb-2">Pending Sync</div>
          <div className="text-3xl font-bold text-[--accent-color]">{syncStats.pending}</div>
        </div>

        <div className="card">
          <div className="text-sm text-[--text-tertiary] font-medium mb-2">Average Score</div>
          <div className="text-3xl font-bold text-[--text-primary]">{avgScore}%</div>
        </div>
      </div>

      {/* Quick Action */}
      {user?.role === 'teacher' && (
        <div className="card bg-[--bg-tertiary] border-[--border-color]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[--text-primary] mb-1">
                Create a new quiz
              </h3>
              <p className="text-sm text-[--text-secondary]">
                Build engaging quizzes that work offline
              </p>
            </div>
            <button
              onClick={() => navigate('/create-quiz')}
              className="btn btn-primary ml-4"
            >
              New Quiz
            </button>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="space-y-4">
        <div className="flex gap-4 border-b border-[--border-color]">
          <button
            onClick={() => setView('quizzes')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              view === 'quizzes'
                ? 'border-[--accent-color] text-[--accent-color]'
                : 'border-transparent text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            Quizzes ({filteredQuizzes.length})
          </button>
          <button
            onClick={() => setView('attempts')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              view === 'attempts'
                ? 'border-[--accent-color] text-[--accent-color]'
                : 'border-transparent text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            My Attempts ({filteredAttempts.length})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-tertiary] hover:text-[--text-primary] transition-colors"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          {view === 'quizzes' && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input sm:w-48"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          )}
        </div>
      </div>

      {/* Content Area */}
      {view === 'quizzes' ? (
        <div>
          {filteredQuizzes.length === 0 ? (
            <div className="card text-center py-12">
              <h3 className="text-xl font-semibold text-[--text-primary] mb-2">
                {searchTerm ? 'No quizzes found' : 'No quizzes yet'}
              </h3>
              <p className="text-[--text-secondary] mb-6">
                {searchTerm 
                  ? 'Try a different search term'
                  : 'Get started by creating or taking a quiz'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn btn-secondary"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid-responsive">
              {filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onTakeQuiz={handleTakeQuiz}
                  onDelete={user?.role === 'teacher' ? handleDeleteQuiz : undefined}
                  totalAttempts={getAttemptCountForQuiz(quiz.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAttempts.length === 0 ? (
            <div className="card text-center py-12">
              <h3 className="text-xl font-semibold text-[--text-primary] mb-2">
                {searchTerm ? 'No attempts found' : 'No attempts yet'}
              </h3>
              <p className="text-[--text-secondary]">
                {searchTerm
                  ? 'Try a different search term'
                  : 'Take a quiz to see your results here'}
              </p>
            </div>
          ) : (
            filteredAttempts.map((attempt) => {
              const quiz = quizzes.find((q) => q.id === attempt.quizId);
              const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
              
              return (
                <div key={attempt.id} className="card">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[--text-primary] mb-1 truncate">
                        {quiz?.title || 'Quiz'}
                      </h4>
                      <p className="text-sm text-[--text-tertiary]">
                        {new Date(attempt.completedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-xl font-bold text-[--text-primary]">
                          {attempt.score}/{attempt.totalQuestions}
                        </p>
                        <p className={`text-sm font-medium ${
                          percentage >= 70 
                            ? 'text-[--success-color]' 
                            : 'text-[--warning-color]'
                        }`}>
                          {percentage}%
                        </p>
                      </div>
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
