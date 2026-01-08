import { useState, useEffect } from 'react';
import { getCurrentUser } from '../db';
import { 
  createDoubt, 
  getDoubtsByStudent, 
  getDoubtReplies, 
  addDoubtReply,
  updateDoubtStatus 
} from '../db/doubts';
import db from '../db';

const StudentDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDoubtForm, setShowNewDoubtForm] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replies, setReplies] = useState([]);
  const [users, setUsers] = useState({});
  
  // Form states
  const [topic, setTopic] = useState('');
  const [chapter, setChapter] = useState('');
  const [question, setQuestion] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  
  const user = getCurrentUser();

  useEffect(() => {
    loadDoubts();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await db.users.toArray();
    const userMap = {};
    allUsers.forEach(u => {
      userMap[u.id] = u;
    });
    setUsers(userMap);
  };

  const loadDoubts = async () => {
    setLoading(true);
    try {
      const studentDoubts = await getDoubtsByStudent(user.id);
      setDoubts(studentDoubts);
    } catch (error) {
      console.error('Error loading doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e, isReply = false) => {
    const files = Array.from(e.target.files);
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const fileData = await Promise.all(filePromises);
    
    if (isReply) {
      setReplyAttachments([...replyAttachments, ...fileData]);
    } else {
      setAttachments([...attachments, ...fileData]);
    }
  };

  const removeAttachment = (index, isReply = false) => {
    if (isReply) {
      setReplyAttachments(replyAttachments.filter((_, i) => i !== index));
    } else {
      setAttachments(attachments.filter((_, i) => i !== index));
    }
  };

  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      alert('Please enter your doubt');
      return;
    }

    try {
      await createDoubt({
        topic: topic.trim(),
        chapter: chapter.trim(),
        question: question.trim(),
        attachments
      });

      setTopic('');
      setChapter('');
      setQuestion('');
      setAttachments([]);
      setShowNewDoubtForm(false);
      await loadDoubts();
    } catch (error) {
      console.error('Error creating doubt:', error);
      alert('Failed to post doubt. It will be saved and synced when online.');
    }
  };

  const handleViewDoubt = async (doubt) => {
    setSelectedDoubt(doubt);
    const doubtReplies = await getDoubtReplies(doubt.id);
    setReplies(doubtReplies);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      await addDoubtReply(selectedDoubt.id, {
        message: replyMessage.trim(),
        attachments: replyAttachments
      });

      setReplyMessage('');
      setReplyAttachments([]);
      const doubtReplies = await getDoubtReplies(selectedDoubt.id);
      setReplies(doubtReplies);
      await loadDoubts();
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to send reply. It will be saved and synced when online.');
    }
  };

  const handleMarkResolved = async (doubtId) => {
    try {
      await updateDoubtStatus(doubtId, 'resolved');
      await loadDoubts();
      if (selectedDoubt?.id === doubtId) {
        setSelectedDoubt(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[--text-secondary]">Loading doubts...</div>;
  }

  // Doubt detail view
  if (selectedDoubt) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedDoubt(null)}
          className="btn btn-secondary mb-4"
        >
          ← Back to Doubts
        </button>

        {/* Doubt Details */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {selectedDoubt.chapter && (
                  <span className="px-2 py-1 bg-[--accent-color] bg-opacity-10 text-[--accent-color] text-xs rounded">
                    {selectedDoubt.chapter}
                  </span>
                )}
                {selectedDoubt.topic && (
                  <span className="px-2 py-1 bg-[--bg-tertiary] text-[--text-secondary] text-xs rounded">
                    {selectedDoubt.topic}
                  </span>
                )}
              </div>
              <p className="text-[--text-primary] mb-2">{selectedDoubt.question}</p>
              <p className="text-xs text-[--text-tertiary]">
                Posted: {new Date(selectedDoubt.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded text-xs font-medium ${
              selectedDoubt.status === 'resolved'
                ? 'bg-[--success-bg] text-[--success-color]'
                : selectedDoubt.status === 'answered'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-[--warning-bg] text-[--warning-color]'
            }`}>
              {selectedDoubt.status === 'resolved' ? 'Resolved' : selectedDoubt.status === 'answered' ? 'Answered' : 'Open'}
            </span>
          </div>

          {/* Attachments */}
          {selectedDoubt.attachments && selectedDoubt.attachments.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-[--text-tertiary] mb-2">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {selectedDoubt.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.data}
                    download={file.name}
                    className="px-3 py-2 bg-[--bg-tertiary] rounded text-xs text-[--text-primary] hover:bg-[--border-color] flex items-center gap-2"
                  >
                    📎 {file.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[--text-primary]">Discussion</h3>
          
          {replies.length === 0 ? (
            <div className="card text-center py-8 text-[--text-secondary]">
              No replies yet. Your teacher will respond soon.
            </div>
          ) : (
            replies.map((reply) => {
              const isTeacher = users[reply.userId]?.role === 'teacher';
              return (
                <div key={reply.id} className={`card ${isTeacher ? 'bg-[--bg-tertiary]' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isTeacher ? 'bg-[--accent-color]' : 'bg-[--success-color]'
                    } text-white text-sm font-bold`}>
                      {(users[reply.userId]?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[--text-primary]">
                          {users[reply.userId]?.username || 'User'}
                        </span>
                        {isTeacher && (
                          <span className="px-2 py-0.5 bg-[--accent-color] text-white text-xs rounded">
                            Teacher
                          </span>
                        )}
                        <span className="text-xs text-[--text-tertiary]">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[--text-secondary]">{reply.message}</p>
                      
                      {reply.attachments && reply.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {reply.attachments.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.data}
                              download={file.name}
                              className="px-2 py-1 bg-[--bg-primary] rounded text-xs text-[--accent-color] hover:underline"
                            >
                              📎 {file.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Form */}
        {selectedDoubt.status !== 'resolved' && (
          <form onSubmit={handleSubmitReply} className="card">
            <h4 className="font-semibold text-[--text-primary] mb-4">Add Reply</h4>
            
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply or follow-up question..."
              className="textarea mb-3"
              rows={3}
              required
            />

            <div className="mb-4">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, true)}
                multiple
                className="hidden"
                id="reply-file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label htmlFor="reply-file-upload" className="btn btn-secondary text-sm cursor-pointer inline-block">
                📎 Attach Files
              </label>
              
              {replyAttachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {replyAttachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-[--bg-tertiary] rounded text-xs">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx, true)}
                        className="text-[--error-color] hover:text-[--error-color] font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                Send Reply
              </button>
              {selectedDoubt.status === 'answered' && (
                <button
                  type="button"
                  onClick={() => handleMarkResolved(selectedDoubt.id)}
                  className="btn btn-secondary"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    );
  }

  // Doubts list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[--text-primary]">My Doubts</h2>
          <p className="text-[--text-secondary]">Ask questions and get help from your teachers</p>
        </div>
        <button
          onClick={() => setShowNewDoubtForm(true)}
          className="btn btn-primary"
        >
          + Ask Doubt
        </button>
      </div>

      {/* New Doubt Form Modal */}
      {showNewDoubtForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[--bg-primary] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[--text-primary] mb-4">Ask a Doubt</h3>
            
            <form onSubmit={handleSubmitDoubt} className="space-y-4">
              <div>
                <label className="label">Chapter (Optional)</label>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="e.g., Chapter 5 - Photosynthesis"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Topic (Optional)</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Light Reaction"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Your Doubt *</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Describe your doubt in detail..."
                  className="textarea"
                  rows={5}
                  required
                />
              </div>

              <div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload" className="btn btn-secondary cursor-pointer inline-block">
                  📎 Attach Files (Images, PDFs, etc.)
                </label>
                
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[--bg-tertiary] rounded">
                        <span className="text-sm text-[--text-primary]">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-[--error-color] hover:text-[--error-color] font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Post Doubt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDoubtForm(false);
                    setTopic('');
                    setChapter('');
                    setQuestion('');
                    setAttachments([]);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doubts List */}
      {doubts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🤔</div>
          <h3 className="text-xl font-semibold text-[--text-primary] mb-2">
            No doubts yet
          </h3>
          <p className="text-[--text-secondary] mb-4">
            Have a question? Click "Ask Doubt" to get help from your teachers
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {doubts.map((doubt) => (
            <div
              key={doubt.id}
              onClick={() => handleViewDoubt(doubt)}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {doubt.chapter && (
                      <span className="px-2 py-1 bg-[--accent-color] bg-opacity-10 text-[--accent-color] text-xs rounded">
                        {doubt.chapter}
                      </span>
                    )}
                    {doubt.topic && (
                      <span className="px-2 py-1 bg-[--bg-tertiary] text-[--text-secondary] text-xs rounded">
                        {doubt.topic}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doubt.status === 'resolved'
                        ? 'bg-[--success-bg] text-[--success-color]'
                        : doubt.status === 'answered'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-[--warning-bg] text-[--warning-color]'
                    }`}>
                      {doubt.status === 'resolved' ? 'Resolved' : doubt.status === 'answered' ? 'Answered' : 'Open'}
                    </span>
                  </div>
                  <p className="text-[--text-primary] mb-2 line-clamp-2">{doubt.question}</p>
                  <p className="text-xs text-[--text-tertiary]">
                    {new Date(doubt.updatedAt).toLocaleString()}
                    {doubt.attachments && doubt.attachments.length > 0 && ` • ${doubt.attachments.length} attachment(s)`}
                  </p>
                </div>
                <span className="text-[--text-secondary]">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDoubts;
