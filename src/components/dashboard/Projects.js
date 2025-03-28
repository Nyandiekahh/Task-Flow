import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Projects = () => {
  // Sample projects data
  const initialProjects = [
    { 
      id: 'p1', 
      name: 'Website Redesign', 
      description: 'Redesign the company website with modern UI/UX principles',
      progress: 65, 
      tasks: 24, 
      completedTasks: 16,
      status: 'In Progress',
      dueDate: '2025-05-15',
    },
    { 
      id: 'p2', 
      name: 'Marketing Campaign', 
      description: 'Q2 marketing campaign for product launch',
      progress: 40, 
      tasks: 18, 
      completedTasks: 7,
      status: 'In Progress',
      dueDate: '2025-04-30',
    },
    { 
      id: 'p3', 
      name: 'Product Launch', 
      description: 'Prepare and execute the launch of our new product',
      progress: 15, 
      tasks: 32, 
      completedTasks: 5,
      status: 'In Progress',
      dueDate: '2025-06-20',
    },
  ];

  const [projects] = useState(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track all your team's projects.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link to="/dashboard/projects/new">
              <button type="button" className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Project
              </button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Project cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{project.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    <span className="font-medium text-gray-900">{project.completedTasks}</span>
                    /{project.tasks} tasks
                  </span>
                  <span className="text-gray-500">
                    Due: <span className="font-medium text-gray-900">{project.dueDate}</span>
                  </span>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <Link 
                  to={`/dashboard/projects/${project.id}`} 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;