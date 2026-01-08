import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById } from '../db/quizzes';
import { submitAttempt } from '../db/attempts';
import LoadingSpinner from '../components/LoadingSpinner';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const quizData = await getQuizById(id);
      if (!quizData) {
        alert('Quiz not found');
        navigate('/dashboard');
        return;
      }
      setQuiz(quizData);
      setAnswers(new Array(quizData.questions.length).fill(''));
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Failed to load quiz');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.some(a => !a)) {
      if (!confirm('Some questions are unanswered. Submit anyway?')) {
        return;
      }
    }

    try {
      const attemptResult = await submitAttempt(id, answers);
      setResult(attemptResult);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  if (!quiz) {
    return null;
  }

  if (showResults) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const passed = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Good Effort!'}
          </h1>
          <p className="text-gray-600 mb-6">
            You've completed the quiz
          </p>

          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-8 mb-6">
            <div className="text-6xl font-bold text-primary-600 mb-2">
              {percentage}%
            </div>
            <p className="text-lg text-gray-700">
              {result.score} out of {result.totalQuestions} correct
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="card bg-green-50 border-green-200">
              <p className="text-sm text-green-800">
                ✅ Your answers have been saved offline and will sync automatically when you're online
              </p>
            </div>

            {!navigator.onLine && (
              <div className="card bg-yellow-50 border-yellow-200">
                <p className="text-sm text-yellow-800">
                  📡 You're currently offline. Results will sync when connection is restored.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Retake Quiz
            </button>
          </div>
        </div>

        {/* Answer Review */}
        <div className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Review Answers</h2>
          {quiz.questions.map((q, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <div key={index} className={`card ${
                isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {isCorrect ? '✅' : '❌'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {index + 1}. {q.question}
                    </h3>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Your answer:</strong> {userAnswer || 'Not answered'}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-700">
                        <strong>Correct answer:</strong> {q.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {question.question}
        </h2>

        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                answers[currentQuestion] === option
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  className="w-5 h-5 text-primary-600"
                />
                <span className="text-gray-900">{option}</span>
              </div>
            </label>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="card mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Question Navigator
        </h3>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                index === currentQuestion
                  ? 'bg-primary-600 text-white'
                  : answers[index]
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Offline Notice */}
      {!navigator.onLine && (
        <div className="card bg-yellow-50 border-yellow-200 mt-6">
          <p className="text-sm text-yellow-800">
            📡 You're currently offline. Your answers are being saved locally and will sync when you're back online.
          </p>
        </div>
      )}
    </div>
  );
};

export default Quiz;
