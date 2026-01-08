import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../db/quizzes';
import { getCurrentUser } from '../db';

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      alert('Access denied. Only teachers can create quizzes.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], correctAnswer: '' }
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const validateAndCreate = async () => {
    setError('');
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle) {
      setError('Please enter a quiz title');
      return;
    }
    
    if (trimmedTitle.length < 3) {
      setError('Quiz title must be at least 3 characters long');
      return;
    }
    
    if (trimmedTitle.length > 200) {
      setError('Quiz title must be less than 200 characters');
      return;
    }

    if (!timeLimit || timeLimit < 1) {
      setError('Time limit must be at least 1 minute');
      return;
    }

    if (timeLimit > 180) {
      setError('Time limit cannot exceed 180 minutes (3 hours)');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }
    
    if (questions.length > 50) {
      setError('Maximum 50 questions allowed per quiz');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const trimmedQuestion = q.question.trim();
      
      if (!trimmedQuestion) {
        setError(`Question ${i + 1}: Please enter the question text`);
        return;
      }
      
      if (trimmedQuestion.length < 5) {
        setError(`Question ${i + 1}: Must be at least 5 characters long`);
        return;
      }
      
      if (trimmedQuestion.length > 500) {
        setError(`Question ${i + 1}: Cannot exceed 500 characters`);
        return;
      }
      
      const trimmedOptions = q.options.map(opt => opt.trim());
      if (trimmedOptions.some(opt => !opt)) {
        setError(`Question ${i + 1}: All options must be filled`);
        return;
      }
      
      const uniqueOptions = new Set(trimmedOptions);
      if (uniqueOptions.size !== trimmedOptions.length) {
        setError(`Question ${i + 1}: Duplicate options are not allowed`);
        return;
      }
      
      if (!q.correctAnswer && q.correctAnswer !== 0) {
        setError(`Question ${i + 1}: Please select the correct answer`);
        return;
      }
    }

    setLoading(true);
    try {
      await createQuiz({
        title: trimmedTitle,
        description: description.trim(),
        timeLimit: timeLimit, // Time limit in minutes
        questions: questions.map(q => ({
          question: q.question.trim(),
          options: q.options.map(opt => opt.trim()),
          correctAnswer: q.correctAnswer
        }))
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateAndCreate();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[--text-primary] mb-2">Create Quiz</h1>
        <p className="text-[--text-secondary]">
          Build engaging quizzes that work offline. Automatically synced when online.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Details */}
        <div className="card">
          <h2 className="section-title mb-6">Quiz Information</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="label">Quiz Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                placeholder="e.g., Biology 101: Photosynthesis"
                className="input"
                required
              />
              <p className="label-hint">{title.length}/200 characters</p>
            </div>

            <div>
              <label htmlFor="description" className="label">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the quiz content..."
                className="textarea"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="timeLimit" className="label">Time Limit (Minutes)</label>
              <input
                id="timeLimit"
                type="number"
                min="1"
                max="180"
                value={timeLimit}
                onChange={(e) => {
                  setTimeLimit(parseInt(e.target.value) || 0);
                  setError('');
                }}
                placeholder="30"
                className="input"
                required
              />
              <p className="label-hint">Students will have {timeLimit} minute{timeLimit !== 1 ? 's' : ''} to complete this quiz (1-180 minutes)</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-opacity-10 bg-[--danger-color] text-[--danger-color] rounded-lg text-sm border border-[--danger-color] border-opacity-20">
            {error}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[--text-primary]">
              Total Questions : {questions.length}
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="btn btn-secondary"
              disabled={questions.length >= 50}
            >
              Add Question
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="card bg-[--bg-tertiary]">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-lg font-semibold text-[--text-primary]">
                  Question {qIndex + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-[--danger-color] hover:text-[--danger-color] font-medium text-sm transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="label">Question Text</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="What is the correct answer to..."
                    className="input"
                    required
                  />
                  <p className="label-hint">{q.question.length}/500 characters</p>
                </div>

                <div>
                  <label className="label mb-4">Answer Options</label>
                  <div className="space-y-3">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          id={`correct-${qIndex}-${oIndex}`}
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === option}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', option)}
                          className="w-4 h-4 accent-[--accent-color]"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          className="input flex-1"
                          required
                        />
                        {q.correctAnswer === option && (
                          <span className="text-xs font-medium text-[--success-color] whitespace-nowrap">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="label-hint">Select the correct answer with the radio button</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="card bg-[--bg-tertiary]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-[--text-secondary]">
              Saved offline and synced when you connect to the internet
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
