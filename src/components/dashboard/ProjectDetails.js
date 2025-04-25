import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProjectDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTasksModal, setShowAddTasksModal] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTasksToAdd, setSelectedTasksToAdd] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    progress: 0
  });
  
  // Fetch project details
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        const authToken = token || localStorage.getItem('token');
        
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        };
        
        // Get project details
        const projectResponse = await axios.get(`${API_URL}/projects/${id}/`, { headers });
        setProject(projectResponse.data);
        
        // Get team members for this project
        try {
          const membersResponse = await axios.get(`${API_URL}/projects/${id}/team-members/`, { headers });
          setTeamMembers(membersResponse.data);
        } catch (memberErr) {
          console.error('Error fetching team members:', memberErr);
          // Continue even if team members fetch fails
        }
        
        // Get tasks for this project - using the by-project endpoint
        try {
          const tasksResponse = await axios.get(`${API_URL}/tasks/by-project/${id}/`, { headers });
          setTasks(tasksResponse.data);
          
          // Calculate stats
          const total = tasksResponse.data.length;
          const completed = tasksResponse.data.filter(task => task.status === 'completed' || task.status === 'approved').length;
          const inProgress = tasksResponse.data.filter(task => task.status === 'in_progress').length;
          const pending = tasksResponse.data.filter(task => task.status === 'pending').length;
          
          setStats({
            totalTasks: total,
            completedTasks: completed,
            inProgressTasks: inProgress,
            pendingTasks: pending,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0
          });
        } catch (tasksErr) {
          console.error('Error fetching tasks:', tasksErr);
          // Continue even if tasks fetch fails
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && id) {
      fetchProjectData();
    }
  }, [token, id]);
  
  // Fetch available tasks that are not assigned to any project when modal opens
  const fetchAvailableTasks = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const authToken = token || localStorage.getItem('token');
      
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };
      
      // Get tasks with no project
      const response = await axios.get(`${API_URL}/tasks/?project=none`, { headers });
      setAvailableTasks(response.data);
    } catch (err) {
      console.error('Error fetching available tasks:', err);
      toast.error('Could not load available tasks');
    }
  };
  
  // Handle adding tasks to project
  const handleAddTasksToProject = async () => {
    if (selectedTasksToAdd.length === 0) {
      toast.warning('Please select at least one task to add');
      return;
    }
    
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const authToken = token || localStorage.getItem('token');
      
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };
      
      // Add each selected task to this project
      const addPromises = selectedTasksToAdd.map(taskId => 
        axios.post(`${API_URL}/tasks/${taskId}/assign_to_project/`, 
          { project_id: id },
          { headers }
        )
      );
      
      await Promise.all(addPromises);
      
      // Refresh project tasks
      const tasksResponse = await axios.get(`${API_URL}/tasks/by-project/${id}/`, { headers });
      setTasks(tasksResponse.data);
      
      // Update stats
      const total = tasksResponse.data.length;
      const completed = tasksResponse.data.filter(task => task.status === 'completed' || task.status === 'approved').length;
      const inProgress = tasksResponse.data.filter(task => task.status === 'in_progress').length;
      const pending = tasksResponse.data.filter(task => task.status === 'pending').length;
      
      setStats({
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        pendingTasks: pending,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0
      });
      
      toast.success(`${selectedTasksToAdd.length} task(s) added to project`);
      
      // Close modal and reset selections
      setShowAddTasksModal(false);
      setSelectedTasksToAdd([]);
      
    } catch (err) {
      console.error('Error adding tasks to project:', err);
      toast.error('Failed to add tasks to project');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle removing a task from the project
  const handleRemoveFromProject = async (taskId) => {
    if (!window.confirm('Are you sure you want to remove this task from the project?')) {
      return;
    }
    
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const authToken = token || localStorage.getItem('token');
      
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };
      
      await axios.post(`${API_URL}/tasks/${taskId}/remove_from_project/`, {}, { headers });
      
      // Remove the task from state
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Update stats
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      const total = updatedTasks.length;
      const completed = updatedTasks.filter(task => task.status === 'completed' || task.status === 'approved').length;
      const inProgress = updatedTasks.filter(task => task.status === 'in_progress').length;
      const pending = updatedTasks.filter(task => task.status === 'pending').length;
      
      setStats({
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        pendingTasks: pending,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0
      });
      
      toast.success('Task removed from project');
      
    } catch (err) {
      console.error('Error removing task from project:', err);
      toast.error('Failed to remove task from project');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle task selection in the modal
  const handleTaskSelection = (taskId) => {
    setSelectedTasksToAdd(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format status text
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Handle delete project
  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const authToken = token || localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/projects/${id}/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      // Redirect to projects list
      navigate('/dashboard/projects');
      
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
      setLoading(false);
    }
  };
  
  if (loading && !project) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !project) {
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
                  <Link
                    to="/dashboard/projects"
                    className="text-sm font-medium text-red-700 hover:text-red-600"
                  >
                    Return to Projects List
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The project you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard/projects"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Projects List
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
        <div className="lg:flex lg:items-center lg:justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {project.name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center">
              <div className="flex items-center text-sm text-gray-500 mr-6">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)} mr-2`}>
                  {formatStatus(project.status)}
                </span>
                {project.priority && (
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                  </span>
                )}
              </div>
              
              <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>
                  {project.start_date ? formatDate(project.start_date) : 'Start date not set'} 
                  {project.end_date ? ` - ${formatDate(project.end_date)}` : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <span className="hidden sm:block mr-2">
              <Link
                to={`/dashboard/projects/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </Link>
            </span>
            
            <span className="sm:ml-2">
              <Link
                to={`/dashboard/tasks/new?project=${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Task
              </Link>
            </span>
            
            <span className="ml-2">
              <button
                type="button"
                onClick={handleDeleteProject}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            </span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          {/* Total Tasks */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.totalTasks}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          {/* Completed Tasks */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Tasks</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.completedTasks}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          {/* In Progress Tasks */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.inProgressTasks}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pending Tasks */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.pendingTasks}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content - 2 column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Project details & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project details */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Project Details</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Overview and details about this project.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{project.description || 'No description provided'}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                        {formatStatus(project.status)}
                      </span>
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Priority</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.priority && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </span>
                      )}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{project.start_date ? formatDate(project.start_date) : 'Not set'}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{project.end_date ? formatDate(project.end_date) : 'Not set'}</dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Progress</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${stats.progress}%` }}
                          ></div>
                        </div>
                        <span>{stats.progress}%</span>
                      </div>
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Organization</dt>
                    <dd className="mt-1 text-sm text-gray-900">{project.organization_name || 'Unknown'}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Tasks list */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Tasks</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Tasks associated with this project.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      fetchAvailableTasks();
                      setShowAddTasksModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Add Existing Tasks
                  </button>
                  <Link 
                    to={`/dashboard/tasks/new?project=${id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create New Task
                  </Link>
                </div>
              </div>
              
              {tasks.length === 0 ? (
                <div className="text-center py-8 px-4 sm:px-6">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new task or adding existing tasks to this project.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => {
                        fetchAvailableTasks();
                        setShowAddTasksModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      Add Existing Tasks
                    </button>
                    <Link
                      to={`/dashboard/tasks/new?project=${id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create New Task
                    </Link>
                  </div>
                </div>
              ) : (
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
                          Assignee
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              <Link to={`/dashboard/tasks/${task.id}`} className="hover:text-indigo-600">
                                {task.title}
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                              {formatStatus(task.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.assigned_to_name || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.due_date ? formatDate(task.due_date) : 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link to={`/dashboard/tasks/${task.id}`} className="text-indigo-600 hover:text-indigo-900">
                                View
                              </Link>
                              <Link to={`/dashboard/tasks/${task.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                                Edit
                              </Link>
                              <button
                                onClick={() => handleRemoveFromProject(task.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Team members & Timeline */}
          <div className="space-y-6">
            {/* Team members */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Team Members</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    People assigned to this project.
                  </p>
                </div>
                <button 
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => navigate(`/dashboard/projects/${id}/edit`)}
                >
                  Manage Team
                </button>
              </div>
              <div className="border-t border-gray-200">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-6 px-4">
                    <p className="text-sm text-gray-500">No team members assigned to this project yet.</p>
                    <button
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => navigate(`/dashboard/projects/${id}/edit`)}
                  >
                    Add Members
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {teamMembers.map((member) => (
                    <li key={member.id} className="px-4 py-3 sm:px-6 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        {member.title && <div className="text-xs text-gray-500">{member.title}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Project Timeline */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Timeline</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Project timeframe and milestones.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="space-y-4">
                {/* Timeline visualization */}
                <div className="relative">
                  {/* Timeline bar */}
                  <div className="h-2 bg-gray-200 rounded-full mb-6">
                    {project.start_date && project.end_date && (
                      <div 
                        className="h-2 bg-indigo-600 rounded-full" 
                        style={{ 
                          width: `${calculateTimelineProgress(project.start_date, project.end_date)}%` 
                        }}
                      ></div>
                    )}
                  </div>
                  
                  {/* Start date marker */}
                  {project.start_date && (
                    <div className="absolute -top-1 -ml-1">
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-4 bg-indigo-600 rounded-full"></div>
                        <div className="mt-1 text-xs text-gray-500">Start</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Current date marker */}
                  {project.start_date && project.end_date && (
                    <div 
                      className="absolute -top-1 -ml-1"
                      style={{ 
                        left: `${calculateCurrentDatePosition(project.start_date, project.end_date)}%` 
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                        <div className="mt-1 text-xs text-gray-500">Today</div>
                      </div>
                    </div>
                  )}
                  
                  {/* End date marker */}
                  {project.end_date && (
                    <div className="absolute -top-1 right-0 -mr-1">
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                        <div className="mt-1 text-xs text-gray-500">End</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Timeline details */}
                <div className="grid grid-cols-2 gap-4 text-center mt-6">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Start Date</div>
                    <div className="text-sm font-medium text-gray-900">
                      {project.start_date ? formatDate(project.start_date) : 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">End Date</div>
                    <div className="text-sm font-medium text-gray-900">
                      {project.end_date ? formatDate(project.end_date) : 'Not set'}
                    </div>
                  </div>
                </div>
                
                {/* Days remaining calculation */}
                {project.end_date && (
                  <div className="text-center mt-4">
                    <div className="text-sm font-medium text-gray-500">Time Remaining</div>
                    <div className="text-lg font-medium text-gray-900">
                      {calculateDaysRemaining(project.end_date)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Add Tasks Modal */}
    {showAddTasksModal && (
      <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddTasksModal(false)}></div>
        
        <div className="relative bg-white rounded-lg max-w-3xl w-full mx-4 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Add Existing Tasks to Project</h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setShowAddTasksModal(false)}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : availableTasks.length === 0 ? (
              <div className="text-center py-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No available tasks</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no unassigned tasks available to add to this project.
                </p>
                <div className="mt-6">
                  <Link
                    to={`/dashboard/tasks/new?project=${id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowAddTasksModal(false)}
                  >
                    Create New Task
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-sm text-gray-600">
                  Select the tasks you want to add to this project:
                </p>
                <div className="grid gap-2">
                  {availableTasks.map(task => (
                    <div
                      key={task.id}
                      className={`p-3 border rounded-md cursor-pointer ${
                        selectedTasksToAdd.includes(task.id) 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleTaskSelection(task.id)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500 truncate">
                            {task.description ? `${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}` : 'No description'}
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                            {formatStatus(task.status)}
                          </span>
                          {task.priority && (
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-2 border-t">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowAddTasksModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleAddTasksToProject}
              disabled={selectedTasksToAdd.length === 0 || loading}
            >
              {loading ? 'Adding...' : 'Add Selected Tasks'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

// Calculate timeline progress (percentage)
function calculateTimelineProgress(startDate, endDate) {
if (!startDate || !endDate) return 0;

const start = new Date(startDate);
const end = new Date(endDate);
const today = new Date();

// If project hasn't started yet
if (today < start) return 0;

// If project is past end date
if (today > end) return 100;

// Calculate progress percentage
const totalDuration = end - start;
const elapsedDuration = today - start;

return Math.round((elapsedDuration / totalDuration) * 100);
}

// Calculate current date position on timeline (percentage)
function calculateCurrentDatePosition(startDate, endDate) {
if (!startDate || !endDate) return 0;

const start = new Date(startDate);
const end = new Date(endDate);
const today = new Date();

// If project hasn't started yet
if (today < start) return 0;

// If project is past end date
if (today > end) return 100;

// Calculate current position percentage
const totalDuration = end - start;
const elapsedDuration = today - start;

return Math.round((elapsedDuration / totalDuration) * 100);
}

// Calculate days remaining
function calculateDaysRemaining(endDate) {
if (!endDate) return 'No end date set';

const end = new Date(endDate);
const today = new Date();

// Set to beginning of day for accurate comparison
today.setHours(0, 0, 0, 0);
end.setHours(0, 0, 0, 0);

const diffTime = end - today;
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

if (diffDays < 0) {
  return `${Math.abs(diffDays)} days overdue`;
} else if (diffDays === 0) {
  return 'Due today';
} else if (diffDays === 1) {
  return '1 day remaining';
} else {
  return `${diffDays} days remaining`;
}
}

export default ProjectDetails;