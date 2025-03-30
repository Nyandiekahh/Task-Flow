import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

// Tab names for different settings sections
const TABS = {
  PROFILE: 'profile',
  ORGANIZATION: 'organization',
  SECURITY: 'security'
};

const Settings = () => {
  const { token, currentUser, updateProfile } = useContext(AuthContext);
  
  // State for current active tab
  const [activeTab, setActiveTab] = useState(TABS.PROFILE);
  
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
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Fetch settings data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
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
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
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
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
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
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
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
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Organization Settings</h3>
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
                      onClick={() => setSuccess('Password change feature would be shown here')}
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
    </div>
  );
};

export default Settings;