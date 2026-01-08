const QuizCard = ({ quiz, onTakeQuiz, onDelete, showActions = true, totalAttempts = 0, totalStudents = 0, buttonText = "Take Quiz" }) => {
  const getSyncStatusBadge = () => {
    // Only show badge when NOT synced or syncing
    if (quiz.syncStatus === 'syncing') {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-[--warning-bg] text-[--warning-color] border border-[--warning-color]">
          Syncing...
        </span>
      );
    } else if (!quiz.syncStatus || quiz.syncStatus === 'pending') {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-[--warning-bg] text-[--warning-color] border border-[--warning-color]">
          Pending Sync
        </span>
      );
    }
    // Return null when synced - don't show anything
    return null;
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[--text-primary] mb-1">
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-sm text-[--text-secondary] mb-2">{quiz.description}</p>
          )}
        </div>
        {getSyncStatusBadge() && (
          <div className="ml-4">
            {getSyncStatusBadge()}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4 pb-4 border-b border-[--border-color]">
        <div>
          <p className="text-[--text-tertiary] text-xs font-medium">Questions</p>
          <p className="text-[--text-primary] font-semibold">{quiz.questions?.length || 0}</p>
        </div>
        <div>
          <p className="text-[--text-tertiary] text-xs font-medium">Time Limit</p>
          <p className="text-[--text-primary] font-semibold">{quiz.timeLimit || 30} min</p>
        </div>
        <div>
          <p className="text-[--text-tertiary] text-xs font-medium">Attempts</p>
          <p className="text-[--text-primary] font-semibold">{totalAttempts}</p>
        </div>
        {totalStudents > 0 && (
          <div>
            <p className="text-[--text-tertiary] text-xs font-medium">Students</p>
            <p className="text-[--text-primary] font-semibold">{totalStudents}</p>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={() => onTakeQuiz(quiz)}
            className="btn btn-primary flex-1"
          >
            {buttonText}
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(quiz.id)}
              className="btn btn-secondary"
              title="Delete quiz"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};


export default QuizCard;
