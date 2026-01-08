import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes } from '../db/quizzes';
import { getAllAttempts } from '../db/attempts';
import { getCurrentUser } from '../db';
import db from '../db';
import QuizCard from '../components/QuizCard';
import StudentDoubts from '../components/StudentDoubts';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSyncStatus } from '../sync/useSyncStatus';

const StudentDashboard = () => {
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('quizzes'); // 'quizzes', 'scores', or 'doubts'
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
      // Get all quizzes
      const allQuizzes = await getQuizzes();
      
      // Get all teacher users
      const teacherUsers = await db.users.where('role').equals('teacher').toArray();
      const teacherIds = new Set(teacherUsers.map(t => t.id));
      
      // Create teacher map
      const teacherMap = {};
      teacherUsers.forEach(t => {
        teacherMap[t.id] = t.username;
      });
      setTeachers(teacherMap);
      
      // Filter to show only quizzes created by teachers (not by other students or self)
      const teacherQuizzes = allQuizzes.filter(q => teacherIds.has(q.createdBy));
      
      // Load questions for each quiz
      const quizzesWithQuestions = await Promise.all(
        teacherQuizzes.map(async (quiz) => {
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
      
      // Get my attempts
      const allAttempts = await getAllAttempts();
      const studentAttempts = allAttempts.filter(a => a.userId === user?.id);
      
      setAvailableQuizzes(quizzesWithQuestions);
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
      <div className="bg-[--bg-tertiary] rounded-xl p-6">
        <h1 className="text-3xl font-bold text-[--text-primary] mb-2">
          Welcome, {user?.username}
        </h1>
        <p className="text-[--text-secondary]">
          Take quizzes and track your progress. Everything works offline!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div>
            <p className="text-sm text-[--text-tertiary] font-medium">Available Quizzes</p>
            <p className="text-3xl font-bold text-[--text-primary]">{availableQuizzes.length}</p>
          </div>
        </div>

        <div className="card">
          <div>
            <p className="text-sm text-[--text-tertiary] font-medium">Completed</p>
            <p className="text-3xl font-bold text-[--text-primary]">{myAttempts.length}</p>
          </div>
        </div>

        <div className="card">
          <div>
            <p className="text-sm text-[--text-tertiary] font-medium">Avg Score</p>
            <p className="text-3xl font-bold text-[--text-primary]">{avgScore}%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[--border-color] pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('quizzes')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'quizzes'
                ? 'text-[--accent-color] border-b-2 border-[--accent-color]'
                : 'text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            Available Quizzes ({filteredQuizzes.length})
          </button>
          <button
            onClick={() => setView('scores')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'scores'
                ? 'text-[--accent-color] border-b-2 border-[--accent-color]'
                : 'text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            My Scores ({filteredAttempts.length})
          </button>
          <button
            onClick={() => setView('doubts')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'doubts'
                ? 'text-[--accent-color] border-b-2 border-[--accent-color]'
                : 'text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            Doubts
          </button>
        </div>

        {/* Search and Sort */}
        {view !== 'doubts' && (
          <div className="flex gap-2 items-center">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-tertiary] hover:text-[--text-primary] transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            
            {view === 'quizzes' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">A-Z</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {view === 'quizzes' ? (
        <div className="grid-responsive">
          {filteredQuizzes.length === 0 ? (
            <div className="col-span-full text-center py-12 card">
              {searchTerm ? (
                <>
                  <h3 className="text-xl font-semibold text-[--text-primary] mb-2">
                    No quizzes found
                  </h3>
                  <p className="text-[--text-secondary] mb-4">
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
                  <h3 className="text-xl font-semibold text-[--text-primary] mb-2">
                    No quizzes available yet
                  </h3>
                  <p className="text-[--text-secondary]">
                    Your teachers haven't created any quizzes yet. Check back later!
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const attemptCount = myAttempts.filter(a => a.quizId === quiz.id).length;
              
              return (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onTakeQuiz={handleTakeQuiz}
                  totalAttempts={attemptCount}
                  showActions={true}
                  teacherName={teachers[quiz.createdBy]}
                />
              );
            })
          )}
        </div>
      ) : view === 'doubts' ? (
        <StudentDoubts />
      ) : (
        <div className="space-y-3">
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm ? (
                <>
                  <h3 className="text-xl font-semibold text-[--text-primary] mb-2">
                    No scores found
                  </h3>
                  <p className="text-[--text-secondary] mb-4">
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
                  <h3 className="text-xl font-semibold text-[--text-primary] mb-2">
                    No quiz attempts yet
                  </h3>
                  <p className="text-[--text-secondary] mb-4">
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
                    <h4 className="font-semibold text-[--text-primary] mb-1">
                      {quiz?.title || 'Unknown Quiz'}
                    </h4>
                    <p className="text-sm text-[--text-secondary]">
                      Completed: {new Date(attempt.completedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[--text-primary]">
                        {attempt.score}/{attempt.totalQuestions}
                      </p>
                      <p className={`text-sm font-medium ${
                        percentage >= 70 ? 'text-[--success-color]' : 
                        percentage >= 50 ? 'text-[--warning-color]' : 'text-[--error-color]'
                      }`}>
                        {percentage}%
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-medium ${
                      attempt.syncStatus === 'synced'
                        ? 'bg-[--success-bg] text-[--success-color]'
                        : 'bg-[--warning-bg] text-[--warning-color]'
                    }`}>
                      {attempt.syncStatus === 'synced' ? 'Synced' : 'Pending'}
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
