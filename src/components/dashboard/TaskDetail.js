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
  const [projects, setProjects] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [relatedTasks, setRelatedTasks] = useState({
    prerequisites: [],
    linked: [],
    dependent: []
  });
  
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
  
  // State for time tracking
  const [timeEntry, setTimeEntry] = useState({
    hours: 0,
    minutes: 0,
    description: ''
  });
  const [submittingTime, setSubmittingTime] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Format status display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Replace underscores with spaces and capitalize first letter of each word
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'on_hold':
        return 'bg-purple-100 text-purple-800';
      case 'review':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 font-medium';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Format the date as MM/DD/YYYY
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
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
        
        // Try to get projects and handle failure silently
        try {
          const projectsResponse = await axios.get(`${API_URL}/projects/`, { headers });
          setProjects(projectsResponse.data);
        } catch (projectErr) {
          console.error('Error fetching projects:', projectErr);
          // Not setting error since projects are optional
        }
        
        // Try to get attachments and handle failure silently
        try {
          const attachmentsResponse = await axios.get(`${API_URL}/tasks/${id}/attachments/`, { headers });
          setAttachments(attachmentsResponse.data);
        } catch (attachErr) {
          console.error('Error fetching attachments:', attachErr);
          // Use empty array if attachments endpoint fails
          setAttachments([]);
        }
        
        // Try to get related tasks and handle failure silently
        try {
          const relatedTasksResponse = await axios.get(`${API_URL}/tasks/${id}/related/`, { headers });
          setRelatedTasks({
            prerequisites: relatedTasksResponse.data.prerequisites || [],
            linked: relatedTasksResponse.data.linked || [],
            dependent: relatedTasksResponse.data.dependent || []
          });
        } catch (relatedErr) {
          console.error('Error fetching related tasks:', relatedErr);
          // Use empty arrays if related tasks endpoint fails
        }
        
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
  
  // Add time entry
  const handleAddTimeEntry = async (e) => {
    e.preventDefault();
    
    if (timeEntry.hours === 0 && timeEntry.minutes === 0) {
      alert('Please enter time spent on the task');
      return;
    }
    
    setSubmittingTime(true);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const totalHours = parseFloat(timeEntry.hours) + (parseFloat(timeEntry.minutes) / 60);
      
      await axios.post(
        `${API_URL}/tasks/${id}/add_time/`,
        {
          hours: totalHours.toFixed(2),
          description: timeEntry.description
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Reset form and close modal
      setTimeEntry({
        hours: 0,
        minutes: 0,
        description: ''
      });
      setShowTimeModal(false);
      
      // Refresh task details to show updated time spent
      const taskResponse = await axios.get(`${API_URL}/tasks/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTask(taskResponse.data);
      
      // Refresh history
      const historyResponse = await axios.get(`${API_URL}/history/?task_id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setHistory(historyResponse.data);
      
    } catch (err) {
      console.error('Error adding time entry:', err);
      alert('Failed to add time entry. Please try again.');
    } finally {
      setSubmittingTime(false);
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
  
  // Download attachment
  const handleDownloadAttachment = async (attachmentId, fileName) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const response = await axios.get(`${API_URL}/attachments/${attachmentId}/download/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Create a download link and click it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error('Error downloading attachment:', err);
      alert('Failed to download attachment. Please try again.');
    }
  };
  
  // Calculate time remaining until due date
  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} remaining`;
    }
  };
  
  // Get time remaining class
  const getTimeRemainingClass = (dueDate) => {
    if (!dueDate) return '';
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 font-medium';
    if (diffDays === 0) return 'text-orange-600 font-medium';
    if (diffDays <= 2) return 'text-orange-500';
    return 'text-gray-700';
  };
  
  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
              <Link to="/dashboard/tasks" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0 mb-4 sm:mb-0">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 mr-2">
                  {task.title}
                </h1>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                  {formatStatus(task.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 flex flex-wrap gap-3 items-center">
                <span>Created on {new Date(task.created_at).toLocaleDateString()}</span>
                {task.project && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    Project: {projects.find(p => p.id === task.project)?.name || task.project}
                  </span>
                )}
                {task.due_date && (
                  <span className={`text-sm ${getTimeRemainingClass(task.due_date)}`}>
                    {getTimeRemaining(task.due_date)}
                  </span>
                )}
              </p>
              {task.custom_tags && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {task.custom_tags.split(',').map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <Link 
                to={`/dashboard/tasks/${id}/edit`} 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit
              </Link>
              <button 
                onClick={handleDeleteTask}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <div className="prose max-w-none text-gray-900">
                    {task.description || 'No description provided'}
                  </div>
                </div>
                
                {/* Basic info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                      <span className={`capitalize ${getPriorityColor(task.priority)}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
                    <div className="space-y-1">
                      <p>
                        <span className="text-gray-600 text-xs">Start:</span> {formatDate(task.start_date)}
                      </p>
                      <p>
                        <span className="text-gray-600 text-xs">Due:</span> {formatDate(task.due_date)}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h3>
                    <div className="flex items-center">
                      {task.assigned_to ? (
                        <>
                          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium mr-2">
                            {task.assigned_to_name?.charAt(0) || '?'}
                          </div>
                          <span>{task.assigned_to_name}</span>
                          <button 
                            className="ml-2 text-indigo-600 hover:text-indigo-700 text-sm"
                            onClick={() => setShowDelegateModal(true)}
                          >
                            (Reassign)
                          </button>
                        </>
                      ) : (
                        <>
                          <span>Unassigned</span>
                          <button 
                            className="ml-2 text-indigo-600 hover:text-indigo-700 text-sm"
                            onClick={() => setShowDelegateModal(true)}
                          >
                            (Assign)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Visibility</h3>
                    <span className="capitalize">{task.visibility || 'Team'}</span>
                  </div>
                  
                  {task.estimated_hours && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Time</h3>
                      <span>{task.estimated_hours} hours</span>
                    </div>
                  )}
                  
                  {/* Time Tracking Information */}
                  {task.time_tracking_enabled && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Time Tracking</h3>
                      <div className="bg-gray-50 p-3 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Budget</p>
                          <p className="font-medium">{task.budget_hours || 'Not set'} hours</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Time Spent</p>
                          <p className="font-medium">{task.time_spent || '0'} hours</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Remaining</p>
                          <p className={`font-medium ${task.budget_hours && task.time_spent && task.budget_hours - task.time_spent < 0 ? 'text-red-500' : ''}`}>
                            {task.budget_hours ? (task.budget_hours - (task.time_spent || 0)).toFixed(1) : 'N/A'} hours
                          </p>
                        </div>
                      </div>
                      
                      {task.is_billable && (
                        <div className="mt-2 bg-green-50 p-3 rounded-md">
                          <p className="text-xs text-green-700 font-medium">Billable Task</p>
                          {task.client_reference && (
                            <p className="text-sm mt-1">Client Reference: {task.client_reference}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <button
                          onClick={() => setShowTimeModal(true)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Log Time
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Recurring Task Information */}
                  {task.is_recurring && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Recurring Task</h3>
                      <div className="bg-indigo-50 p-3 rounded-md">
                        <p className="text-sm">
                          Repeats: <span className="capitalize">{task.recurring_frequency || 'Weekly'}</span>
                        </p>
                        {task.recurring_ends_on && (
                          <p className="text-sm mt-1">
                            Until: {formatDate(task.recurring_ends_on)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Delegation Information */}
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
                  
                  {/* Rejection Reason */}
                  {task.rejected_by && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Rejection Reason</h3>
                      <div className="bg-red-50 p-3 rounded-md">
                        <p className="text-sm">
                          Rejected by <strong>{task.rejected_by_name}</strong> on {task.rejection_date ? new Date(task.rejection_date).toLocaleDateString() : 'Unknown date'}
                        </p>
                        <p className="text-sm mt-1">{task.rejection_reason || 'No reason provided'}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Acceptance Criteria */}
                {task.acceptance_criteria && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Acceptance Criteria</h3>
                    <div className="bg-gray-50 p-3 rounded-md prose-sm max-w-none">
                      {task.acceptance_criteria}
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                {task.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Collaborator Notes</h3>
                    <div className="bg-gray-50 p-3 rounded-md prose-sm max-w-none">
                      {task.notes}
                    </div>
                  </div>
                )}
                
                {/* Related Tasks */}
                {(relatedTasks.prerequisites.length > 0 || relatedTasks.linked.length > 0 || relatedTasks.dependent.length > 0) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Related Tasks</h3>
                    
                    {relatedTasks.prerequisites.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Prerequisites</h4>
                        <ul className="space-y-1 pl-5 list-disc">
                          {relatedTasks.prerequisites.map(task => (
                            <li key={task.id}>
                              <Link to={`/dashboard/tasks/${task.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                {task.title}
                              </Link>
                              <span className="text-xs text-gray-500 ml-2">({formatStatus(task.status)})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {relatedTasks.linked.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Linked Tasks</h4>
                        <ul className="space-y-1 pl-5 list-disc">
                          {relatedTasks.linked.map(task => (
                            <li key={task.id}>
                              <Link to={`/dashboard/tasks/${task.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                {task.title}
                              </Link>
                              <span className="text-xs text-gray-500 ml-2">({formatStatus(task.status)})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {relatedTasks.dependent.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Dependent Tasks</h4>
                        <ul className="space-y-1 pl-5 list-disc">
                          {relatedTasks.dependent.map(task => (
                            <li key={task.id}>
                              <Link to={`/dashboard/tasks/${task.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                {task.title}
                              </Link>
                              <span className="text-xs text-gray-500 ml-2">({formatStatus(task.status)})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
                </div>
                <div className="p-6">
                  <ul className="divide-y divide-gray-200">
                    {attachments.map(attachment => (
                      <li key={attachment.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-900">{attachment.filename}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : ''}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDownloadAttachment(attachment.id, attachment.filename)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Comments section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Comments</h2>
              </div>
              <div className="p-6">
                {/* Comment form */}
                <form onSubmit={handleAddComment} className="mb-6">
                  <textarea
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="3"
                    required
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium mr-2">
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mb-2"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={changingStatus}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="review">In Review</option>
                      {task.status === 'completed' && (
                        <>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </>
                      )}
                    </select>
                    
                    {newStatus === 'rejected' && task.status === 'completed' && (
                      <textarea
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mb-2"
                        placeholder="Reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="3"
                        required
                      ></textarea>
                    )}
                    
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Assign/Delegate Task
                  </button>
                </div>
                
                {/* Log Time action - shown only if time tracking is enabled */}
                {task.time_tracking_enabled && (
                  <div>
                    <button
                      onClick={() => setShowTimeModal(true)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Log Time
                    </button>
                  </div>
                )}
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
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-8 ring-white">
                        {entry.action === 'created' && (
                          <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                            <path d="M9 13h2v5a1 1 0 11-2 0v-5z"></path>
                          </svg>
                        )}
                        {entry.action === 'updated' && (
                          <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                          </svg>
                        )}
                        {(entry.action === 'status_changed' || entry.action === 'completed' || entry.action === 'approved' || entry.action === 'rejected') && (
                          <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path>
                          </svg>
                        )}
                        {entry.action === 'assigned' && (
                          <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                          </svg>
                        )}
                        {entry.action === 'commented' && (
                          <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
                          </svg>
                        )}
                        {entry.action === 'time_logged' && (
                          <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path>
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Add notes about this delegation..."
                    value={delegateNotes}
                    onChange={(e) => setDelegateNotes(e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowDelegateModal(false)}
                    disabled={delegating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={delegating || !delegateToId}
                  >
                    {delegating ? 'Processing...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Time Logging Modal */}
        {showTimeModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Log Time</h3>
                <button 
                  onClick={() => setShowTimeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddTimeEntry} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Spent
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="time-hours" className="block text-xs text-gray-500 mb-1">Hours</label>
                      <input
                        type="number"
                        id="time-hours"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        min="0"
                        step="1"
                        value={timeEntry.hours}
                        onChange={(e) => setTimeEntry({ ...timeEntry, hours: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="time-minutes" className="block text-xs text-gray-500 mb-1">Minutes</label>
                      <input
                        type="number"
                        id="time-minutes"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        min="0"
                        max="59"
                        step="5"
                        value={timeEntry.minutes}
                        onChange={(e) => setTimeEntry({ ...timeEntry, minutes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="time-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="time-description"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="What did you work on?"
                    value={timeEntry.description}
                    onChange={(e) => setTimeEntry({ ...timeEntry, description: e.target.value })}
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowTimeModal(false)}
                    disabled={submittingTime}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={submittingTime || (timeEntry.hours === 0 && timeEntry.minutes === 0)}
                  >
                    {submittingTime ? 'Logging...' : 'Log Time'}
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