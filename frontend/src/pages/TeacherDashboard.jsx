import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes, deleteQuiz } from '../db/quizzes';
import { getAllAttempts } from '../db/attempts';
import { getCurrentUser } from '../db';
import db from '../db';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSyncStatus } from '../sync/useSyncStatus';
import TeacherDoubts from '../components/TeacherDoubts';

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [studentUsers, setStudentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('quizzes'); // 'quizzes', 'attempts', or 'doubts'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
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
      // Get all quizzes created by this teacher
      const allQuizzes = await getQuizzes();
      const myQuizzes = allQuizzes.filter(q => q.createdBy === user?.id);
      
      // Load questions count for each quiz
      const quizzesWithQuestions = await Promise.all(
        myQuizzes.map(async (quiz) => {
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
      
      // Get only attempts for MY quizzes (not other teachers' quizzes)
      const allAttempts = await getAllAttempts();
      const myQuizIds = new Set(myQuizzes.map(q => q.id));
      const attempts = allAttempts.filter(a => myQuizIds.has(a.quizId));
      
      // Get all student users
      const users = await db.users.where('role').equals('student').toArray();
      
      setQuizzes(quizzesWithQuestions);
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

  const getAttemptCountForQuiz = (quizId) => {
    return allAttempts.filter(a => a.quizId === quizId).length;
  };

  const getTotalStudentsForQuiz = (quizId) => {
    return new Set(allAttempts.filter(a => a.quizId === quizId).map(a => a.userId)).size;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-[--bg-tertiary] rounded-xl p-6">
        <h1 className="text-3xl font-bold text-[--text-primary] mb-2">
          Teacher Dashboard - Welcome, {user?.username}
        </h1>
        <p className="text-[--text-secondary]">
          Create and manage quizzes. View student performance even offline.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div>
            <p className="text-sm text-[--text-tertiary] font-medium">My Quizzes</p>
            <p className="text-3xl font-bold text-[--text-primary]">{quizzes.length}</p>
          </div>
        </div>

        <div className="card">
          <div>
            <p className="text-sm text-[--text-tertiary] font-medium">Total Students</p>
            <p className="text-3xl font-bold text-[--text-primary]">{totalStudents}</p>
          </div>
        </div>

        <div className="card">
          <div>
            <p className="text-sm text-[--text-tertiary] font-medium">Total Attempts</p>
            <p className="text-3xl font-bold text-[--text-primary]">{allAttempts.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-[--bg-tertiary]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[--text-primary] mb-1">
              Ready to create a new quiz?
            </h3>
            <p className="text-sm text-[--text-secondary]">
              Build engaging quizzes that work offline for your students
            </p>
          </div>
          <button
            onClick={() => navigate('/create-quiz')}
            className="btn btn-primary"
          >
            Create Quiz
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[--border-color] pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setView('quizzes'); setSelectedQuizId(null); }}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'quizzes'
                ? 'text-[--accent-color] border-b-2 border-[--accent-color]'
                : 'text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            My Quizzes ({filteredQuizzes.length})
          </button>
          <button
            onClick={() => setView('attempts')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'attempts'
                ? 'text-[--accent-color] border-b-2 border-[--accent-color]'
                : 'text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            Student Attempts ({quizAttempts.length})
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

        {/* Search and Sort - Hidden on doubts view */}
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
                    No quizzes yet
                  </h3>
                  <p className="text-[--text-secondary] mb-4">
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
                onTakeQuiz={handleViewAttempts}
                onDelete={handleDeleteQuiz}
                totalAttempts={getAttemptCountForQuiz(quiz.id)}
                totalStudents={getTotalStudentsForQuiz(quiz.id)}
                buttonText="View Attempts"
              />
            ))
          )}
        </div>
      ) : view === 'attempts' ? (
        <div className="space-y-4">
          {selectedQuiz && (
            <div className="card bg-[--bg-tertiary]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[--text-primary]">
                    Viewing attempts for: {selectedQuiz.title}
                  </h3>
                  <p className="text-sm text-[--text-secondary] mt-1">
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
            <div className="text-center py-12 card">
              <h3 className="text-xl font-semibold text-[--text-primary] mb-2">
                No attempts yet
              </h3>
              <p className="text-[--text-secondary]">
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
                      <h4 className="font-semibold text-[--text-primary] mb-1">
                        {getStudentName(attempt.userId)}
                      </h4>
                      <p className="text-sm text-[--text-secondary]">
                        Quiz: {quiz?.title || 'Unknown Quiz'}
                      </p>
                      <p className="text-xs text-[--text-tertiary] mt-1">
                        {new Date(attempt.completedAt).toLocaleString()}
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
              })}
            </div>
          )}
        </div>
      ) : (
        <TeacherDoubts />
      )}
    </div>
  );
};

export default TeacherDashboard;
