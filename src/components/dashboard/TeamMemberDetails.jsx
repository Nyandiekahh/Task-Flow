import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const TeamMemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  // State for team member details
  const [teamMember, setTeamMember] = useState(null);
  const [tasks, setTasks] = useState({
    assigned: [],
    created: [],
    watched: [],
    approved: [],
    rejected: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stats state
  const [stats, setStats] = useState({
    totalAssigned: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    onTime: 0,
    completionRate: 0,
    averageDaysToComplete: 0
  });
  
  // Action states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  
  // Activity history
  const [activityHistory, setActivityHistory] = useState([]);
  
  // Filter states
  const [taskFilter, setTaskFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get team member details and related data
  useEffect(() => {
    const fetchTeamMemberData = async () => {
      if (!token || !id) return;
      
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Get team member details
        const memberResponse = await axios.get(`${API_URL}/team-members/${id}/`, { headers });
        setTeamMember(memberResponse.data);
        
        // Get tasks assigned to this team member
        const assignedTasksResponse = await axios.get(`${API_URL}/tasks/?assigned_to=${id}`, { headers });
        
        // Get tasks created by this team member's user
        let createdTasks = [];
        if (memberResponse.data.user) {
          const createdTasksResponse = await axios.get(`${API_URL}/tasks/?created_by=${memberResponse.data.user}`, { headers });
          createdTasks = createdTasksResponse.data;
        }
        
        // Calculate stats
        const assignedTasks = assignedTasksResponse.data;
        
        // Organize tasks by status
        const completedTasks = assignedTasks.filter(task => ['completed', 'approved'].includes(task.status));
        const inProgressTasks = assignedTasks.filter(task => task.status === 'in_progress');
        const pendingTasks = assignedTasks.filter(task => task.status === 'pending');
        
        // Calculate overdue tasks
        const now = new Date();
        const overdueTasks = assignedTasks.filter(task => 
          task.due_date && new Date(task.due_date) < now && 
          !['completed', 'approved'].includes(task.status)
        );
        
        // Calculate on-time completion
        const onTimeTasks = completedTasks.filter(task => 
          task.due_date && task.completed_at && 
          new Date(task.completed_at) <= new Date(task.due_date)
        );
        
        // Calculate average days to complete
        let totalDays = 0;
        let tasksWithData = 0;
        
        for (const task of completedTasks) {
          if (task.created_at && task.completed_at) {
            const createdDate = new Date(task.created_at);
            const completedDate = new Date(task.completed_at);
            const daysDiff = (completedDate - createdDate) / (1000 * 60 * 60 * 24);
            totalDays += daysDiff;
            tasksWithData++;
          }
        }
        
        // Update stats
        setStats({
          totalAssigned: assignedTasks.length,
          completed: completedTasks.length,
          inProgress: inProgressTasks.length,
          pending: pendingTasks.length,
          overdue: overdueTasks.length,
          onTime: onTimeTasks.length,
          completionRate: assignedTasks.length > 0 ? 
            (completedTasks.length / assignedTasks.length * 100).toFixed(1) : 0,
          averageDaysToComplete: tasksWithData > 0 ? 
            (totalDays / tasksWithData).toFixed(1) : 0
        });
        
        // Set tasks
        setTasks({
          assigned: assignedTasks,
          created: createdTasks,
          watched: [], // Would need an endpoint to get these
          approved: [], // Would need an endpoint to get these
          rejected: []  // Would need an endpoint to get these
        });
        
        // Get activity history
        // This would typically come from task history related to this user
        const historyItems = [];
        for (const task of [...assignedTasks, ...createdTasks]) {
          if (task.history) {
            for (const historyItem of task.history) {
              if (historyItem.actor === memberResponse.data.user) {
                historyItems.push({
                  ...historyItem,
                  task_id: task.id,
                  task_title: task.title
                });
              }
            }
          }
        }
        
        // Sort by timestamp
        historyItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivityHistory(historyItems);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching team member data:', err);
        setError('Failed to load team member data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamMemberData();
  }, [token, id]);
  
  // Handle suspending a team member
  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      setActionError('Please provide a reason for suspension');
      return;
    }
    
    setActionLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      // This is a hypothetical endpoint - you would need to implement it in your backend
      await axios.post(
        `${API_URL}/team-members/${id}/suspend/`,
        { reason: suspendReason },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setActionSuccess('Team member has been suspended');
      setShowSuspendModal(false);
      
      // Update local state
      setTeamMember(prev => ({
        ...prev,
        status: 'Suspended'
      }));
      
      // Reset after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error suspending team member:', err);
      setActionError('Failed to suspend team member. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle reassigning tasks
  const handleReassignTasks = async (newTeamMemberId) => {
    setActionLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      // Get all incomplete tasks assigned to this user
      const incompleteTasks = tasks.assigned.filter(
        task => !['completed', 'approved', 'rejected'].includes(task.status)
      );
      
      // Reassign each task
      for (const task of incompleteTasks) {
        await axios.post(
          `${API_URL}/tasks/${task.id}/delegate/`,
          { 
            team_member_id: newTeamMemberId,
            delegation_notes: `Reassigned from ${teamMember.name}`
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      setActionSuccess(`${incompleteTasks.length} tasks have been reassigned`);
      
      // Update local state - remove reassigned tasks
      setTasks(prev => ({
        ...prev,
        assigned: prev.assigned.filter(
          task => ['completed', 'approved', 'rejected'].includes(task.status)
        )
      }));
      
      // Reset after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error reassigning tasks:', err);
      setActionError('Failed to reassign some tasks. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Get status color
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
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString();
  };
  
  // Filter tasks based on current filters
  const getFilteredTasks = () => {
    let filteredTasks = [];
    
    // Filter by task type
    switch (taskFilter) {
      case 'assigned':
        filteredTasks = tasks.assigned;
        break;
      case 'created':
        filteredTasks = tasks.created;
        break;
      case 'watched':
        filteredTasks = tasks.watched;
        break;
      default:
        filteredTasks = [...tasks.assigned, ...tasks.created];
        break;
    }
    
    // Filter by time
    if (timeFilter !== 'all') {
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;
      
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.created_at);
        const diffTime = now - taskDate;
        
        switch (timeFilter) {
          case 'today':
            return diffTime < oneDay;
          case 'week':
            return diffTime < oneWeek;
          case 'month':
            return diffTime < oneMonth;
          default:
            return true;
        }
      });
    }
    
    return filteredTasks;
  };
  
  // Handle filter changes
  const handleTaskFilterChange = (e) => {
    setTaskFilter(e.target.value);
  };
  
  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };
  
  // Loading state
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
  
  // Error state
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
                  <Link to="/dashboard/team" className="text-sm font-medium text-red-700 hover:text-red-600">
                    Return to Team
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // No team member found
  if (!teamMember) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Team member not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The team member you're looking for doesn't exist or you don't have permission to view them.
            </p>
            <div className="mt-6">
              <Link to="/dashboard/team" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Return to Team
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
                <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-medium mr-4">
                  {teamMember.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{teamMember.name}</h1>
                  <p className="mt-1 text-sm text-gray-500 flex flex-wrap gap-3 items-center">
                    <span className="font-medium text-gray-900">{teamMember.title || 'No title'}</span>
                    <span className="text-gray-500">{teamMember.email}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => navigate(`/dashboard/team/edit/${id}`)}
              >
                Edit
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => setShowSuspendModal(true)}
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
        
        {/* Action notifications */}
        {actionSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{actionSuccess}</p>
              </div>
            </div>
          </div>
        )}
        
        {actionError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{actionError}</p>
                <button 
                  onClick={() => setActionError(null)}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`${
                activeTab === 'tasks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`${
                activeTab === 'activity'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`${
                activeTab === 'manage'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Manage
            </button>
          </nav>
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Performance stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Performance Overview</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-2xl font-bold text-indigo-600">{stats.totalAssigned}</div>
                    <div className="text-sm text-gray-500">Total Assigned Tasks</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-gray-500">Completed Tasks</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                    <div className="text-sm text-gray-500">In Progress Tasks</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
                    <div className="text-sm text-gray-500">Pending Tasks</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                    <div className="text-sm text-gray-500">Overdue Tasks</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</div>
                    <div className="text-sm text-gray-500">Completion Rate</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-2xl font-bold text-green-600">{stats.onTime}</div>
                    <div className="text-sm text-gray-500">On-Time Completions</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-2xl font-bold text-indigo-600">{stats.averageDaysToComplete}</div>
                    <div className="text-sm text-gray-500">Avg. Days to Complete</div>
                  </div>
                </div>
                
                {/* Completion progress bar */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-gray-700">Task Completion Rate</div>
                    <div className="text-sm font-medium text-gray-700">{stats.completionRate}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, stats.completionRate)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
              </div>
              <div className="p-6">
                {tasks.assigned.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks assigned yet</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {tasks.assigned.slice(0, 5).map(task => (
                      <li key={task.id} className="py-3">
                        <div className="flex justify-between">
                          <Link 
                            to={`/dashboard/tasks/${task.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            {task.title}
                          </Link>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>Due: {formatDate(task.due_date)}</span>
                          <span className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                
                {tasks.assigned.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View all {tasks.assigned.length} tasks
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Team member info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Team Member Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{teamMember.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-indigo-600">
                      <a href={`mailto:${teamMember.email}`}>{teamMember.email}</a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Title/Role</dt>
                    <dd className="mt-1 text-sm text-gray-900">{teamMember.title || 'No title set'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                    <dd className="mt-1 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Joined Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(teamMember.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Active</dt>
                    <dd className="mt-1 text-sm text-gray-900">Today</dd>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {activityHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No activity recorded yet</p>
                ) : (
                  <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                    {activityHistory.slice(0, 5).map((entry, index) => (
                      <li key={index} className="ml-6">
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
                          {entry.action === 'commented' && (
                            <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
                              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
                            </svg>
                          )}
                          {entry.action === 'completed' && (
                            <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                          )}
                        </span>
                        <h3 className="flex items-center text-sm font-semibold text-gray-900">
                          {entry.action.charAt(0).toUpperCase() + entry.action.slice(1).replace('_', ' ')}
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded">
                            {entry.task_title}
                          </span>
                        </h3>
                        <time className="block text-xs font-normal leading-none text-gray-500 mb-1">
                          {new Date(entry.timestamp).toLocaleString()}
                        </time>
                        <p className="text-sm font-normal text-gray-600">{entry.description}</p>
                      </li>
                    ))}
                  </ol>
                )}
                
                {activityHistory.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View all activity
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label htmlFor="task-filter" className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                  <select
                    id="task-filter"
                    className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={taskFilter}
                    onChange={handleTaskFilterChange}
                  >
                    <option value="all">All Tasks</option>
                    <option value="assigned">Assigned Tasks</option>
                    <option value="created">Created Tasks</option>
                    <option value="watched">Watched Tasks</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="time-filter" className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                  <select
                    id="time-filter"
                    className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={timeFilter}
                    onChange={handleTimeFilterChange}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Tasks list */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Tasks
                  {taskFilter !== 'all' && ` (${taskFilter})`}
                  {timeFilter !== 'all' && ` - ${timeFilter}`}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredTasks().length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          No tasks found
                        </td>
                      </tr>
                    ) : (
                      getFilteredTasks().map(task => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description || 'No description'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(task.due_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/dashboard/tasks/${task.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              View
                            </Link>
                            {!['completed', 'approved', 'rejected'].includes(task.status) && (
                              <Link to={`/dashboard/tasks/${task.id}/edit`} className="text-gray-600 hover:text-gray-900">
                                Edit
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Task stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Task Status Distribution</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Completed</span>
                        <span className="text-sm font-medium text-gray-700">
                          {stats.completed} of {stats.totalAssigned} ({stats.totalAssigned > 0 ? ((stats.completed / stats.totalAssigned) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${stats.totalAssigned > 0 ? (stats.completed / stats.totalAssigned) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">In Progress</span>
                        <span className="text-sm font-medium text-gray-700">
                          {stats.inProgress} of {stats.totalAssigned} ({stats.totalAssigned > 0 ? ((stats.inProgress / stats.totalAssigned) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${stats.totalAssigned > 0 ? (stats.inProgress / stats.totalAssigned) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Pending</span>
                        <span className="text-sm font-medium text-gray-700">
                          {stats.pending} of {stats.totalAssigned} ({stats.totalAssigned > 0 ? ((stats.pending / stats.totalAssigned) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: `${stats.totalAssigned > 0 ? (stats.pending / stats.totalAssigned) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Overdue</span>
                        <span className="text-sm font-medium text-gray-700">
                          {stats.overdue} of {stats.totalAssigned} ({stats.totalAssigned > 0 ? ((stats.overdue / stats.totalAssigned) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${stats.totalAssigned > 0 ? (stats.overdue / stats.totalAssigned) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Task Time Metrics</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Average Completion Time</h3>
                      <div className="flex items-center">
                        <div className="text-3xl font-bold text-indigo-600">{stats.averageDaysToComplete}</div>
                        <div className="ml-2 text-sm text-gray-500">days</div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Average time taken to complete tasks</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">On-Time Completion Rate</h3>
                      <div className="flex items-center">
                        <div className="text-3xl font-bold text-green-600">
                          {stats.completed > 0 ? ((stats.onTime / stats.completed) * 100).toFixed(0) : 0}%
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Percentage of tasks completed before the due date</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Current Workload</h3>
                      <div className="flex items-center">
                        <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
                        <div className="ml-2 text-sm text-gray-500">tasks in progress</div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Number of tasks currently being worked on</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Activity History</h2>
            </div>
            <div className="p-6">
              {activityHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activity recorded yet</p>
              ) : (
                <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                  {activityHistory.map((entry, index) => (
                    <li key={index} className="ml-6">
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
                        {entry.action === 'commented' && (
                          <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
                          </svg>
                        )}
                        {entry.action === 'completed' && (
                          <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        )}
                      </span>
                      <h3 className="flex items-center text-sm font-semibold text-gray-900">
                        {entry.action.charAt(0).toUpperCase() + entry.action.slice(1).replace('_', ' ')}
                        <Link 
                          to={`/dashboard/tasks/${entry.task_id}`}
                          className="bg-gray-100 text-indigo-600 hover:text-indigo-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded"
                        >
                          {entry.task_title}
                        </Link>
                      </h3>
                      <time className="block text-xs font-normal leading-none text-gray-500 mb-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </time>
                      <p className="text-sm font-normal text-gray-600">{entry.description}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
        
        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {/* Reassign tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Reassign Tasks</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Reassign all incomplete tasks from this team member to another member of your team.
                  This action will affect {tasks.assigned.filter(t => !['completed', 'approved', 'rejected'].includes(t.status)).length} tasks.
                </p>
                
                <div className="mt-4">
                  <label htmlFor="reassign-to" className="block text-sm font-medium text-gray-700 mb-2">
                    Reassign Tasks To:
                  </label>
                  <select
                    id="reassign-to"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm mb-4"
                  >
                    <option value="">Select a team member</option>
                    {/* This would be populated from API */}
                    <option value="1">John Doe</option>
                    <option value="2">Jane Smith</option>
                  </select>
                  
                  <button
                    type="button"
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => handleReassignTasks(1)} // Would use selected value from dropdown
                  >
                    Reassign Tasks
                  </button>
                </div>
              </div>
            </div>
            
            {/* Account actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Account Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Reset Password</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Send a password reset link to this team member's email address.
                    </p>
                    <button
                      type="button"
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Send Reset Link
                    </button>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Change Role</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Update this team member's role in the organization.
                    </p>
                    <div className="flex items-end space-x-4">
                      <div className="flex-grow">
                        <label htmlFor="new-role" className="block text-sm font-medium text-gray-700 mb-2">
                          New Role:
                        </label>
                        <select
                          id="new-role"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select a role</option>
                          {/* This would be populated from API */}
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="member">Member</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Update Role
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      These actions cannot be undone. Please be certain.
                    </p>
                    <div className="space-y-4">
                      <button
                        type="button"
                        className="inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => setShowSuspendModal(true)}
                      >
                        Suspend Account
                      </button>
                      <button
                        type="button"
                        className="ml-4 inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove from Team
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Suspend Modal */}
        {showSuspendModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Suspend Team Member</h3>
                <button 
                  onClick={() => setShowSuspendModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    You are about to suspend {teamMember.name}'s account. They will not be able to log in or access the system until their account is reactivated.
                  </p>
                  
                  <div className="mb-4">
                    <label htmlFor="suspend-reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Suspension (required)
                    </label>
                    <textarea
                      id="suspend-reason"
                      rows="3"
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
                      placeholder="Please provide a reason for suspension..."
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSuspendModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSuspend}
                    disabled={actionLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Suspend Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberDetails;