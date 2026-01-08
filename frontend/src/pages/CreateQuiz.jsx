import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../db/quizzes';

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert('Please enter a quiz title');
      return;
    }
    
    if (trimmedTitle.length < 3) {
      alert('Quiz title must be at least 3 characters long');
      return;
    }
    
    if (trimmedTitle.length > 200) {
      alert('Quiz title must be less than 200 characters');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    
    if (questions.length > 50) {
      alert('Maximum 50 questions allowed per quiz');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const trimmedQuestion = q.question.trim();
      
      if (!trimmedQuestion) {
        alert(`Question ${i + 1} is empty`);
        return;
      }
      
      if (trimmedQuestion.length < 5) {
        alert(`Question ${i + 1} must be at least 5 characters long`);
        return;
      }
      
      if (trimmedQuestion.length > 500) {
        alert(`Question ${i + 1} is too long (max 500 characters)`);
        return;
      }
      
      const trimmedOptions = q.options.map(opt => opt.trim());
      if (trimmedOptions.some(opt => !opt)) {
        alert(`Question ${i + 1} has empty options`);
        return;
      }
      
      // Check for duplicate options
      const uniqueOptions = new Set(trimmedOptions);
      if (uniqueOptions.size !== trimmedOptions.length) {
        alert(`Question ${i + 1} has duplicate options`);
        return;
      }
      
      if (!q.correctAnswer && q.correctAnswer !== 0) {
        alert(`Question ${i + 1} has no correct answer selected`);
        return;
      }
    }

    setLoading(true);
    try {
      await createQuiz({
        title: trimmedTitle,
        description: description.trim(),
        questions: questions.map(q => ({
          question: q.question.trim(),
          options: q.options.map(opt => opt.trim()),
          correctAnswer: q.correctAnswer
        }))
      });

      alert('✅ Quiz created successfully! (Saved offline, will sync when online)');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Quiz</h1>
        <p className="text-gray-600">
          Create engaging quizzes that work offline. Your quiz will be saved locally and synced when you're online.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Details */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Science"
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the quiz..."
                className="input min-h-[100px]"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="btn btn-secondary"
            >
              ➕ Add Question
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="card bg-gray-50">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {qIndex + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Enter your question..."
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options *
                  </label>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === option}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', option)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="input flex-1"
                          required
                        />
                        <span className="text-xs text-gray-500 w-20">
                          {q.correctAnswer === option ? '✅ Correct' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select the correct answer by clicking the radio button
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="card bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                💾 Quiz will be saved locally and synced automatically when online
              </p>
            </div>
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
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : '✨ Create Quiz'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
