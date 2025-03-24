import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const TaskDetail = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // State for comments
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // State for status changes
  const [newStatus, setNewStatus] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // State for delegation
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateToId, setDelegateToId] = useState('');
  const [delegateNotes, setDelegateNotes] = useState('');
  const [delegating, setDelegating] = useState(false);

  // Format status display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    if (status === 'in_progress') return 'In Progress';
    
    // Capitalize first letter of each word
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Fetch task data and related information
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Get task details
        const taskResponse = await axios.get(`${API_URL}/tasks/${id}/`, { headers });
        setTask(taskResponse.data);
        setNewStatus(taskResponse.data.status);
        
        // Get comments for this task
        const commentsResponse = await axios.get(`${API_URL}/comments/?task_id=${id}`, { headers });
        setComments(commentsResponse.data);
        
        // Get task history
        const historyResponse = await axios.get(`${API_URL}/history/?task_id=${id}`, { headers });
        setHistory(historyResponse.data);
        
        // Get team members for delegation
        const teamMembersResponse = await axios.get(`${API_URL}/team-members/`, { headers });
        setTeamMembers(teamMembersResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching task data:', err);
        setError('Failed to load task details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && id) {
      fetchTaskData();
    }
  }, [token, id]);
  
  // Add a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const response = await axios.post(
        `${API_URL}/tasks/${id}/add_comment/`,
        { text: newComment },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Add the new comment to the list
      setComments(prev => [...prev, response.data]);
      setNewComment('');
      
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  // Change task status
  const handleStatusChange = async (e) => {
    e.preventDefault();
    
    if (newStatus === task.status) return;
    
    setChangingStatus(true);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      let response;
      
      // Special handling for approve/reject
      if (newStatus === 'approved' && task.status === 'completed') {
        response = await axios.post(`${API_URL}/tasks/${id}/approve/`, {}, { headers });
      } else if (newStatus === 'rejected' && task.status === 'completed') {
        if (!rejectionReason.trim()) {
          alert('Please provide a reason for rejection');
          setChangingStatus(false);
          return;
        }
        
        response = await axios.post(
          `${API_URL}/tasks/${id}/reject/`,
          { rejection_reason: rejectionReason },
          { headers }
        );
      } else {
        // Regular status update
        response = await axios.patch(
          `${API_URL}/tasks/${id}/`,
          { status: newStatus },
          { headers }
        );
      }
      
      // Update the task in the state
      setTask(prev => ({ ...prev, status: response.data.status }));
      
      // Refresh history
      const historyResponse = await axios.get(`${API_URL}/history/?task_id=${id}`, { headers });
      setHistory(historyResponse.data);
      
    } catch (err) {
      console.error('Error changing status:', err);
      alert('Failed to change task status. Please try again.');
    } finally {
      setChangingStatus(false);
      setRejectionReason('');
    }
  };
  
  // Handle delegation
  const handleDelegate = async (e) => {
    e.preventDefault();
    
    if (!delegateToId) {
      alert('Please select a team member to delegate to');
      return;
    }
    
    setDelegating(true);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const response = await axios.post(
        `${API_URL}/tasks/${id}/delegate/`,
        {
          team_member_id: delegateToId,
          delegation_notes: delegateNotes
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update task with new assignee
      setTask(response.data);
      
      // Refresh history
      const historyResponse = await axios.get(
        `${API_URL}/history/?task_id=${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setHistory(historyResponse.data);
      
      // Close the modal
      setShowDelegateModal(false);
      setDelegateToId('');
      setDelegateNotes('');
      
    } catch (err) {
      console.error('Error delegating task:', err);
      alert('Failed to delegate task. Please try again.');
    } finally {
      setDelegating(false);
    }
  };
  
  // Delete task
  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      await axios.delete(`${API_URL}/tasks/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Redirect to tasks list
      navigate('/dashboard/tasks');
      
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-2">
                  <Link to="/dashboard/tasks" className="text-sm font-medium text-red-700 hover:text-red-600">
                    Return to Tasks List
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Task not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The task you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <div className="mt-6">
              <Link to="/dashboard/tasks" className="btn btn-primary">
                Return to Tasks List
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">{task.title}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                  {formatStatus(task.status)}
                </span>
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Created on {new Date(task.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link to={`/dashboard/tasks/${id}/edit`} className="btn btn-outline">
                Edit
              </Link>
              <button 
                onClick={handleDeleteTask}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content - two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Task details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task details card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Task Details</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-900">{task.description || 'No description provided'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Priority</h3>
                    <div className="flex items-center">
                      {task.priority === 'high' || task.priority === 'urgent' ? (
                        <span className="h-2 w-2 bg-red-400 rounded-full mr-2"></span>
                      ) : task.priority === 'medium' ? (
                        <span className="h-2 w-2 bg-yellow-400 rounded-full mr-2"></span>
                      ) : (
                        <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
                      )}
                      <span className="capitalize">{task.priority || 'Medium'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Due Date</h3>
                    <p>{task.due_date ? new Date(task.due_date).toLocaleString() : 'No due date'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h3>
                    <div className="flex items-center">
                      {task.assigned_to ? (
                        <>
                          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium mr-2">
                            {task.assigned_to_name?.charAt(0) || '?'}
                          </div>
                          <span>{task.assigned_to_name}</span>
                          <button 
                            className="ml-2 text-primary-600 hover:text-primary-700 text-sm"
                            onClick={() => setShowDelegateModal(true)}
                          >
                            (Reassign)
                          </button>
                        </>
                      ) : (
                        <>
                          <span>Unassigned</span>
                          <button 
                            className="ml-2 text-primary-600 hover:text-primary-700 text-sm"
                            onClick={() => setShowDelegateModal(true)}
                          >
                            (Assign)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Created By</h3>
                    <p>{task.created_by_name || 'Unknown'}</p>
                  </div>
                  
                  {task.delegated_by && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Delegation Notes</h3>
                      <div className="bg-yellow-50 p-3 rounded-md">
                        <p className="text-sm">
                          Delegated by <strong>{task.delegated_by_name}</strong> on {new Date(task.delegation_date).toLocaleDateString()}
                        </p>
                        {task.delegation_notes && (
                          <p className="text-sm mt-1">{task.delegation_notes}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {task.rejected_by && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Rejection Reason</h3>
                      <div className="bg-red-50 p-3 rounded-md">
                        <p className="text-sm">
                          Rejected by <strong>{task.rejected_by_name}</strong>
                        </p>
                        <p className="text-sm mt-1">{task.rejection_reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Comments section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Comments</h2>
              </div>
              <div className="p-6">
                {/* Comment form */}
                <form onSubmit={handleAddComment} className="mb-6">
                  <textarea
                    className="input w-full"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submittingComment || !newComment.trim()}
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
                
                {/* Comments list */}
                <div className="space-y-4">
                  {comments.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                  
                  {comments.map(comment => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium mr-2">
                            {comment.author_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{comment.author_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-800 pl-10">{comment.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Actions and activity */}
          <div className="space-y-6">
            {/* Actions card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Status change */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Change Status</h3>
                  <form onSubmit={handleStatusChange}>
                    <select
                      className="input w-full mb-2"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={changingStatus}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      {task.status === 'completed' && (
                        <>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </>
                      )}
                    </select>
                    
                    {newStatus === 'rejected' && task.status === 'completed' && (
                      <textarea
                        className="input w-full mb-2"
                        placeholder="Reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                      ></textarea>
                    )}
                    
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={changingStatus || newStatus === task.status}
                    >
                      {changingStatus ? 'Updating...' : 'Update Status'}
                    </button>
                  </form>
                </div>
                
                {/* Delegate action */}
                <div>
                  <button
                    onClick={() => setShowDelegateModal(true)}
                    className="btn btn-outline w-full"
                  >
                    Assign/Delegate Task
                  </button>
                </div>
              </div>
            </div>
            
            {/* Activity history */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Activity History</h2>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <ol className="relative border-l border-gray-200 ml-3">
                  {history.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No activity recorded yet.
                    </div>
                  )}
                  
                  {history.map(entry => (
                    <li key={entry.id} className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-primary-100 rounded-full -left-3 ring-8 ring-white">
                        {entry.action === 'created' && (
                          <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                            <path d="M9 13h2v5a1 1 0 11-2 0v-5z"></path>
                          </svg>
                        )}
                        {entry.action === 'updated' && (
                          <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                          </svg>
                        )}
                        {(entry.action === 'status_changed' || entry.action === 'completed' || entry.action === 'approved' || entry.action === 'rejected') && (
                          <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path>
                          </svg>
                        )}
                        {entry.action === 'assigned' && (
                          <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                          </svg>
                        )}
                        {entry.action === 'commented' && (
                          <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
                          </svg>
                        )}
                      </span>
                      <h3 className="flex items-center text-sm font-semibold text-gray-900">
                        {entry.actor_name || 'Unknown user'}
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-2 capitalize">
                          {entry.action.replace('_', ' ')}
                        </span>
                      </h3>
                      <time className="block text-xs font-normal leading-none text-gray-500 mb-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </time>
                      <p className="text-sm font-normal text-gray-600">
                        {entry.description}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        {/* Delegation Modal */}
        {showDelegateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Assign/Delegate Task</h3>
                <button 
                  onClick={() => setShowDelegateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleDelegate} className="p-6">
                <div className="mb-4">
                  <label htmlFor="delegate-to" className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <select
                    id="delegate-to"
                    className="input w-full"
                    value={delegateToId}
                    onChange={(e) => setDelegateToId(e.target.value)}
                    required
                  >
                    <option value="">Select Team Member</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="delegate-notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Delegation Notes (Optional)
                  </label>
                  <textarea
                    id="delegate-notes"
                    className="input w-full"
                    placeholder="Add notes about this delegation..."
                    value={delegateNotes}
                    onChange={(e) => setDelegateNotes(e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowDelegateModal(false)}
                    disabled={delegating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={delegating || !delegateToId}
                  >
                    {delegating ? 'Processing...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;