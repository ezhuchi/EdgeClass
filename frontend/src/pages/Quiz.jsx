import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById } from '../db/quizzes';
import { submitAttempt } from '../db/attempts';
import { getCurrentUser } from '../db';
import LoadingSpinner from '../components/LoadingSpinner';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const timerRef = useRef(null);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      alert('Only students can take quizzes.');
      navigate('/dashboard');
      return;
    }
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (quizStarted && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto submit
            clearInterval(timerRef.current);
            autoSubmitRef.current = true;
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [quizStarted, showResults]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const quizData = await getQuizById(id);
      
      if (!quizData) {
        alert('Quiz not found');
        navigate('/dashboard');
        return;
      }
      
      if (!quizData.questions || quizData.questions.length === 0) {
        alert('This quiz has no questions');
        navigate('/dashboard');
        return;
      }
      
      setQuiz(quizData);
      setAnswers(new Array(quizData.questions.length).fill(''));
      // Set time limit in seconds (convert from minutes)
      setTimeRemaining((quizData.timeLimit || 30) * 60);
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Failed to load quiz');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
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
    const isAutoSubmit = autoSubmitRef.current;
    
    if (!isAutoSubmit && answers.some(a => !a)) {
      if (!confirm('Some questions are unanswered. Submit anyway?')) {
        return;
      }
    }

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const attemptResult = await submitAttempt(id, answers);
      setResult(attemptResult);
      setShowResults(true);
      
      if (isAutoSubmit) {
        setTimeout(() => {
          alert('Time\'s up! Your quiz has been automatically submitted with your current answers.');
        }, 100);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Your answers are saved locally and will sync when online.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  if (!quiz) {
    return null;
  }

  // Start screen
  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h1 className="text-3xl font-bold text-[--text-primary] mb-4">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-[--text-secondary] mb-8">
              {quiz.description}
            </p>
          )}
          
          <div className="bg-[--bg-tertiary] rounded-xl p-8 mb-8 border border-[--border-color]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-[--text-tertiary] text-sm mb-2">Questions</p>
                <p className="text-3xl font-bold text-[--accent-color]">{quiz.questions.length}</p>
              </div>
              <div>
                <p className="text-[--text-tertiary] text-sm mb-2">Time Limit</p>
                <p className="text-3xl font-bold text-[--accent-color]">{quiz.timeLimit || 30} min</p>
              </div>
              <div>
                <p className="text-[--text-tertiary] text-sm mb-2">Pass Mark</p>
                <p className="text-3xl font-bold text-[--accent-color]">70%</p>
              </div>
            </div>
          </div>

          <div className="mb-6 text-left bg-[--bg-tertiary] rounded-lg p-6">
            <h3 className="font-semibold text-[--text-primary] mb-3">Instructions:</h3>
            <ul className="space-y-2 text-sm text-[--text-secondary]">
              <li>• You have {quiz.timeLimit || 30} minutes to complete the quiz</li>
              <li>• Once started, the timer cannot be paused</li>
              <li>• Your answers are saved automatically</li>
              <li>• You can navigate between questions freely</li>
              <li>• Quiz will auto-submit when time expires</li>
              <li>• Works offline - will sync when you're back online</li>
            </ul>
          </div>

          <button
            onClick={startQuiz}
            className="btn btn-primary text-lg px-8 py-3"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const passed = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center mb-8">
          <h1 className="text-3xl font-bold text-[--text-primary] mb-2">
            {passed ? 'Quiz Completed' : 'Quiz Completed'}
          </h1>
          <p className="text-[--text-secondary] mb-8">
            Your responses have been saved and will sync automatically
          </p>

          <div className="bg-[--bg-tertiary] rounded-xl p-8 mb-8 border border-[--border-color]">
            <div className={`text-5xl font-bold mb-2 ${
              passed ? 'text-[--success-color]' : 'text-[--accent-color]'
            }`}>
              {percentage}%
            </div>
            <p className="text-[--text-secondary]">
              {result.score} out of {result.totalQuestions} correct
            </p>
          </div>

          <div className="flex gap-3 justify-center mb-8">
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
              Retake
            </button>
          </div>
        </div>

        {/* Answer Review */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[--text-primary]">Review</h2>
          {quiz.questions.map((q, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <div key={index} className={`card ${
                isCorrect 
                  ? 'bg-opacity-5 border-[--success-color] border-opacity-30' 
                  : 'bg-opacity-5 border-[--warning-color] border-opacity-30'
              }`}>
                <div className="flex gap-4">
                  <div className={`text-xl font-bold flex-shrink-0 ${
                    isCorrect ? 'text-[--success-color]' : 'text-[--warning-color]'
                  }`}>
                    {isCorrect ? '✓' : '✕'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[--text-primary] mb-3">
                      {index + 1}. {q.question}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-[--text-tertiary]">Your answer:</span>
                        <span className="text-[--text-primary] font-medium ml-2">
                          {userAnswer || 'Not answered'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p>
                          <span className="text-[--text-tertiary]">Correct answer:</span>
                          <span className="text-[--success-color] font-medium ml-2">
                            {q.correctAnswer}
                          </span>
                        </p>
                      )}
                    </div>
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
  const answeredCount = answers.filter(a => a).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[--text-primary]">{quiz.title}</h1>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${
              timeRemaining < 300 
                ? 'bg-[--error-color] bg-opacity-10 text-[--error-color] border border-[--error-color]' 
                : timeRemaining < 600
                ? 'bg-[--warning-bg] text-[--warning-color] border border-[--warning-color]'
                : 'bg-[--bg-tertiary] text-[--accent-color] border border-[--border-color]'
            }`}>
              {formatTime(timeRemaining)}
            </div>
            <span className="badge badge-neutral">
              {currentQuestion + 1} / {quiz.questions.length}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-[--border-color] rounded-full h-2 overflow-hidden">
          <div
            className="bg-[--accent-color] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[--text-tertiary] mt-2">
          {answeredCount} of {quiz.questions.length} answered
        </p>
      </div>

      {/* Question Card */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-[--text-primary] mb-8">
          {question.question}
        </h2>

        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => {
            const isSelected = answers[currentQuestion] === option;
            return (
              <label
                key={index}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[--accent-color] bg-[--bg-tertiary]'
                    : 'border-[--border-color] hover:border-[--accent-color] bg-[--bg-primary]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={isSelected}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="w-4 h-4 accent-[--accent-color]"
                  />
                  <span className="text-[--text-primary]">{option}</span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-[--border-color]">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
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
              Next
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="card">
        <h3 className="text-sm font-semibold text-[--text-primary] mb-4">
          Questions
        </h3>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg font-medium transition-all text-sm ${
                index === currentQuestion
                  ? 'bg-[--accent-color] text-white'
                  : answers[index]
                  ? 'bg-[--success-color] text-white border border-[--success-color]'
                  : 'bg-[--bg-tertiary] text-[--text-secondary] border border-[--border-color]'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
