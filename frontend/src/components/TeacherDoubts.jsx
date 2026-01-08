import { useState, useEffect } from 'react';
import { getCurrentUser } from '../db';
import { 
  getAllDoubts, 
  getDoubtReplies, 
  addDoubtReply,
  updateDoubtStatus 
} from '../db/doubts';
import db from '../db';

const TeacherDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replies, setReplies] = useState([]);
  const [users, setUsers] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'open', 'answered', 'resolved'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reply form states
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
      const allDoubts = await getAllDoubts();
      setDoubts(allDoubts);
    } catch (error) {
      console.error('Error loading doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
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
    setReplyAttachments([...replyAttachments, ...fileData]);
  };

  const removeAttachment = (index) => {
    setReplyAttachments(replyAttachments.filter((_, i) => i !== index));
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

  const filteredDoubts = doubts
    .filter(doubt => {
      if (filterStatus !== 'all' && doubt.status !== filterStatus) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          doubt.question.toLowerCase().includes(search) ||
          doubt.topic?.toLowerCase().includes(search) ||
          doubt.chapter?.toLowerCase().includes(search) ||
          users[doubt.studentId]?.username.toLowerCase().includes(search)
        );
      }
      return true;
    });

  if (loading) {
    return <div className="text-center py-12 text-[--text-secondary]">Loading doubts...</div>;
  }

  // Doubt detail view
  if (selectedDoubt) {
    const student = users[selectedDoubt.studentId];
    
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedDoubt(null)}
          className="btn btn-secondary mb-4"
        >
          ← Back to All Doubts
        </button>

        {/* Doubt Details */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[--success-color] flex items-center justify-center text-white text-sm font-bold">
                  {(student?.username || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[--text-primary]">{student?.username || 'Student'}</p>
                  <p className="text-xs text-[--text-tertiary]">
                    Posted: {new Date(selectedDoubt.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
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
              
              <p className="text-[--text-primary] text-lg mb-2">{selectedDoubt.question}</p>
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
            <div className="mt-4 p-3 bg-[--bg-tertiary] rounded-lg">
              <p className="text-sm text-[--text-tertiary] mb-2">Student's Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {selectedDoubt.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.data}
                    download={file.name}
                    className="px-3 py-2 bg-[--bg-primary] rounded text-xs text-[--accent-color] hover:underline flex items-center gap-2"
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
              No replies yet. Be the first to help this student!
            </div>
          ) : (
            replies.map((reply) => {
              const isTeacher = users[reply.userId]?.role === 'teacher';
              const isCurrentUser = reply.userId === user.id;
              
              return (
                <div key={reply.id} className={`card ${isTeacher ? 'bg-[--bg-tertiary] border-l-4 border-[--accent-color]' : ''}`}>
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
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-[--success-bg] text-[--success-color] text-xs rounded">
                            You
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
          <form onSubmit={handleSubmitReply} className="card bg-[--bg-tertiary]">
            <h4 className="font-semibold text-[--text-primary] mb-4">Reply to Student</h4>
            
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Provide your answer or clarification..."
              className="textarea mb-3"
              rows={4}
              required
            />

            <div className="mb-4">
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className="hidden"
                id="reply-file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label htmlFor="reply-file-upload" className="btn btn-secondary text-sm cursor-pointer inline-block">
                📎 Attach Files (Documents, Images, etc.)
              </label>
              
              {replyAttachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {replyAttachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-[--bg-primary] rounded text-xs">
                      <span>{file.name}</span>
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

            <button type="submit" className="btn btn-primary">
              Send Reply
            </button>
          </form>
        )}

        {selectedDoubt.status === 'resolved' && (
          <div className="card bg-[--success-bg] border border-[--success-color]">
            <p className="text-[--success-color] font-semibold">✓ This doubt has been marked as resolved by the student</p>
          </div>
        )}
      </div>
    );
  }

  // Doubts list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[--text-primary]">Student Doubts</h2>
          <p className="text-[--text-secondary]">Help your students with their questions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by question, topic, chapter, or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input"
        >
          <option value="all">All Doubts</option>
          <option value="open">Open</option>
          <option value="answered">Answered</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card-sm text-center">
          <p className="text-2xl font-bold text-[--text-primary]">{doubts.length}</p>
          <p className="text-xs text-[--text-tertiary]">Total</p>
        </div>
        <div className="card-sm text-center">
          <p className="text-2xl font-bold text-[--warning-color]">{doubts.filter(d => d.status === 'open').length}</p>
          <p className="text-xs text-[--text-tertiary]">Open</p>
        </div>
        <div className="card-sm text-center">
          <p className="text-2xl font-bold text-blue-600">{doubts.filter(d => d.status === 'answered').length}</p>
          <p className="text-xs text-[--text-tertiary]">Answered</p>
        </div>
        <div className="card-sm text-center">
          <p className="text-2xl font-bold text-[--success-color]">{doubts.filter(d => d.status === 'resolved').length}</p>
          <p className="text-xs text-[--text-tertiary]">Resolved</p>
        </div>
      </div>

      {/* Doubts List */}
      {filteredDoubts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-xl font-semibold text-[--text-primary] mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No doubts found' : 'No doubts yet'}
          </h3>
          <p className="text-[--text-secondary]">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Students can ask their doubts from their dashboard'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDoubts.map((doubt) => {
            const student = users[doubt.studentId];
            
            return (
              <div
                key={doubt.id}
                onClick={() => handleViewDoubt(doubt)}
                className="card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[--success-color] flex items-center justify-center text-white text-xs font-bold">
                        {(student?.username || 'S')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-[--text-secondary]">
                        {student?.username || 'Student'}
                      </span>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherDoubts;
