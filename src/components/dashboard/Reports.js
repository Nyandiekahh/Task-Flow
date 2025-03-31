import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckCircle, AlertTriangle, BarChart2, Users, FileText, Settings } from 'lucide-react';

// Color palette for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Reports = () => {
  // State for dates and filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedReportType, setSelectedReportType] = useState('project_status');
  const [groupBy, setGroupBy] = useState('week');
  
  // State for API data
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectStatusReport, setProjectStatusReport] = useState(null);
  const [teamProductivityReport, setTeamProductivityReport] = useState(null);
  const [taskCompletionReport, setTaskCompletionReport] = useState(null);
  const [timeTrackingReport, setTimeTrackingReport] = useState(null);
  const [overdueTasksReport, setOverdueTasksReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedConfigurations, setSavedConfigurations] = useState([]);
  const [organization, setOrganization] = useState(null);

  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';
  
  // Get the token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Fetch initial data - projects, team members, and organization
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      
      try {
        const token = getToken();
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch organizations first to get the current org
        const orgResponse = await fetch(`${API_BASE_URL}/organizations/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (orgResponse.ok) {
          const orgsData = await orgResponse.json();
          if (orgsData && orgsData.length > 0) {
            setOrganization(orgsData[0]);
          }
        }
        
        // Fetch projects
        const projectsResponse = await fetch(`${API_BASE_URL}/projects/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        }
        
        // Fetch team members
        const teamMembersResponse = await fetch(`${API_BASE_URL}/team-members/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (teamMembersResponse.ok) {
          const teamMembersData = await teamMembersResponse.json();
          setTeamMembers(teamMembersData);
        }
        
        // Fetch saved report configurations
        const configurationsResponse = await fetch(`${API_BASE_URL}/report-configurations/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (configurationsResponse.ok) {
          const configurationsData = await configurationsResponse.json();
          setSavedConfigurations(configurationsData);
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [API_BASE_URL]);
  
  // Function to make API calls with authentication
  const apiCall = async (endpoint, method = 'GET', body = null) => {
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      };
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in API call to ${endpoint}:`, error);
      throw error;
    }
  };
  
  // Generate report based on the selected type
  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseParams = {
        start_date: startDate,
        end_date: endDate,
        ...(selectedProject !== 'all' && { project_id: parseInt(selectedProject) })
      };
      
      switch (selectedReportType) {
        case 'project_status':
          const projectData = await apiCall('reports/project-status/', 'POST', baseParams);
          setProjectStatusReport(projectData);
          break;
          
        case 'team_productivity':
          const teamData = await apiCall('reports/team-productivity/', 'POST', {
            ...baseParams,
            group_by: groupBy
          });
          setTeamProductivityReport(teamData);
          break;
          
        case 'task_completion':
          const taskData = await apiCall('reports/task-completion/', 'POST', {
            ...baseParams,
            group_by: groupBy
          });
          setTaskCompletionReport(taskData);
          break;
          
        case 'time_tracking':
          try {
            const timeData = await apiCall('reports/time-tracking/', 'POST', {
              ...baseParams,
              group_by: groupBy,
              billable_only: false
            });
            setTimeTrackingReport(timeData);
          } catch (e) {
            // Handle time tracking report error specifically
            setError(`Time tracking report error: ${e.message}. This endpoint may need the Coalesce output_field fix.`);
          }
          break;
          
        case 'overdue_tasks':
          const overdueData = await apiCall('reports/overdue-tasks/', 'POST', {
            ...(selectedProject !== 'all' && { project_id: parseInt(selectedProject) }),
            group_by: groupBy || 'project'
          });
          setOverdueTasksReport(overdueData);
          break;
          
        default:
          break;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Save report configuration
  const saveReportConfiguration = async () => {
    const configName = prompt('Enter a name for this report configuration:');
    
    if (!configName) return;
    
    try {
      setLoading(true);
      
      const configBody = {
        name: configName,
        report_type: selectedReportType,
        organization: organization?.id,
        configuration: {
          start_date: startDate,
          end_date: endDate,
          ...(selectedProject !== 'all' && { project_id: parseInt(selectedProject) }),
          ...(selectedReportType !== 'project_status' && { group_by: groupBy })
        },
        is_favorite: false
      };
      
      const savedConfig = await apiCall('report-configurations/', 'POST', configBody);
      setSavedConfigurations([...savedConfigurations, savedConfig]);
      alert('Report configuration saved successfully!');
    } catch (err) {
      setError(err.message);
      alert(`Error saving configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load a saved configuration
  const loadSavedConfiguration = async (configId) => {
    try {
      setLoading(true);
      
      const config = savedConfigurations.find(c => c.id === configId);
      
      if (!config) return;
      
      setSelectedReportType(config.report_type);
      setStartDate(config.configuration.start_date);
      setEndDate(config.configuration.end_date);
      
      if (config.configuration.project_id) {
        setSelectedProject(config.configuration.project_id.toString());
      } else {
        setSelectedProject('all');
      }
      
      if (config.configuration.group_by) {
        setGroupBy(config.configuration.group_by);
      }
      
      // Generate the report based on this configuration
      const reportData = await apiCall(`report-configurations/${configId}/generate/`, 'POST');
      
      // Update the appropriate report state based on type
      switch (config.report_type) {
        case 'project_status':
          setProjectStatusReport(reportData);
          break;
        case 'team_productivity':
          setTeamProductivityReport(reportData);
          break;
        case 'task_completion':
          setTaskCompletionReport(reportData);
          break;
        case 'time_tracking':
          setTimeTrackingReport(reportData);
          break;
        case 'overdue_tasks':
          setOverdueTasksReport(reportData);
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err.message);
      alert(`Error loading configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Helper function to calculate percentage
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };
  
  // Render the Project Status Report
  const renderProjectStatusReport = () => {
    if (!projectStatusReport) return null;
    
    // Transform data for charts
    const projectCompletionData = projectStatusReport.projects.map(project => ({
      name: project.name,
      completion: project.completion_percentage,
      timeline: project.timeline_percentage || 0
    }));
    
    // Task status distribution for all projects
    const taskStatusData = [
      { name: 'Completed', value: projectStatusReport.projects.reduce((sum, p) => sum + p.completed_tasks, 0) },
      { name: 'In Progress', value: projectStatusReport.projects.reduce((sum, p) => sum + p.in_progress_tasks, 0) },
      { name: 'Pending', value: projectStatusReport.projects.reduce((sum, p) => sum + p.pending_tasks, 0) },
      { name: 'Overdue', value: projectStatusReport.projects.reduce((sum, p) => sum + p.overdue_tasks, 0) }
    ].filter(item => item.value > 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Projects
            </h3>
            <p className="text-3xl font-bold">{projectStatusReport.projects.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-yellow-500" />
              Total Tasks
            </h3>
            <p className="text-3xl font-bold">
              {projectStatusReport.projects.reduce((sum, p) => sum + p.total_tasks, 0)}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Completed
            </h3>
            <p className="text-3xl font-bold">
              {projectStatusReport.projects.reduce((sum, p) => sum + p.completed_tasks, 0)}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Overdue
            </h3>
            <p className="text-3xl font-bold text-red-500">
              {projectStatusReport.projects.reduce((sum, p) => sum + p.overdue_tasks, 0)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Project Completion vs Timeline</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectCompletionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completion" name="Completion %" fill="#3B82F6" />
                  <Bar dataKey="timeline" name="Timeline %" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Tasks']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Project Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Tasks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectStatusReport.projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'planning' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.total_tasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{project.completion_percentage}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${project.completion_percentage}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {project.timeline_percentage ? `${Math.round(project.timeline_percentage)}%` : 'N/A'}
                      </div>
                      {project.timeline_percentage && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${project.timeline_percentage}%` }}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.end_date ? formatDate(project.end_date) : 'Not set'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the Team Productivity Report
  const renderTeamProductivityReport = () => {
    if (!teamProductivityReport) return null;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              Team Members
            </h3>
            <p className="text-3xl font-bold">{teamProductivityReport.team_productivity.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-yellow-500" />
              Total Tasks
            </h3>
            <p className="text-3xl font-bold">
              {teamProductivityReport.team_productivity.reduce((sum, m) => sum + m.metrics.total_tasks, 0)}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Completed Tasks
            </h3>
            <p className="text-3xl font-bold">
              {teamProductivityReport.team_productivity.reduce((sum, m) => sum + m.metrics.completed_tasks, 0)}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-purple-500" />
              Date Range
            </h3>
            <p className="text-sm font-medium">
              {formatDate(teamProductivityReport.date_range.start_date)} - {formatDate(teamProductivityReport.date_range.end_date)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Task Completion Rate</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamProductivityReport.team_productivity.map(member => ({
                    name: member.team_member.name,
                    rate: member.metrics.completion_rate
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Completion Rate']} />
                  <Legend />
                  <Bar dataKey="rate" name="Completion Rate" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">On-Time Completion Rate</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamProductivityReport.team_productivity.map(member => ({
                    name: member.team_member.name,
                    rate: member.metrics.on_time_completion_rate
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'On-Time Rate']} />
                  <Legend />
                  <Bar dataKey="rate" name="On-Time Rate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Team Member Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Tasks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed Tasks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-Time Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamProductivityReport.team_productivity.map((member) => (
                  <tr key={member.team_member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.team_member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.team_member.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.metrics.total_tasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.metrics.completed_tasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.metrics.completion_rate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${member.metrics.completion_rate}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.metrics.on_time_completion_rate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{ width: `${member.metrics.on_time_completion_rate}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Trend data visualization */}
        {teamProductivityReport.team_productivity.some(m => m.trend_data && m.trend_data.length > 0) && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Task Completion Trends</h3>
            {teamProductivityReport.team_productivity.map((member) => {
              if (!member.trend_data || member.trend_data.length === 0) return null;
              
              // Format trend data based on group_by
              const trendData = member.trend_data.map(item => {
                // Extract name based on what fields are available
                let name = '';
                if (item.week_start) name = formatDate(item.week_start);
                else if (item.month) name = new Date(item.month).toLocaleDateString('default', { month: 'short', year: 'numeric' });
                else if (item.date) name = formatDate(item.date);
                else if (item.project_name) name = item.project_name;
                
                return {
                  name,
                  completed: item.completed_tasks || 0,
                  total: item.total_tasks || 0
                };
              });
              
              return (
                <div key={member.team_member.id} className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">{member.team_member.name}</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trendData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" name="Completed Tasks" fill="#10B981" />
                        <Bar dataKey="total" name="Total Tasks" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  // Render the Task Completion Report
  const renderTaskCompletionReport = () => {
    if (!taskCompletionReport) return null;
    
    // Create data for status distribution pie chart
    const statusData = Object.entries(taskCompletionReport.summary.status_counts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    })).filter(item => item.value > 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
              Total Tasks
            </h3>
            <p className="text-3xl font-bold">{taskCompletionReport.summary.total_tasks}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Completed Tasks
            </h3>
            <p className="text-3xl font-bold">
              {taskCompletionReport.summary.status_counts.completed + (taskCompletionReport.summary.status_counts.approved || 0)}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              In Progress
            </h3>
            <p className="text-3xl font-bold">{taskCompletionReport.summary.status_counts.in_progress || 0}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Settings className="mr-2 h-5 w-5 text-purple-500" />
              Completion Rate
            </h3>
            <p className="text-3xl font-bold">{taskCompletionReport.summary.completion_rate.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
            <div className="h-64">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Tasks']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No task data available
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Completion Trends</h3>
            <div className="h-64">
              {taskCompletionReport.grouped_data && taskCompletionReport.grouped_data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taskCompletionReport.grouped_data.map(item => {
                      // Extract name based on what fields are available
                      let name = '';
                      if (item.project_name) name = item.project_name;
                      else if (item.category) name = item.category;
                      else if (item.priority) name = item.priority;
                      else if (item.date) name = formatDate(item.date);
                      else if (item.week_start) name = formatDate(item.week_start);
                      else if (item.month) name = new Date(item.month).toLocaleDateString('default', { month: 'short' });
                      
                      return {
                        name: name || 'Unknown',
                        completed: item.completed_tasks || 0,
                        total: item.total_tasks || 0,
                        rate: item.completion_rate || 0
                      };
                    })}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total" name="Total Tasks" fill="#3B82F6" />
                    <Bar yAxisId="left" dataKey="completed" name="Completed Tasks" fill="#10B981" />
                    <Line yAxisId="right" type="monotone" dataKey="rate" name="Completion Rate %" stroke="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No trend data available
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Remaining component code... */}
        
      </div>
    );
  };
  
  // Include other render methods...
  // Render the Time Tracking Report
const renderTimeTrackingReport = () => {
  if (!timeTrackingReport) return null;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-500" />
            Total Hours
          </h3>
          <p className="text-3xl font-bold">{timeTrackingReport.summary.total_hours.toFixed(1)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Users className="mr-2 h-5 w-5 text-yellow-500" />
            Team Members
          </h3>
          <p className="text-3xl font-bold">{timeTrackingReport.summary.num_team_members}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-green-500" />
            Projects
          </h3>
          <p className="text-3xl font-bold">{timeTrackingReport.summary.num_projects}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-purple-500" />
            Date Range
          </h3>
          <p className="text-sm font-medium">
            {formatDate(timeTrackingReport.date_range.start_date)} - {formatDate(timeTrackingReport.date_range.end_date)}
          </p>
        </div>
      </div>
      
      {/* Time by Project chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Time by Project</h3>
          <div className="h-64">
            {timeTrackingReport.summary.project_hours && Object.keys(timeTrackingReport.summary.project_hours).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(timeTrackingReport.summary.project_hours).map(([name, hours], index) => ({
                      name,
                      value: hours
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.keys(timeTrackingReport.summary.project_hours).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toFixed(1)} hours`, 'Time Spent']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No project time data available
              </div>
            )}
          </div>
        </div>
        
        {/* Time by Team Member chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Time by Team Member</h3>
          <div className="h-64">
            {timeTrackingReport.summary.member_hours && Object.keys(timeTrackingReport.summary.member_hours).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(timeTrackingReport.summary.member_hours).map(([name, hours], index) => ({
                      name,
                      value: hours
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.keys(timeTrackingReport.summary.member_hours).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toFixed(1)} hours`, 'Time Logged']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No member time data available
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Time tracking by period chart */}
      {timeTrackingReport.grouped_data && timeTrackingReport.grouped_data.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Time Tracking Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeTrackingReport.grouped_data.map(item => {
                  // Extract name based on what fields are available
                  let name = '';
                  if (item.date) name = formatDate(item.date);
                  else if (item.week_start) name = formatDate(item.week_start);
                  else if (item.month) name = new Date(item.month).toLocaleDateString('default', { month: 'short', year: 'numeric' });
                  
                  return {
                    name: name || 'Unknown',
                    hours: item.hours || 0,
                    billableHours: item.billable_hours || 0
                  };
                })}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toFixed(1)} hours`, '']} />
                <Legend />
                <Line type="monotone" dataKey="hours" name="Total Hours" stroke="#3B82F6" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="billableHours" name="Billable Hours" stroke="#10B981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Team member time log details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Team Member Time Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billable Hours
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billable %
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeTrackingReport.team_members && timeTrackingReport.team_members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.total_hours.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.billable_hours.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.billable_percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.projects.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Render the Overdue Tasks Report
const renderOverdueTasksReport = () => {
  if (!overdueTasksReport) return null;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Total Overdue
          </h3>
          <p className="text-3xl font-bold text-red-500">{overdueTasksReport.summary.total_overdue_tasks}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            Projects
          </h3>
          <p className="text-3xl font-bold">{overdueTasksReport.summary.num_projects}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Users className="mr-2 h-5 w-5 text-yellow-500" />
            Team Members
          </h3>
          <p className="text-3xl font-bold">{overdueTasksReport.summary.num_team_members}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-purple-500" />
            Avg Days Overdue
          </h3>
          <p className="text-3xl font-bold">{overdueTasksReport.summary.avg_days_overdue.toFixed(1)}</p>
        </div>
      </div>
      
      {/* Overdue tasks by project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Overdue Tasks by Project</h3>
          <div className="h-64">
            {overdueTasksReport.grouped_data && overdueTasksReport.grouped_data.some(item => item.project_name) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={overdueTasksReport.grouped_data
                    .filter(item => item.project_name)
                    .map(item => ({
                      name: item.project_name,
                      count: item.overdue_tasks_count
                    }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Overdue Tasks']} />
                  <Legend />
                  <Bar dataKey="count" name="Overdue Tasks" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No project data available
              </div>
            )}
          </div>
        </div>
        
        {/* Overdue tasks by assignee */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Overdue Tasks by Assignee</h3>
          <div className="h-64">
            {overdueTasksReport.grouped_data && overdueTasksReport.grouped_data.some(item => item.assignee_name) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={overdueTasksReport.grouped_data
                    .filter(item => item.assignee_name)
                    .map(item => ({
                      name: item.assignee_name,
                      count: item.overdue_tasks_count
                    }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Overdue Tasks']} />
                  <Legend />
                  <Bar dataKey="count" name="Overdue Tasks" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No assignee data available
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overdue task details table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Overdue Task Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Overdue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {overdueTasksReport.overdue_tasks && overdueTasksReport.overdue_tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.project_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.assignee_name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(task.due_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.days_overdue > 7 ? 'bg-red-100 text-red-800' :
                      task.days_overdue > 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.days_overdue}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Update the renderSelectedReport function to uncomment the missing cases
const renderSelectedReport = () => {
  switch (selectedReportType) {
    case 'project_status':
      return renderProjectStatusReport();
    case 'team_productivity':
      return renderTeamProductivityReport();
    case 'task_completion':
      return renderTaskCompletionReport();
    case 'time_tracking':
      return renderTimeTrackingReport();
    case 'overdue_tasks':
      return renderOverdueTasksReport();
    default:
      return null;
  }
};

// Also fix the return statement to render the selected report
return (
  <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and view reports on projects, tasks, and team performance
        </p>
      </div>
      
      {/* Report Controls */}
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="project_status">Project Status</option>
              <option value="team_productivity">Team Productivity</option>
              <option value="task_completion">Task Completion</option>
              <option value="time_tracking">Time Tracking</option>
              <option value="overdue_tasks">Overdue Tasks</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          {selectedReportType !== 'project_status' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                {selectedReportType === 'team_productivity' && (
                  <option value="team_member">Team Member</option>
                )}
                {selectedReportType === 'task_completion' && (
                  <>
                    <option value="project">Project</option>
                    <option value="priority">Priority</option>
                    <option value="category">Category</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between">
          <div>
            <button
              onClick={generateReport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Generate Report
            </button>
            
            <button
              onClick={saveReportConfiguration}
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Configuration
            </button>
          </div>
          
          {savedConfigurations.length > 0 && (
            <div>
              <select
                onChange={(e) => {
                  if (e.target.value) loadSavedConfiguration(parseInt(e.target.value));
                }}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue=""
              >
                <option value="" disabled>Load Configuration</option>
                {savedConfigurations.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.name} ({config.report_type.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="text-center p-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading report data...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error: {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Report Content */}
      {renderSelectedReport()}
    </div>
  </div>
);  };

export default Reports;