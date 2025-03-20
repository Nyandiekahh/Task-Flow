import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DashboardHome = () => {
  const { currentUser } = useContext(AuthContext);
  
  // Placeholder data for dashboard
  const stats = [
    { id: 1, name: 'Total Tasks', value: '12', icon: (
      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
      </svg>
    ), bgColor: 'bg-primary-100', textColor: 'text-primary-600' },
    { id: 2, name: 'Completed', value: '7', icon: (
      <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ), bgColor: 'bg-success-100', textColor: 'text-success-600' },
    { id: 3, name: 'In Progress', value: '3', icon: (
      <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ), bgColor: 'bg-warning-100', textColor: 'text-warning-600' },
    { id: 4, name: 'Overdue', value: '2', icon: (
      <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ), bgColor: 'bg-danger-100', textColor: 'text-danger-600' },
  ];

  const recentTasks = [
    { id: 't1', title: 'Update website content', dueDate: '2025-03-25', status: 'In Progress', priority: 'High', assignee: 'You' },
    { id: 't2', title: 'Prepare quarterly report', dueDate: '2025-03-28', status: 'Not Started', priority: 'Medium', assignee: 'Sarah Johnson' },
    { id: 't3', title: 'Review marketing materials', dueDate: '2025-03-23', status: 'In Progress', priority: 'Low', assignee: 'Michael Chen' },
  ];

  const projects = [
    { id: 'p1', name: 'Website Redesign', progress: 65, tasks: 24, completedTasks: 16 },
    { id: 'p2', name: 'Marketing Campaign', progress: 40, tasks: 18, completedTasks: 7 },
    { id: 'p3', name: 'Product Launch', progress: 15, tasks: 32, completedTasks: 5 },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Welcome section */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {currentUser?.name || 'User'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your projects today.
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

        {/* Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className={`p-3 mr-4 ${stat.bgColor} rounded-full`}>
                {stat.icon}
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
              {recentTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Assigned to: {task.assignee} • Due: {task.dueDate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="mt-6 bg-primary-50 p-6 rounded-lg border border-primary-100">
          <h3 className="text-lg font-semibold text-primary-800 mb-2">Getting Started</h3>
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
              <Link to="/dashboard/team/invite" className="mt-auto text-sm text-primary-600 hover:text-primary-700 font-medium">
                Invite Members →
              </Link>
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
    </div>
  );
};

export default DashboardHome;