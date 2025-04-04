import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TitleModal = ({ isOpen, onClose, onSave, title = null, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    roles: []
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset form when modal opens/closes or title changes
    if (isOpen) {
      if (title) {
        // Edit mode - populate with existing data
        setFormData({
          name: title.name || '',
          description: title.description || '',
          roles: title.roles || []
        });
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          description: '',
          roles: []
        });
      }
      fetchAvailableRoles();
    }
  }, [isOpen, title]);

  const fetchAvailableRoles = async () => {
    try {
      setRolesLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.get(`${API_URL}/roles/`, { headers });
      setAvailableRoles(response.data);
    } catch (err) {
      console.error("Failed to load roles:", err);
      setError("Failed to load roles. Some features may be limited.");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleToggle = (roleId) => {
    setFormData(prev => {
      // Check if role is already selected
      if (prev.roles.includes(roleId)) {
        // Remove it
        return {
          ...prev,
          roles: prev.roles.filter(id => id !== roleId)
        };
      } else {
        // Add it
        return {
          ...prev,
          roles: [...prev.roles, roleId]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call the parent's save handler
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving title:', err);
      setError('Failed to save title. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
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
                  {title ? 'Edit Job Title' : 'Create New Job Title'}
                </h3>
                
                {error && (
                  <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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
                
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Title Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="Brief description of this job title and its responsibilities"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Roles for this Title
                        </label>
                        {rolesLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {availableRoles.map((role) => (
                              <div key={role.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`role-${role.id}`}
                                  checked={formData.roles.includes(role.id)}
                                  onChange={() => handleRoleToggle(role.id)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`role-${role.id}`} className="ml-2 block text-sm text-gray-900">
                                  {role.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                        {availableRoles.length === 0 && !rolesLoading && (
                          <p className="text-sm text-gray-500 mt-2">No roles available. Please create roles first.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {loading ? 'Saving...' : (title ? 'Update' : 'Create')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleModal;