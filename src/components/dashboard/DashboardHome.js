import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { organizationAPI, taskAPI } from '../../services/api';
import axios from 'axios';

const DashboardHome = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organization, setOrganization] = useState(null);
  
  // State for dashboard data
  const [stats, setStats] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  // Team invite modal state - Added from Team component
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [titles, setTitles] = useState([]);
  const [titlesLoading, setTitlesLoading] = useState(false);
  
  // Team members form state for invites
  const [invites, setInvites] = useState([
    { email: '', role: 'admin', name: '' }
  ]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Good morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good evening";
    } else {
      return "Good night";
    }
  };

  // Encouragement messages from API or configuration
  const [encouragements, setEncouragements] = useState([
    "Here's what's happening with your projects today."
  ]);

  // Get random encouragement
  const getRandomEncouragement = () => {
    if (encouragements.length === 0) return "";
    const randomIndex = Math.floor(Math.random() * encouragements.length);
    return encouragements[randomIndex];
  };

  // Icons for stats
  const renderIcon = (iconName) => {
    switch(iconName) {
      case 'task':
        return (
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        );
      case 'check':
        return (
          <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'alert':
        return (
          <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch organization data
        try {
          const orgData = await organizationAPI.getOrganization();
          setOrganization(orgData);
        } catch (orgError) {
          console.error("Error fetching organization:", orgError);
        }
        
        // Fetch encouragements if you have an API endpoint for them
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
          const token = localStorage.getItem('token');
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
          
          // Uncomment this if you add an encouragements endpoint
          // const encouragementsResponse = await axios.get(`${API_URL}/encouragements/`, { headers });
          // setEncouragements(encouragementsResponse.data);
        } catch (encError) {
          console.error("Error fetching encouragements:", encError);
          // Fallback to default encouragements
        }
        
        // Fetch titles for the invite form - Added from Team component
        try {
          setTitlesLoading(true);
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
          const token = localStorage.getItem('token');
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
          
          const titlesResponse = await axios.get(`${API_URL}/titles/`, { headers });
          setTitles(titlesResponse.data);
          
          // Update default role selection in forms if titles exist
          if (titlesResponse.data.length > 0) {
            setInvites(invites.map(invite => ({
              ...invite,
              role: titlesResponse.data[0].id
            })));
          }
        } catch (titlesError) {
          console.error("Failed to load titles:", titlesError);
        } finally {
          setTitlesLoading(false);
        }
        
        // Fetch task data
        try {
          const tasksData = await taskAPI.getTasks();
          
          // Set recent tasks (latest 3)
          const sortedTasks = [...tasksData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecentTasks(sortedTasks.slice(0, 3));
          
          // Calculate stats
          const totalTasks = tasksData.length;
          const completedTasks = tasksData.filter(task => task.status === 'completed' || task.status === 'approved').length;
          const inProgressTasks = tasksData.filter(task => task.status === 'in_progress').length;
          
          // Calculate overdue tasks
          const today = new Date();
          const overdueTasks = tasksData.filter(task => {
            if (!task.due_date) return false;
            const dueDate = new Date(task.due_date);
            return dueDate < today && task.status !== 'completed' && task.status !== 'approved';
          }).length;
          
          setStats([
            { id: 1, name: 'Total Tasks', value: totalTasks.toString(), icon: 'task', bgColor: 'bg-primary-100', textColor: 'text-primary-600' },
            { id: 2, name: 'Completed', value: completedTasks.toString(), icon: 'check', bgColor: 'bg-success-100', textColor: 'text-success-600' },
            { id: 3, name: 'In Progress', value: inProgressTasks.toString(), icon: 'clock', bgColor: 'bg-warning-100', textColor: 'text-warning-600' },
            { id: 4, name: 'Overdue', value: overdueTasks.toString(), icon: 'alert', bgColor: 'bg-danger-100', textColor: 'text-danger-600' },
          ]);
        } catch (taskError) {
          console.error("Error fetching tasks:", taskError);
          setError("Failed to load task data.");
        }
        
        // Fetch projects data
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
          const token = localStorage.getItem('token');
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
          
          const projectsResponse = await axios.get(`${API_URL}/projects/`, { headers });
          
          // Map projects to include progress percentages
          const projectsWithProgress = projectsResponse.data.map(project => {
            // Calculate progress if not provided by the API
            const totalTasks = project.total_tasks || 0;
            const completedTasks = project.completed_tasks || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return {
              ...project,
              progress: progress,
              tasks: totalTasks,
              completedTasks: completedTasks
            };
          });
          
          setProjects(projectsWithProgress);
        } catch (projectError) {
          console.error("Error fetching projects:", projectError);
          // Don't set error here to allow partial dashboard to load
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("There was a problem loading your dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
    }
  }, []);

  // Add invite field - From Team component
  const addInviteField = () => {
    // Use the first title ID if available, otherwise use 'admin'
    const defaultRole = titles.length > 0 ? titles[0].id : 'admin';
    setInvites([...invites, { email: '', role: defaultRole, name: '' }]);
  };

  // Remove an invite field - From Team component
  const removeInviteField = (index) => {
    const updatedInvites = [...invites];
    updatedInvites.splice(index, 1);
    setInvites(updatedInvites);
  };

  // Handle input changes for invite form - From Team component
  const handleInviteInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedInvites = [...invites];
    updatedInvites[index] = {
      ...updatedInvites[index],
      [name]: value
    };
    setInvites(updatedInvites);
  };

  // Handle invite form submission - From Team component
  // Handle invite form submission with the correct endpoint
const handleInviteSubmit = async (e) => {
  e.preventDefault();
  
  // Validate emails
  const isValid = invites.every(invite => {
    if (!invite.email.trim()) return false;
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(invite.email);
  });
  
  if (!isValid) {
    setInviteError("Please enter valid email addresses for all team members.");
    return;
  }
  
  try {
    setInviteLoading(true);
    setInviteError(null);
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
    const token = localStorage.getItem('token');
    
    console.log('Using token:', token ? 'Token exists' : 'No token found');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Filter out any empty invites
    const validInvites = invites.filter(invite => invite.email.trim() !== '');
    console.log('Sending invites:', validInvites);
    
    // CORRECT ENDPOINT: /api/v1/auth/invite/ instead of /api/v1/accounts/invite/
    const result = await axios.post(
      `${API_URL}/auth/invite/`, 
      { invitations: validInvites },
      { headers }
    );
    
    console.log('Invite response:', result);
    
    setInviteSuccess(true);
    // Clear form after successful submission
    setInvites([{ email: '', role: titles.length > 0 ? titles[0].id : 'admin', name: '' }]);
    
    // Refresh team members list after successful invite
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (err) {
    console.error("Full error object:", err);
    console.error("Error response data:", err.response?.data);
    console.error("Error status:", err.response?.status);
    setInviteError(`Failed to send invites: ${err.response?.data?.detail || err.message}`);
  } finally {
    setInviteLoading(false);
  }
};

  // Get role options for select - From Team component
  const getRoleOptions = () => {
    // If we have loaded titles, use those
    if (titles && titles.length > 0) {
      return titles.map(title => (
        <option key={title.id} value={title.id}>
          {title.name}
        </option>
      ));
    }
    
    // Otherwise, just use Admin as default
    return [
      <option key="admin" value="admin">Admin</option>
    ];
  };

  // Handle loading state
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

  // Get user's first name for greeting
  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const greeting = getGreeting();
  const encouragement = getRandomEncouragement();
  const orgName = organization?.name || 'your workspace';

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Welcome section with dynamic greeting */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {encouragement}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link to="/dashboard/tasks/new">
              <button type="button" className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Task
              </button>
            </Link>
          </div>
        </div>

        {/* Display error if any */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className={`p-3 mr-4 ${stat.bgColor} rounded-full`}>
                {renderIcon(stat.icon)}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two column layout for projects and tasks */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Projects */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Projects</h2>
              <Link to="/dashboard/projects" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="p-4">
              {projects.length > 0 ? (
                <ul className="space-y-4">
                  {projects.map((project) => (
                    <li key={project.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                        <span className="text-xs font-medium text-gray-500">
                          {project.completedTasks} / {project.tasks} tasks
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 text-right">
                        {project.progress}% complete
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No projects yet</p>
                  <Link to="/dashboard/projects/new" className="btn btn-sm btn-primary">
                    Create Project
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
              <Link to="/dashboard/tasks" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned to: {task.assigned_to_name || 'Unassigned'} • Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.status === 'completed' || task.status === 'approved' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'in_progress' ? 'In Progress' : 
                          task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No tasks yet</p>
                  <Link to="/dashboard/tasks/new" className="btn btn-sm btn-primary">
                    Create Task
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="mt-6 bg-primary-50 p-6 rounded-lg border border-primary-100">
          <h3 className="text-lg font-semibold text-primary-800 mb-2">Getting Started with {orgName}</h3>
          <p className="text-primary-700 mb-4">Here are some quick actions to get you started with TaskFlow:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-primary-200 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 mb-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              <h4 className="font-medium text-gray-900">Create a Project</h4>
              <p className="text-gray-600 text-sm mt-1 mb-3">Set up your first project to organize your tasks.</p>
              <Link to="/dashboard/projects/new" className="mt-auto text-sm text-primary-600 hover:text-primary-700 font-medium">
                New Project →
              </Link>
            </div>
            <div className="bg-white p-4 rounded-lg border border-primary-200 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 mb-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <h4 className="font-medium text-gray-900">Invite Your Team</h4>
              <p className="text-gray-600 text-sm mt-1 mb-3">Add team members to collaborate on tasks.</p>
              {/* Changed from Link to button to trigger the modal */}
              <button 
                onClick={() => setInviteModalOpen(true)} 
                className="mt-auto text-sm text-primary-600 hover:text-primary-700 font-medium">
                Invite Members →
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg border border-primary-200 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 mb-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <h4 className="font-medium text-gray-900">Customize Settings</h4>
              <p className="text-gray-600 text-sm mt-1 mb-3">Personalize your workspace and preferences.</p>
              <Link to="/dashboard/settings" className="mt-auto text-sm text-primary-600 hover:text-primary-700 font-medium">
                Settings →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Team Invite Modal - Added from Team component */}
      {inviteModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full m-4 max-h-90vh overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Invite Team Members</h3>
                <button 
                  type="button" 
                  onClick={() => {
                    setInviteModalOpen(false);
                    setInviteSuccess(false);
                    setInviteError(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {inviteError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{inviteError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {inviteSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">Invitations sent successfully! Refreshing page...</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Title Management Section - Only show if titles are available */}
              {titles.length > 0 && (
                <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available Team Titles</h4>
                  <div className="flex flex-wrap gap-2">
                    {titles.map((title) => (
                      <div 
                        key={title.id} 
                        className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs"
                      >
                        {title.name}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Team members will be assigned one of these titles. You can manage titles in organization settings.
                  </div>
                </div>
              )}
              
              <form onSubmit={handleInviteSubmit}>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Invite colleagues to join your organization. They will receive an email with instructions to set up their account.
                  </p>
                  
                  {invites.map((invite, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Team Member {index + 1}</h4>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeInviteField(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Name Field */}
                        <div>
                          <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700">Name (Optional)</label>
                          <input
                            type="text"
                            name="name"
                            id={`name-${index}`}
                            value={invite.name}
                            onChange={(e) => handleInviteInputChange(index, e)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        {/* Email Field */}
                        <div>
                          <label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            id={`email-${index}`}
                            required
                            value={invite.email}
                            onChange={(e) => handleInviteInputChange(index, e)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        {/* Role Field */}
                        <div>
                          <label htmlFor={`role-${index}`} className="block text-sm font-medium text-gray-700">
                            {titles && titles.length > 0 ? 'Title' : 'Role'}
                          </label>
                          <select
                            id={`role-${index}`}
                            name="role"
                            value={invite.role}
                            onChange={(e) => handleInviteInputChange(index, e)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            {titlesLoading ? (
                              <option value="">Loading...</option>
                            ) : (
                              getRoleOptions()
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addInviteField}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Another
                  </button>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {inviteLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Invitations'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;