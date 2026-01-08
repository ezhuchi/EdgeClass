const QuizCard = ({ quiz, onTakeQuiz, onDelete, showActions = true }) => {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          quiz.syncStatus === 'synced'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {quiz.syncStatus === 'synced' ? '✓ Synced' : '⏳ Pending'}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span>📝 {quiz.questions?.length || 0} questions</span>
        <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
      </div>

      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={() => onTakeQuiz(quiz)}
            className="btn btn-primary flex-1"
          >
            Take Quiz
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(quiz.id)}
              className="btn btn-secondary px-4"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizCard;
