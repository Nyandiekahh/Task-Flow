import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const OrganizationDashboard = () => {
  const { token, currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Organization data states
  const [organization, setOrganization] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [titles, setTitles] = useState([]);
  const [roleStats, setRoleStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stats for overview
  const [orgStats, setOrgStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvitations: 0,
    departmentsCount: 0
  });

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setLoading(true);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Get organization data
        const orgResponse = await axios.get(`${API_URL}/organizations/`, { headers });
        setOrganization(orgResponse.data);
        
        // Get team members
        const membersResponse = await axios.get(`${API_URL}/team-members/`, { headers });
        setTeamMembers(membersResponse.data);
        
        // Get titles
        const titlesResponse = await axios.get(`${API_URL}/titles/`, { headers });
        setTitles(titlesResponse.data);
        
        // Get roles from the API
        try {
          const rolesResponse = await axios.get(`${API_URL}/roles/`, { headers });
          
          // Count team members by role
          const roleCountMap = {};
          membersResponse.data.forEach(member => {
            if (member.role) {
              roleCountMap[member.role] = (roleCountMap[member.role] || 0) + 1;
            }
          });
          
          setRoleStats(roleCountMap);
        } catch (rolesError) {
          console.error("Failed to load roles data:", rolesError);
        }
        
        // Calculate organization stats
        const totalMembers = membersResponse.data.length;
        const activeMembers = membersResponse.data.filter(member => member.user).length;
        const pendingMembers = totalMembers - activeMembers;
        const uniqueTitles = new Set(membersResponse.data.map(member => member.title).filter(Boolean)).size;
        
        setOrgStats({
          totalMembers,
          activeMembers,
          pendingInvitations: pendingMembers,
          departmentsCount: uniqueTitles
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching organization data:', err);
        setError('Failed to load organization data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchOrganizationData();
    }
  }, [token]);

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get avatar letters from name
  const getAvatarLetters = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  // Get background color for avatar based on name
  const getAvatarBackground = (name) => {
    if (!name) return 'bg-gray-400';
    
    const colors = [
      'bg-primary-600',
      'bg-purple-600',
      'bg-green-600',
      'bg-yellow-600',
      'bg-red-600',
      'bg-blue-600',
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content when data is loaded */}
        {!loading && !error && organization && (
          <>
            {/* Organization Header */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {organization.logo ? (
                        <img className="h-16 w-16 rounded-full" src={organization.logo} alt={organization.name} />
                      ) : (
                        <div className="h-16 w-16 bg-primary-100 text-primary-600 flex items-center justify-center rounded-full text-xl font-bold">
                          {organization?.name ? organization.name.substring(0, 2).toUpperCase() : 'OR'}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 mr-3">
                          <span className="font-medium text-gray-900">Industry:</span> {organization.industry || 'Not specified'}
                        </span>
                        <span className="text-sm text-gray-500 mr-3">
                          <span className="font-medium text-gray-900">Size:</span> {organization.size || 'Not specified'}
                        </span>
                        <span className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">Created:</span> {formatDate(organization.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Link to="/dashboard/settings">
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Edit Organization
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="px-6 py-5 bg-gray-50">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Organization Stats</h2>
                <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Members</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{orgStats.totalMembers}</dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Members</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{orgStats.activeMembers}</dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Invitations</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{orgStats.pendingInvitations}</dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Job Titles</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{titles.length}</dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'members'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('members')}
                >
                  Team Members
                </button>
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'titles'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('titles')}
                >
                  Job Titles
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Organization Info Card */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Organization Information</h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Organization Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{organization.name}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Industry</dt>
                        <dd className="mt-1 text-sm text-gray-900">{organization.industry || 'Not specified'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Size</dt>
                        <dd className="mt-1 text-sm text-gray-900">{organization.size || 'Not specified'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Created On</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(organization.created_at)}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Owner</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {currentUser?.name || 'Current User'} ({currentUser?.email || 'N/A'})
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {/* Job Titles Summary */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Job Titles</h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    {titles.length > 0 ? (
                      <div className="space-y-3">
                        {titles.slice(0, 5).map((title) => (
                          <div key={title.id} className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{title.name}</h4>
                              <p className="text-xs text-gray-500">{title.description || 'No description'}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {teamMembers.filter(m => m.title === title.name).length} members
                            </span>
                          </div>
                        ))}
                        
                        {titles.length > 5 && (
                          <div className="mt-4 text-center">
                            <button 
                              onClick={() => setActiveTab('titles')}
                              className="text-sm text-primary-600 hover:text-primary-900"
                            >
                              View all {titles.length} titles
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No job titles defined yet</p>
                        <Link to="/dashboard/settings">
                          <button className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Add Job Titles
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Team Members Summary */}
                <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Team Members</h3>
                    <Link to="/dashboard/team">
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        View All
                      </button>
                    </Link>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    {teamMembers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {teamMembers.slice(0, 5).map((member) => (
                              <tr key={member.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className={`h-8 w-8 rounded-full ${getAvatarBackground(member.name)} flex items-center justify-center text-white text-xs font-medium`}>
                                      {getAvatarLetters(member.name)}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                      <div className="text-sm text-gray-500">{member.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{member.title || 'No title'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.user ? 'Active' : 'Pending')}`}>
                                    {member.user ? 'Active' : 'Pending'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(member.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {teamMembers.length > 5 && (
                          <div className="mt-4 text-right">
                            <button 
                              onClick={() => setActiveTab('members')}
                              className="text-sm text-primary-600 hover:text-primary-900"
                            >
                              View all {teamMembers.length} members
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No team members yet</p>
                        <Link to="/dashboard/team">
                          <button className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Add Team Members
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Team Members Tab */}
            {activeTab === 'members' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">All Team Members</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your organization has {teamMembers.length} team members
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {teamMembers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teamMembers.map((member) => (
                            <tr key={member.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`h-8 w-8 rounded-full ${getAvatarBackground(member.name)} flex items-center justify-center text-white text-xs font-medium`}>
                                    {getAvatarLetters(member.name)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{member.title || 'No title'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.user ? 'Active' : 'Pending')}`}>
                                  {member.user ? 'Active' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(member.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/dashboard/team/members/${member.id}`} className="text-primary-600 hover:text-primary-900">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by adding a team member to your organization.
                      </p>
                      <div className="mt-6">
                        <Link to="/dashboard/team">
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Team Member
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Job Titles Tab */}
            {activeTab === 'titles' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Job Titles</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your organization has {titles.length} defined job titles
                    </p>
                  </div>
                  <Link to="/dashboard/settings">
                    <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Manage Titles
                    </button>
                  </Link>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {titles.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {titles.map((title) => {
                        const memberCount = teamMembers.filter(m => m.title === title.name).length;
                        return (
                          <div key={title.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="px-4 py-5 sm:p-6">
                              <h3 className="text-lg font-medium leading-6 text-gray-900">{title.name}</h3>
                              <p className="mt-1 text-sm text-gray-500 h-12 overflow-hidden">
                                {title.description || 'No description provided'}
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Created: {formatDate(title.created_at || organization.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No job titles</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Define job titles to better organize your team.
                      </p>
                      <div className="mt-6">
                        <Link to="/dashboard/settings">
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Job Title
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationDashboard;