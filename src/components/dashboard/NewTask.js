import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const NewTask = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [existingTasks, setExistingTasks] = useState([]);
  
  // State for deadline calculation
  const [deadlineType, setDeadlineType] = useState('date'); // 'date' or 'days'
  const [daysUntilDeadline, setDaysUntilDeadline] = useState(1);
  const [includeWeekends, setIncludeWeekends] = useState(true);
  const [includeHolidays, setIncludeHolidays] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    start_date: '',
    estimated_hours: '',
    assigned_to: '',
    assignees: [],
    approvers: [],
    watchers: [],
    project: '',
    tags: [],
    custom_tags: '',
    linked_tasks: [],
    prerequisites: [],
    dependent_tasks: [],
    is_recurring: false,
    recurring_frequency: 'weekly',
    recurring_ends_on: '',
    acceptance_criteria: '',
    attachments: [],
    notes: '',
    visibility: 'team',
    time_tracking_enabled: false,
    budget_hours: '',
    is_billable: false,
    client_reference: ''
  });

  // Sections state for accordion
  const [openSections, setOpenSections] = useState({
    basic: true,
    timeline: false,
    assignment: false,
    relationships: false,
    resources: false,
    details: false,
    tracking: false
  });
  
  // Fetch needed data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      try {
        // Fetch team members
        const teamMembersResponse = await axios.get(`${API_URL}/team-members/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setTeamMembers(teamMembersResponse.data);
        
        // Fetch projects
        try {
          const projectsResponse = await axios.get(`${API_URL}/projects/`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setProjects(projectsResponse.data);
        } catch (projectErr) {
          console.error('Error fetching projects:', projectErr);
          // Not setting error since projects are optional
        }
        
        // Fetch existing tasks for relationships
        try {
          const tasksResponse = await axios.get(`${API_URL}/tasks/`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setExistingTasks(tasksResponse.data);
        } catch (tasksErr) {
          console.error('Error fetching tasks:', tasksErr);
          // Not setting error since task relationships are optional
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Could not load team members. You can still create a task without assigning it.');
      }
    };

    fetchData();
  }, [token]);
  
  // Calculate due date based on the number of days
  useEffect(() => {
    if (deadlineType === 'days' && daysUntilDeadline > 0) {
      const calculateDueDate = () => {
        const today = new Date();
        let daysToAdd = parseInt(daysUntilDeadline, 10);
        let calculatedDate = new Date(today);
        
        if (!includeWeekends || !includeHolidays) {
          let daysAdded = 0;
          while (daysAdded < daysToAdd) {
            calculatedDate.setDate(calculatedDate.getDate() + 1);
            
            // Check if it's a weekend (0 = Sunday, 6 = Saturday)
            const isWeekend = calculatedDate.getDay() === 0 || calculatedDate.getDay() === 6;
            
            // For this example, we'll consider holidays to be hardcoded
            // In a real application, you would check against a holiday API or database
            const isHoliday = false; // Placeholder for holiday check
            
            if ((includeWeekends || !isWeekend) && (includeHolidays || !isHoliday)) {
              daysAdded++;
            }
          }
        } else {
          // If we include both weekends and holidays, just add the days directly
          calculatedDate.setDate(calculatedDate.getDate() + daysToAdd);
        }
        
        // Format the date as YYYY-MM-DD for the input field
        const year = calculatedDate.getFullYear();
        const month = String(calculatedDate.getMonth() + 1).padStart(2, '0');
        const day = String(calculatedDate.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      };
      
      const dueDateValue = calculateDueDate();
      setFormData(prev => ({
        ...prev,
        due_date: dueDateValue
      }));
    }
  }, [deadlineType, daysUntilDeadline, includeWeekends, includeHolidays]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelectChange = (e, fieldName) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: selectedValues
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleTagsChange = (e) => {
    setFormData(prev => ({
      ...prev,
      custom_tags: e.target.value
    }));
  };
  
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      // Create a JSON object for submission instead of FormData
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date ? `${formData.due_date}T23:59:59Z` : null,
        assigned_to: formData.assigned_to || null,
        custom_tags: formData.custom_tags
      };
      
      // Add optional fields only if they have values
      if (formData.start_date) taskData.start_date = formData.start_date;
      if (formData.estimated_hours) taskData.estimated_hours = formData.estimated_hours;
      if (formData.project) taskData.project = formData.project;
      if (formData.is_recurring) {
        taskData.is_recurring = true;
        taskData.recurring_frequency = formData.recurring_frequency;
        if (formData.recurring_ends_on) taskData.recurring_ends_on = formData.recurring_ends_on;
      }
      if (formData.acceptance_criteria) taskData.acceptance_criteria = formData.acceptance_criteria;
      if (formData.notes) taskData.notes = formData.notes;
      if (formData.visibility) taskData.visibility = formData.visibility;
      if (formData.time_tracking_enabled) {
        taskData.time_tracking_enabled = true;
        if (formData.budget_hours) taskData.budget_hours = formData.budget_hours;
        if (formData.is_billable) {
          taskData.is_billable = true;
          if (formData.client_reference) taskData.client_reference = formData.client_reference;
        }
      }
      
      // Submit data to API as JSON
      const response = await axios.post(`${API_URL}/tasks/`, taskData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess(true);
      
      // Handle attachments separately
      if (formData.attachments.length > 0) {
        const taskId = response.data.id;
        
        for (const file of formData.attachments) {
          const attachmentData = new FormData();
          attachmentData.append('file', file);
          
          try {
            await axios.post(`${API_URL}/tasks/${taskId}/add_attachment/`, attachmentData, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            });
          } catch (attachErr) {
            console.error('Error uploading attachment:', attachErr);
          }
        }
      }
      
      // Redirect to task details page after 1 second
      setTimeout(() => {
        navigate(`/dashboard/tasks/${response.data.id}`);
      }, 1000);
      
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.detail || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to check if a date is in the past
  const isDateInPast = (dateString) => {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    
    return selectedDate < today;
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Task
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new task to your workflow.
            </p>
          </div>
        </div>
        
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Display error if any */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
            
            {/* Display success message */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Task created successfully! Redirecting...</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Basic Information Section */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('basic')}
              >
                <h3 className="text-base font-medium text-gray-900">Basic Information</h3>
                <span className="text-gray-500">
                  {openSections.basic ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>
              
              {openSections.basic && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows="4"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide detailed instructions for this task..."
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Priority */}
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        name="priority"
                        id="priority"
                        className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    
                    {/* Project */}
                    <div>
                      <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                        Project
                      </label>
                      <select
                        name="project"
                        id="project"
                        className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={formData.project}
                        onChange={handleChange}
                      >
                        <option value="">Not part of a project</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label htmlFor="custom_tags" className="block text-sm font-medium text-gray-700">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="custom_tags"
                      id="custom_tags"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.custom_tags}
                      onChange={handleTagsChange}
                      placeholder="planning, quarterly, review, etc."
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Timeline Section */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('timeline')}
              >
                <h3 className="text-base font-medium text-gray-900">Timeline</h3>
                <span className="text-gray-500">
                  {openSections.timeline ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>
              
              {openSections.timeline && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* Start Date */}
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      id="start_date"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {/* Due Date Selection Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Set Deadline By
                    </label>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          id="deadline-date"
                          type="radio"
                          name="deadline-type"
                          value="date"
                          checked={deadlineType === 'date'}
                          onChange={() => setDeadlineType('date')}
                          className="h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label htmlFor="deadline-date" className="ml-2 block text-sm text-gray-700">
                          Specific Date
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="deadline-days"
                          type="radio"
                          name="deadline-type"
                          value="days"
                          checked={deadlineType === 'days'}
                          onChange={() => setDeadlineType('days')}
                          className="h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label htmlFor="deadline-days" className="ml-2 block text-sm text-gray-700">
                          Number of Days
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Due Date Input based on selection */}
                  {deadlineType === 'date' ? (
                    <div>
                      <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="due_date"
                        id="due_date"
                        className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={formData.due_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {isDateInPast(formData.due_date) && (
                        <p className="mt-1 text-sm text-red-600">Due date cannot be in the past.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="days-until-deadline" className="block text-sm font-medium text-gray-700">
                          Days Until Deadline
                        </label>
                        <input
                          type="number"
                          id="days-until-deadline"
                          min="1"
                          className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={daysUntilDeadline}
                          onChange={(e) => setDaysUntilDeadline(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="include-weekends"
                          checked={includeWeekends}
                          onChange={(e) => setIncludeWeekends(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label htmlFor="include-weekends" className="ml-2 block text-sm text-gray-700">
                          Include weekends in calculation
                        </label>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="include-holidays"
                          checked={includeHolidays}
                          onChange={(e) => setIncludeHolidays(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label htmlFor="include-holidays" className="ml-2 block text-sm text-gray-700">
                          Include holidays in calculation
                        </label>
                      </div>
                      
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          Calculated due date: <strong>{formData.due_date}</strong>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Estimated Hours */}
                  <div>
                    <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      name="estimated_hours"
                      id="estimated_hours"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.estimated_hours}
                      onChange={handleChange}
                      min="0"
                      step="0.5"
                      placeholder="e.g. 8"
                    />
                  </div>
                  
                  {/* Recurring Task */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_recurring"
                        id="is_recurring"
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={formData.is_recurring}
                        onChange={handleChange}
                      />
                      <label htmlFor="is_recurring" className="ml-2 block text-sm font-medium text-gray-700">
                        This is a recurring task
                      </label>
                    </div>
                    
                    {formData.is_recurring && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6 mt-2">
                        <div>
                          <label htmlFor="recurring_frequency" className="block text-sm font-medium text-gray-700">
                            Frequency
                          </label>
                          <select
                            name="recurring_frequency"
                            id="recurring_frequency"
                            className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={formData.recurring_frequency}
                            onChange={handleChange}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="recurring_ends_on" className="block text-sm font-medium text-gray-700">
                            Ends On
                          </label>
                          <input
                            type="date"
                            name="recurring_ends_on"
                            id="recurring_ends_on"
                            className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={formData.recurring_ends_on}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Assignment Section */}
            {/* Assignment Section */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('assignment')}
              >
                <h3 className="text-base font-medium text-gray-900">Assignment & Collaboration</h3>
                <span className="text-gray-500">
                  {openSections.assignment ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>
              
              {openSections.assignment && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* Primary Assignee */}
                  <div>
                    <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                      Primary Assignee
                    </label>
                    <select
                      name="assigned_to"
                      id="assigned_to"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.assigned_to}
                      onChange={handleChange}
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Additional Assignees */}
                  <div>
                    <label htmlFor="assignees" className="block text-sm font-medium text-gray-700">
                      Additional Assignees (hold Ctrl/Cmd to select multiple)
                    </label>
                    <select
                      multiple
                      name="assignees"
                      id="assignees"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-32"
                      value={formData.assignees}
                      onChange={(e) => handleMultiSelectChange(e, 'assignees')}
                    >
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple team members</p>
                  </div>
                  
                  {/* Approvers */}
                  <div>
                    <label htmlFor="approvers" className="block text-sm font-medium text-gray-700">
                      Approvers
                    </label>
                    <select
                      multiple
                      name="approvers"
                      id="approvers"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-24"
                      value={formData.approvers}
                      onChange={(e) => handleMultiSelectChange(e, 'approvers')}
                    >
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Who needs to approve this task when it's completed?</p>
                  </div>
                  
                  {/* Watchers */}
                  <div>
                    <label htmlFor="watchers" className="block text-sm font-medium text-gray-700">
                      Watchers
                    </label>
                    <select
                      multiple
                      name="watchers"
                      id="watchers"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-24"
                      value={formData.watchers}
                      onChange={(e) => handleMultiSelectChange(e, 'watchers')}
                    >
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Who should receive updates about this task?</p>
                  </div>
                  
                  {/* Visibility */}
                  <div>
                    <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                      Visibility
                    </label>
                    <select
                      name="visibility"
                      id="visibility"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.visibility}
                      onChange={handleChange}
                    >
                      <option value="team">Visible to all team members</option>
                      <option value="private">Private (visible only to assignees and approvers)</option>
                      <option value="public">Public (visible to clients and external users)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Task Relationships */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('relationships')}
              >
                <h3 className="text-base font-medium text-gray-900">Task Relationships</h3>
                <span className="text-gray-500">
                  {openSections.relationships ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>
              
              {openSections.relationships && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* Prerequisites */}
                  <div>
                    <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700">
                      Prerequisites (tasks that must be completed before this one)
                    </label>
                    <select
                      multiple
                      name="prerequisites"
                      id="prerequisites"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-24"
                      value={formData.prerequisites}
                      onChange={(e) => handleMultiSelectChange(e, 'prerequisites')}
                    >
                      <option value="" disabled>Select prerequisite tasks...</option>
                      {existingTasks.map(task => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Linked Tasks */}
                  <div>
                    <label htmlFor="linked_tasks" className="block text-sm font-medium text-gray-700">
                      Related/Linked Tasks (tasks that are related but not dependent)
                    </label>
                    <select
                      multiple
                      name="linked_tasks"
                      id="linked_tasks"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-24"
                      value={formData.linked_tasks}
                      onChange={(e) => handleMultiSelectChange(e, 'linked_tasks')}
                    >
                      <option value="" disabled>Select related tasks...</option>
                      {existingTasks.map(task => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Resources and Attachments */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('resources')}
              >
                <h3 className="text-base font-medium text-gray-900">Resources & Attachments</h3>
                <span className="text-gray-500">
                  {openSections.resources ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>
              
              {openSections.resources && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      File Attachments
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, PDF, DOC, XLS up to 10MB each
                        </p>
                      </div>
                    </div>
                    
                    {/* Show selected files */}
                    {formData.attachments.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                        <ul className="mt-1 space-y-1">
                          {formData.attachments.map((file, index) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <svg className="h-4 w-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Notes for Collaborators */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes for Collaborators
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows="3"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Additional information, context, or instructions for those working on this task..."
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
            
            {/* Additional Details */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('details')}
              >
                <h3 className="text-base font-medium text-gray-900">Goals & Measurement</h3>
                <span className="text-gray-500">
                  {openSections.details ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>
              
              {openSections.details && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* Acceptance Criteria */}
                  <div>
                    <label htmlFor="acceptance_criteria" className="block text-sm font-medium text-gray-700">
                      Acceptance Criteria / Definition of Done
                    </label>
                    <textarea
                      name="acceptance_criteria"
                      id="acceptance_criteria"
                      rows="4"
                      className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.acceptance_criteria}
                      onChange={handleChange}
                      placeholder="What needs to be true for this task to be considered complete?"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      Clear criteria help ensure quality and reduce back-and-forth during review.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Time Tracking */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('tracking')}
              >
                <h3 className="text-base font-medium text-gray-900">Time & Budget Tracking</h3>
                <span className="text-gray-500">
                  {openSections.tracking ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>
              
              {openSections.tracking && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* Time Tracking Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="time_tracking_enabled"
                      id="time_tracking_enabled"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={formData.time_tracking_enabled}
                      onChange={handleChange}
                    />
                    <label htmlFor="time_tracking_enabled" className="ml-2 block text-sm font-medium text-gray-700">
                      Enable time tracking for this task
                    </label>
                  </div>
                  
                  {formData.time_tracking_enabled && (
                    <>
                      {/* Budget Hours */}
                      <div>
                        <label htmlFor="budget_hours" className="block text-sm font-medium text-gray-700">
                          Budget (hours)
                        </label>
                        <input
                          type="number"
                          name="budget_hours"
                          id="budget_hours"
                          className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={formData.budget_hours}
                          onChange={handleChange}
                          min="0"
                          step="0.5"
                        />
                      </div>
                      
                      {/* Billable Toggle */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="is_billable"
                          id="is_billable"
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={formData.is_billable}
                          onChange={handleChange}
                        />
                        <label htmlFor="is_billable" className="ml-2 block text-sm font-medium text-gray-700">
                          This is a billable task
                        </label>
                      </div>
                      
                      {/* Client Reference */}
                      {formData.is_billable && (
                        <div>
                          <label htmlFor="client_reference" className="block text-sm font-medium text-gray-700">
                            Client Reference / PO Number
                          </label>
                          <input
                            type="text"
                            name="client_reference"
                            id="client_reference"
                            className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={formData.client_reference}
                            onChange={handleChange}
                            placeholder="e.g. PO-12345"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Submit button */}
            <div className="pt-6 flex justify-between items-center">
              <p className="text-sm text-gray-500">* Required fields</p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => navigate('/dashboard/tasks')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Task'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTask;