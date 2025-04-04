import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';

// Tab names for different settings sections
const TABS = {
  PROFILE: 'profile',
  ORGANIZATION: 'organization',
  SECURITY: 'security'
};

const passwordValidationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const passwordChangeSchema = Yup.object({
  otp: Yup.string()
    .required('OTP is required')
    .matches(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

const titleSchema = Yup.object({
  name: Yup.string().required('Title name is required'),
  description: Yup.string()
});

const Settings = () => {
  const { token, currentUser, updateProfile, resetPassword } = useContext(AuthContext);
  
  // State for current active tab
  const [activeTab, setActiveTab] = useState(TABS.PROFILE);
  
  // State for password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordChangeStep, setPasswordChangeStep] = useState(1);
  const [requestSent, setRequestSent] = useState(false);
  
  // State for user profile
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    title: '',
    timezone: 'UTC',
    phone: ''
  });
  
  // State for organization settings
  const [organization, setOrganization] = useState({
    name: '',
    industry: '',
    size: 'small'
  });
  
  // State for security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30
  });
  
  // State for titles
  const [titles, setTitles] = useState([]);
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [titlesLoading, setTitlesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
  
  // Fetch settings data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Fetch user profile from current user context
        if (currentUser) {
          setProfile({
            name: currentUser.name || '',
            email: currentUser.email || '',
            title: currentUser.title || '',
            timezone: currentUser.timezone || 'UTC',
            phone: currentUser.phone || ''
          });
        }
        
        // Fetch organization data
        try {
          const orgResponse = await axios.get(`${API_URL}/organizations/`, { headers });
          setOrganization(orgResponse.data);
        } catch (orgError) {
          console.error("Failed to load organization data:", orgError);
        }
        
        // Fetch titles
        await fetchTitles();
        
        setError(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchSettings();
    }
  }, [token, currentUser]);
  
  // Fetch titles
  const fetchTitles = async () => {
    try {
      setTitlesLoading(true);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.get(`${API_URL}/titles/`, { headers });
      setTitles(response.data);
      
    } catch (err) {
      console.error('Error fetching titles:', err);
      // Don't set main error for titles loading, just log it
    } finally {
      setTitlesLoading(false);
    }
  };
  
  // Profile form handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      await axios.patch(`${API_URL}/auth/me/`, profile, { headers });
      
      if (updateProfile) {
        await updateProfile(profile);
      }
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Organization form handlers
  const handleOrganizationChange = (e) => {
    const { name, value } = e.target;
    setOrganization(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOrganizationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      await axios.patch(`${API_URL}/organizations/${organization.id}/`, organization, { headers });
      
      setSuccess('Organization settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating organization:', err);
      setError('Failed to update organization settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Security form handlers
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  
  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      await axios.post(`${API_URL}/settings/security/`, securitySettings, { headers });
      
      setSuccess('Security settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating security settings:', err);
      setError('Failed to update security settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Password reset handler (first step)
  const handleRequestOTP = async (values, { setSubmitting, setErrors }) => {
    try {
      setError(null);
      await resetPassword(values.email);
      setPasswordChangeStep(2);
      setRequestSent(true);
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
      setErrors({ email: 'Failed to send OTP' });
    } finally {
      setSubmitting(false);
    }
  };

  // Password change handler (second step)
  const handleChangePassword = async (values, { setSubmitting, setErrors }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make API call to validate OTP and change password
      await axios.post(`${API_URL}/auth/password-reset-confirm/`, {
        email: profile.email,
        otp: values.otp,
        password: values.newPassword,
      });
      
      setSuccess('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordChangeStep(1);
      setRequestSent(false);
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please check your OTP and try again.');
      setErrors({ otp: 'Invalid OTP code' });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  
  // Title form handlers
  const handleTitleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    try {
      setError(null);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      if (editingTitle) {
        // Update existing title
        await axios.put(`${API_URL}/titles/${editingTitle.id}/`, values, { headers });
        setSuccess('Title updated successfully');
      } else {
        // Create new title
        await axios.post(`${API_URL}/titles/`, values, { headers });
        setSuccess('Title created successfully');
      }
      
      // Refresh titles list
      fetchTitles();
      
      // Reset form and close modal
      resetForm();
      setTitleModalOpen(false);
      setEditingTitle(null);
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error saving title:', err);
      setError('Failed to save title. Please try again.');
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle editing a title
  const handleEditTitle = (title) => {
    setEditingTitle(title);
    setTitleModalOpen(true);
  };
  
  // Handle deleting a title
  const handleDeleteTitle = async (titleId) => {
    if (!window.confirm('Are you sure you want to delete this title? This may affect team members with this title.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      await axios.delete(`${API_URL}/titles/${titleId}/`, { headers });
      
      setSuccess('Title deleted successfully');
      
      // Refresh titles list
      fetchTitles();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error deleting title:', err);
      setError('Failed to delete title. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
        
        {/* Loading, error and success states */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
        
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
        
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Settings Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === TABS.PROFILE ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab(TABS.PROFILE)}
          >
            User Profile
          </button>
          <button
            className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === TABS.ORGANIZATION ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab(TABS.ORGANIZATION)}
          >
            Organization
          </button>
          <button
            className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === TABS.SECURITY ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab(TABS.SECURITY)}
          >
            Security
          </button>
        </div>
        
        {/* Profile Settings */}
        {activeTab === TABS.PROFILE && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">User Profile</h3>
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed.</p>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={profile.title}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={profile.timezone}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="America/Chicago">Central Time (US & Canada)</option>
                      <option value="America/Denver">Mountain Time (US & Canada)</option>
                      <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Australia/Sydney">Sydney</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Organization Settings */}
        {activeTab === TABS.ORGANIZATION && (
          <>
            {/* Organization Details Form */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Organization Details</h3>
                <form onSubmit={handleOrganizationSubmit}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="col-span-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Organization Name</label>
                      <input
                        type="text"
                        name="name"
                        id="org-name"
                        value={organization.name}
                        onChange={handleOrganizationChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industry</label>
                      <input
                        type="text"
                        name="industry"
                        id="industry"
                        value={organization.industry}
                        onChange={handleOrganizationChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <label htmlFor="size" className="block text-sm font-medium text-gray-700">Company Size</label>
                      <select
                        id="size"
                        name="size"
                        value={organization.size}
                        onChange={handleOrganizationChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="small">Small (1-10 employees)</option>
                        <option value="medium">Medium (11-50 employees)</option>
                        <option value="large">Large (51-200 employees)</option>
                        <option value="enterprise">Enterprise (201+ employees)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Team Titles Management */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Team Titles</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTitle(null);
                      setTitleModalOpen(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Title
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mb-6">
                  Define titles for your team members. These titles will be available when inviting new team members.
                </p>
                
                {/* Loading state for titles */}
                {titlesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Empty state */}
                    {titles.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No titles defined</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating your first team title.
                        </p>
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTitle(null);
                              setTitleModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Create Title
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Titles list */
                      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {titles.map((title) => (
                              <tr key={title.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {title.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {title.description || <span className="text-gray-400 italic">No description</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleEditTitle(title)}
                                    className="text-primary-600 hover:text-primary-900 mr-4"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTitle(title.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Security Settings */}
        {activeTab === TABS.SECURITY && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Security Settings</h3>
              <form onSubmit={handleSecuritySubmit}>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="twoFactorAuth"
                        name="twoFactorAuth"
                        type="checkbox"
                        checked={securitySettings.twoFactorAuth}
                        onChange={handleSecurityChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="twoFactorAuth" className="font-medium text-gray-700">
                        Two-Factor Authentication
                      </label>
                      <p className="text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                    <div className="mt-1">
                      <select
                        id="sessionTimeout"
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecurityChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="240">4 hours</option>
                      </select>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Automatically log out after period of inactivity</p>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Change Password
                    </h3>
                    <div className="mt-4">
                      {passwordChangeStep === 1 ? (
                        <Formik
                          initialValues={{
                            email: profile.email || '',
                          }}
                          validationSchema={passwordValidationSchema}
                          onSubmit={handleRequestOTP}
                        >
                          {({ isSubmitting, errors, touched }) => (
                            <Form className="space-y-6">
                              <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                  Email address
                                </label>
                                <Field
                                  id="email"
                                  name="email"
                                  type="email"
                                  autoComplete="email"
                                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${errors.email && touched.email ? 'border-red-500' : ''}`}
                                  disabled={true}
                                />
                                <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                                <p className="mt-1 text-sm text-gray-500">
                                  We'll send a 6-digit OTP code to this email to verify your identity.
                                </p>
                              </div>

                              <div>
                                <button
                                  type="submit"
                                  disabled={isSubmitting || loading}
                                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                  {isSubmitting || loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      ) : (
                        <Formik
                          initialValues={{
                            otp: '',
                            newPassword: '',
                            confirmPassword: '',
                          }}
                          validationSchema={passwordChangeSchema}
                          onSubmit={handleChangePassword}
                        >
                          {({ isSubmitting, errors, touched }) => (
                            <Form className="space-y-6">
                              <div>
                                <div className="rounded-md bg-blue-50 p-4 mb-4">
                                  <div className="flex">
                                    <div className="flex-shrink-0">
                                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div className="ml-3 flex-1 md:flex md:justify-between">
                                      <p className="text-sm text-blue-700">
                                        A 6-digit OTP has been sent to your email address.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                  Enter OTP
                                </label>
                                <Field
                                  id="otp"
                                  name="otp"
                                  type="text"
                                  maxLength="6"
                                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${errors.otp && touched.otp ? 'border-red-500' : ''}`}
                                />
                                <ErrorMessage name="otp" component="div" className="mt-1 text-sm text-red-600" />
                              </div>

                              <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                  New Password
                                </label>
                                <Field
                                  id="newPassword"
                                  name="newPassword"
                                  type="password"
                                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${errors.newPassword && touched.newPassword ? 'border-red-500' : ''}`}
                                />
                                <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600" />
                              </div>

                              <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                  Confirm New Password
                                </label>
                                <Field
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  type="password"
                                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                                />
                                <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                              </div>

                              <div>
                                <button
                                  type="submit"
                                  disabled={isSubmitting || loading}
                                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                  {isSubmitting || loading ? 'Changing Password...' : 'Change Password'}
                                </button>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordChangeStep(1);
                    setRequestSent(false);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Title Modal (Add/Edit) */}
      {titleModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {editingTitle ? 'Edit Title' : 'Add New Title'}
                    </h3>
                    <div className="mt-4">
                      <Formik
                        initialValues={{
                          name: editingTitle ? editingTitle.name : '',
                          description: editingTitle ? editingTitle.description || '' : ''
                        }}
                        validationSchema={titleSchema}
                        onSubmit={handleTitleSubmit}
                      >
                        {({ isSubmitting, errors, touched }) => (
                          <Form className="space-y-6">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Title Name
                              </label>
                              <Field
                                id="name"
                                name="name"
                                type="text"
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${errors.name && touched.name ? 'border-red-500' : ''}`}
                              />
                              <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                            </div>

                            <div>
                              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                              </label>
                              <Field
                                as="textarea"
                                id="description"
                                name="description"
                                rows={3}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${errors.description && touched.description ? 'border-red-500' : ''}`}
                                placeholder="Brief description of this role/title"
                              />
                              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                            </div>

                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setTitleModalOpen(false);
                                  setEditingTitle(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                {isSubmitting ? 
                                  (editingTitle ? 'Updating...' : 'Creating...') : 
                                  (editingTitle ? 'Update Title' : 'Create Title')
                                }
                              </button>
                            </div>
                          </Form>
                        )}
                      </Formik>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;