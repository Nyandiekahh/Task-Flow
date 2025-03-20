import React, { useState } from 'react';

const Team = () => {
  // Mock team members data
  const initialTeamMembers = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john.doe@example.com', 
      role: 'Admin',
      department: 'Management',
      avatar: 'JD',
      status: 'Active',
      joinedDate: '2024-10-10',
      tasksAssigned: 8,
      tasksCompleted: 5
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      email: 'sarah.johnson@example.com', 
      role: 'Manager',
      department: 'Marketing',
      avatar: 'SJ',
      status: 'Active',
      joinedDate: '2024-10-12',
      tasksAssigned: 12,
      tasksCompleted: 7
    },
    { 
      id: 3, 
      name: 'Michael Chen', 
      email: 'michael.chen@example.com', 
      role: 'Team Member',
      department: 'Development',
      avatar: 'MC',
      status: 'Active',
      joinedDate: '2024-11-01',
      tasksAssigned: 15,
      tasksCompleted: 10
    },
    { 
      id: 4, 
      name: 'Emily Rodriguez', 
      email: 'emily.rodriguez@example.com', 
      role: 'Reviewer',
      department: 'Product',
      avatar: 'ER',
      status: 'Active',
      joinedDate: '2024-11-05',
      tasksAssigned: 9,
      tasksCompleted: 8
    },
    { 
      id: 5, 
      name: 'Alex Kim', 
      email: 'alex.kim@example.com', 
      role: 'Team Member',
      department: 'Design',
      avatar: 'AK',
      status: 'Away',
      joinedDate: '2024-11-15',
      tasksAssigned: 7,
      tasksCompleted: 3
    },
    { 
      id: 6, 
      name: 'Lisa Wang', 
      email: 'lisa.wang@example.com', 
      role: 'Manager',
      department: 'Sales',
      avatar: 'LW',
      status: 'Inactive',
      joinedDate: '2024-12-01',
      tasksAssigned: 0,
      tasksCompleted: 0
    },
  ];
  
  // State for team members and filter/search
  const [teamMembers] = useState(initialTeamMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Extract unique roles and departments for filter dropdowns
  const roles = ['All', ...new Set(teamMembers.map(member => member.role))];
  const departments = ['All', ...new Set(teamMembers.map(member => member.department))];
  const statuses = ['All', 'Active', 'Away', 'Inactive'];
  
  // Filter team members based on filters and search
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || member.role === filterRole;
    const matchesDepartment = filterDepartment === 'All' || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'All' || member.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Away':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper function to get avatar background
  const getAvatarBackground = (initial) => {
    const colors = [
      'bg-primary-600',
      'bg-purple-600',
      'bg-green-600',
      'bg-yellow-600',
      'bg-red-600',
      'bg-blue-600',
    ];
    
    // Use a consistent color based on the initial
    const index = initial.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Team
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your team members and their roles.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button type="button" className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Team Member
            </button>
          </div>
        </div>
        
        {/* Filters and controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 border ${viewMode === 'grid' ? 'bg-primary-100 border-primary-200 text-primary-800' : 'border-gray-200 text-gray-600'} rounded-md flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 border ${viewMode === 'list' ? 'bg-primary-100 border-primary-200 text-primary-800' : 'border-gray-200 text-gray-600'} rounded-md flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                List
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select 
              className="input" 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
            >
              {roles.map((role, index) => (
                <option key={index} value={role}>{role} Roles</option>
              ))}
            </select>
            
            <select 
              className="input" 
              value={filterDepartment} 
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              {departments.map((department, index) => (
                <option key={index} value={department}>{department} Department</option>
              ))}
            </select>
            
            <select 
              className="input" 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statuses.map((status, index) => (
                <option key={index} value={status}>{status} Status</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Team members - Grid view */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`h-16 w-16 rounded-full ${getAvatarBackground(member.avatar[0])} flex items-center justify-center text-white text-xl font-medium`}>
                      {member.avatar}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                      <p className="text-sm text-gray-500">{member.department}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Email:</span>
                      <a href={`mailto:${member.email}`} className="text-primary-600 hover:text-primary-700">
                        {member.email}
                      </a>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Tasks:</span>
                      <span className="text-gray-900">
                        {member.tasksCompleted}/{member.tasksAssigned} completed
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Joined:</span>
                      <span className="text-gray-900">
                        {new Date(member.joinedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-between border-t border-gray-200">
                  <button className="text-sm text-gray-600 hover:text-gray-900">View Profile</button>
                  <button className="text-sm text-primary-600 hover:text-primary-700">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Team members - List view */}
        {viewMode === 'list' && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role / Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full ${getAvatarBackground(member.avatar[0])} flex items-center justify-center text-white text-sm font-medium`}>
                            {member.avatar}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.role}</div>
                        <div className="text-sm text-gray-500">{member.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.tasksCompleted}/{member.tasksAssigned} completed
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.joinedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-4">
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team members found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterRole !== 'All' || filterDepartment !== 'All' || filterStatus !== 'All' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first team member.'}
            </p>
            {!searchTerm && filterRole === 'All' && filterDepartment === 'All' && filterStatus === 'All' && (
              <div className="mt-6">
                <button type="button" className="btn btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Team Member
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Team stats */}
        {filteredMembers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team Statistics</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{teamMembers.length}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {teamMembers.filter(m => m.status === 'Active').length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {departments.length - 1}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Departments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {teamMembers.reduce((total, member) => total + member.tasksCompleted, 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Tasks Completed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;