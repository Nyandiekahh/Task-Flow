import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const NewProject = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams(); // Get project ID from URL
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  
  // Project form state
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planning', // Default status
    priority: 'medium'
  });

  // Fetch organization and team members when component loads
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || '/api/v1';
        const authToken = token || localStorage.getItem('token');
        
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        };
        
        // Fetch organizations
        try {
          const orgsResponse = await axios.get(`${API_URL}/organizations/`, { headers });
          setOrganizations(orgsResponse.data);
          
          // Select the first organization by default if available
          if (orgsResponse.data && orgsResponse.data.length > 0) {
            setSelectedOrg(orgsResponse.data[0].id);
            console.log("Selected organization:", orgsResponse.data[0].name, "ID:", orgsResponse.data[0].id);
          }
        } catch (orgErr) {
          console.error("Error fetching organizations:", orgErr);
        }
        
        // Fetch team members
        const teamResponse = await axios.get(`${API_URL}/team-members/`, { headers });
        setTeamMembers(teamResponse.data);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load necessary data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [token]);

  // Fetch project data if in edit mode
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!isEditMode || !token) return;
      
      try {
        setFetchLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || '/api/v1';
        const authToken = token || localStorage.getItem('token');
        
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        };
        
        // Get project details
        const projectResponse = await axios.get(`${API_URL}/projects/${id}/`, { headers });
        const project = projectResponse.data;
        
        // Format dates for form inputs (YYYY-MM-DD)
        const formatDate = (dateString) => {
          if (!dateString) return '';
          return new Date(dateString).toISOString().split('T')[0];
        };
        
        // Set form data from project
        setProjectData({
          name: project.name || '',
          description: project.description || '',
          start_date: formatDate(project.start_date),
          end_date: formatDate(project.end_date),
          status: project.status || 'planning',
          priority: project.priority || 'medium'
        });
        
        // Set selected organization
        if (project.organization) {
          setSelectedOrg(project.organization);
        }
        
        // Get team members for this project
        try {
          const membersResponse = await axios.get(`${API_URL}/projects/${id}/team-members/`, { headers });
          const projectMembers = membersResponse.data;
          
          // Set selected team members
          if (projectMembers && projectMembers.length > 0) {
            const memberIds = projectMembers.map(member => member.id);
            setSelectedMembers(memberIds);
          }
        } catch (memberErr) {
          console.error('Error fetching project team members:', memberErr);
        }
        
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id, isEditMode, token]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: value
    });
  };

  // Handle member selection
  const handleMemberSelection = (memberId) => {
    setSelectedMembers(prevSelected => {
      if (prevSelected.includes(memberId)) {
        return prevSelected.filter(id => id !== memberId);
      } else {
        return [...prevSelected, memberId];
      }
    });
  };

  // Handle organization selection
  const handleOrgChange = (e) => {
    setSelectedOrg(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.REACT_APP_API_URL || '/api/v1';
      const authToken = token || localStorage.getItem('token');
      
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };
      
      // Verify we have an organization ID
      if (!selectedOrg) {
        if (organizations.length > 0) {
          setSelectedOrg(organizations[0].id);
        } else {
          setError("No organization available. Please contact your administrator.");
          setLoading(false);
          return;
        }
      }
      
      // Format dates properly and include organization
      const formattedData = {
        ...projectData,
        organization: selectedOrg, // Use the selected organization ID
        start_date: projectData.start_date ? projectData.start_date : null,
        end_date: projectData.end_date ? projectData.end_date : null
      };
      
      console.log("Project data being sent:", JSON.stringify(formattedData));
      
      let response;
      let projectId;
      
      if (isEditMode) {
        // Update existing project
        response = await axios.patch(
          `${API_URL}/projects/${id}/`, 
          formattedData, 
          { headers }
        );
        projectId = id;
      } else {
        // Create new project
        response = await axios.post(
          `${API_URL}/projects/`, 
          formattedData, 
          { headers }
        );
        projectId = response.data.id;
      }
      
      console.log(isEditMode ? "Project updated with ID:" : "Project created with ID:", projectId);
      
      // Add team members to the project if any are selected
      if (selectedMembers.length > 0 && projectId) {
        try {
          // Try to add team members to the project
          await axios.post(
            `${API_URL}/projects/${projectId}/team-members/`,
            { team_member_ids: selectedMembers },
            { headers }
          );
        } catch (memberErr) {
          console.error("Error adding members to project:", memberErr);
          console.error("Response data:", memberErr.response?.data);
          // Continue even if adding members fails
        }
      }
      
      // Show success message and redirect
      setError(null);
      setTimeout(() => {
        navigate('/dashboard/projects');
      }, 500);
      
    } catch (err) {
      console.error("Error saving project:", err);
      console.error("Response data:", err.response?.data);
      
      // Extract error message from response if available
      let errorMessage = isEditMode 
        ? "Failed to update project. Please check your inputs and try again."
        : "Failed to create project. Please check your inputs and try again.";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (typeof err.response.data === 'object') {
          // Handle nested error objects
          const errorDetails = [];
          Object.entries(err.response.data).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errorDetails.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              errorDetails.push(`${field}: ${errors}`);
            }
          });
          
          if (errorDetails.length > 0) {
            errorMessage = errorDetails.join('; ');
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Group team members by first letter of name for better organization
  const groupedMembers = teamMembers.reduce((groups, member) => {
    const firstLetter = member.name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(member);
    return groups;
  }, {});

  if (fetchLoading) {
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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Project' : 'Create New Project'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode 
                ? 'Update project information and team assignments.'
                : 'Add a new project to organize and track related tasks.'}
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Organization selector */}
                {organizations.length > 0 && (
                  <div className="sm:col-span-2">
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                      Organization
                    </label>
                    <select
                      id="organization"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={selectedOrg || ''}
                      onChange={handleOrgChange}
                      disabled={isEditMode} // Disable organization change in edit mode
                    >
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Project name */}
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={projectData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter project name"
                  />
                </div>
                
                {/* Project description */}
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={projectData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Describe the project and its objectives"
                  ></textarea>
                </div>
                
                {/* Start date */}
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    id="start_date"
                    value={projectData.start_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                {/* End date */}
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    id="end_date"
                    value={projectData.end_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {projectData.end_date && projectData.start_date && new Date(projectData.end_date) < new Date(projectData.start_date) && (
                    <p className="mt-1 text-sm text-red-600">End date must be after start date</p>
                  )}
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={projectData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={projectData.priority || 'medium'}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              {/* Team Members Section */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditMode ? 'Update Team Members' : 'Assign Team Members'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isEditMode 
                    ? 'Modify the team members assigned to this project'
                    : 'Select the team members who will work on this project'}
                </p>
                
                {loading && teamMembers.length === 0 ? (
                  <div className="mt-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">No team members available.</p>
                    <p className="text-sm text-gray-500 mt-2">Please add team members first.</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {/* Alphabetical group headers */}
                    {Object.keys(groupedMembers).sort().map(letter => (
                      <div key={letter}>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-4 mb-2">{letter}</h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {groupedMembers[letter].map(member => (
                            <div 
                              key={member.id} 
                              className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                                selectedMembers.includes(member.id) 
                                  ? 'border-indigo-500 bg-indigo-50' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              onClick={() => handleMemberSelection(member.id)}
                            >
                              <div className="flex items-center">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  selectedMembers.includes(member.id) 
                                    ? 'bg-indigo-100 text-indigo-800' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                                {selectedMembers.includes(member.id) && (
                                  <div className="absolute top-2 right-2">
                                    <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Selected members count */}
                    {selectedMembers.length > 0 && (
                      <div className="mt-3 text-sm text-indigo-600">
                        {selectedMembers.length} {selectedMembers.length === 1 ? 'member' : 'members'} selected
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard/projects')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (isEditMode ? "Update Project" : "Create Project")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProject;