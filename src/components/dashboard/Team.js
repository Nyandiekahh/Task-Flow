import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import PendingInvitations from './PendingInvitations';

const Team = () => {
  const { token } = useContext(AuthContext);
  
  // State for team members and filter/search
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [roles, setRoles] = useState(['All']);
  const [activeTab, setActiveTab] = useState('members'); // 'members' or 'invitations'
  
  // Team invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Team members form state for invites
  const [invites, setInvites] = useState([
    { email: '', role: 'admin', name: '' }
  ]);
  
  // State for titles from the system
  const [titles, setTitles] = useState([]);
  const [titlesLoading, setTitlesLoading] = useState(false);
  
  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Get team members
        const response = await axios.get(`${API_URL}/team-members/`, { headers });
        
        // Get roles for filter options
        try {
          const rolesResponse = await axios.get(`${API_URL}/roles/`, { headers });
          const roleNames = ['All', ...new Set(rolesResponse.data.map(role => role.name))];
          setRoles(roleNames);
        } catch (rolesError) {
          console.error("Failed to load roles:", rolesError);
        }
        
        // Get titles for the invite form
        try {
          setTitlesLoading(true);
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
        
        // Transform data to include needed fields
        const transformedMembers = response.data.map(member => ({
          ...member,
          status: member.user ? 'Active' : 'Pending',
          joinedDate: member.created_at,
          avatar: member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
          // We'd need backend APIs for these, using placeholders for now
          tasksAssigned: 0,
          tasksCompleted: 0
        }));
        
        setTeamMembers(transformedMembers);
        setError(null);
        
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchTeamMembers();
    }
  }, [token]);
  
  // Define statuses
  const statuses = ['All', 'Active', 'Pending'];
  
  // Filter team members based on filters and search
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.title && member.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'All' || member.title === filterRole;
    const matchesStatus = filterStatus === 'All' || member.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
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
  
  // Add another invite field
  const addInviteField = () => {
    // Use the first title ID if available, otherwise use 'admin'
    const defaultRole = titles.length > 0 ? titles[0].id : 'admin';
    setInvites([...invites, { email: '', role: defaultRole, name: '' }]);
  };

  // Remove an invite field
  const removeInviteField = (index) => {
    const updatedInvites = [...invites];
    updatedInvites.splice(index, 1);
    setInvites(updatedInvites);
  };

  // Handle input changes for invite form
  const handleInviteInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedInvites = [...invites];
    updatedInvites[index] = {
      ...updatedInvites[index],
      [name]: value
    };
    setInvites(updatedInvites);
  };

  // Handle invite form submission with OTP using existing endpoint
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
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Filter out any empty invites
    const validInvites = invites.filter(invite => invite.email.trim() !== '');
    
    // Use existing endpoint but include a flag to indicate we want OTP
    await axios.post(
      `${API_URL}/auth/invite/`,
      { 
        invitations: validInvites,
        use_otp: true  // Add this flag to indicate we want OTP instead of links
      },
      { headers }
    );
    
    setInviteSuccess(true);
    // Clear form after successful submission
    setInvites([{ email: '', role: titles.length > 0 ? titles[0].id : 'admin', name: '' }]);
    
    // Switch to the invitations tab to show the new invites
    setActiveTab('invitations');
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setInviteSuccess(false);
      setInviteModalOpen(false);
    }, 3000);
    
  } catch (err) {
    console.error("Error sending invites:", err);
    setInviteError("Failed to send invites. Please try again.");
  } finally {
    setInviteLoading(false);
  }
};

  // Get role options for select
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
            <button 
              type="button" 
              onClick={() => setInviteModalOpen(true)} 
              className="btn btn-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Team Member
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('members')}
              className={`${
                activeTab === 'members'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Team Members
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`${
                activeTab === 'invitations'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending Invitations
            </button>
          </nav>
        </div>
        
        {/* Loading state */}
        {loading && activeTab === 'members' && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}
        
        {/* Error state */}
        {error && activeTab === 'members' && (
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
        
        {/* Team Members Tab Content */}
        {activeTab === 'members' && !loading && !error && (
          <>
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
                    <option key={index} value={role}>{role === 'All' ? 'All Roles' : role}</option>
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
                          <p className="text-sm text-gray-500">{member.title || 'No title'}</p>
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
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                            <div className="text-sm text-gray-900">{member.title || 'No title'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
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
                  {searchTerm || filterRole !== 'All' || filterStatus !== 'All' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first team member.'}
                </p>
                {!searchTerm && filterRole === 'All' && filterStatus === 'All' && (
                  <div className="mt-6">
                    <button 
                      type="button" 
                      onClick={() => setInviteModalOpen(true)}
                      className="btn btn-primary"
                    >
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
            {teamMembers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Team Overview</h3>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        {roles.length > 0 ? roles.length - 1 : 0}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Different Roles</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Pending Invitations Tab Content */}
        {activeTab === 'invitations' && (
          <PendingInvitations />
        )}
        
        {/* Team Invite Modal - Updated for OTP */}
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
                        <p className="text-sm text-green-700">
                          <strong>Invitations sent successfully!</strong> Each user will receive an email with a one-time password (OTP) to complete registration.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Information about OTP-based invites */}
                <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">How Team Invitations Work</h4>
                  <p className="text-sm text-blue-600 mb-2">
                    When you invite a team member:
                  </p>
                  <ol className="list-decimal pl-4 text-sm text-blue-600 space-y-1">
                    <li>They'll receive an email with a one-time password (OTP)</li>
                    <li>They should go to the sign-in page and enter their email address</li>
                    <li>The system will detect they're a new user and prompt for the OTP</li>
                    <li>After verifying the OTP, they'll create their account</li>
                    <li>For future sign-ins, they'll use their email and password</li>
                  </ol>
                </div>
                
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
                      Invite colleagues to join your organization. They will receive an email with a one-time password to set up their account.
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
                      ) : 'Send OTP Invitations'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;