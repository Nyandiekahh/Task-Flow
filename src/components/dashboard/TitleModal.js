import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TitleModal = ({ isOpen, onClose, onSave, title = null, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] // This will store permission IDs from selected roles
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
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
          permissions: title.permissions || []
        });
        
        // Find which roles contain the permissions assigned to this title
        const titlePermissionIds = title.permissions || [];
        const rolesForTitle = availableRoles.filter(role => 
          role.permissions.some(permission => 
            titlePermissionIds.includes(permission.id)
          )
        );
        setSelectedRoles(rolesForTitle.map(role => role.id));
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          description: '',
          permissions: []
        });
        setSelectedRoles([]);
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
    const role = availableRoles.find(r => r.id === roleId);
    if (!role) return;

    setSelectedRoles(prev => {
      let newSelectedRoles;
      if (prev.includes(roleId)) {
        // Remove role
        newSelectedRoles = prev.filter(id => id !== roleId);
      } else {
        // Add role
        newSelectedRoles = [...prev, roleId];
      }

      // Update permissions based on selected roles
      const allPermissions = new Set();
      newSelectedRoles.forEach(selectedRoleId => {
        const selectedRole = availableRoles.find(r => r.id === selectedRoleId);
        if (selectedRole && selectedRole.permissions) {
          selectedRole.permissions.forEach(permission => {
            allPermissions.add(permission.id);
          });
        }
      });

      setFormData(prev => ({
        ...prev,
        permissions: Array.from(allPermissions)
      }));

      return newSelectedRoles;
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

  const getSelectedPermissions = () => {
    const allPermissions = new Set();
    selectedRoles.forEach(roleId => {
      const role = availableRoles.find(r => r.id === roleId);
      if (role && role.permissions) {
        role.permissions.forEach(permission => {
          allPermissions.add(permission);
        });
      }
    });
    return Array.from(allPermissions);
  };

  if (!isOpen) return null;

  const selectedPermissions = getSelectedPermissions();

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
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
                    <div className="space-y-6">
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
                          placeholder="e.g., Senior Developer, Project Manager"
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
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Assign Roles to this Title
                        </label>
                        {rolesLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {availableRoles.map((role) => (
                              <div key={role.id} className="border rounded-lg p-3">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`role-${role.id}`}
                                    checked={selectedRoles.includes(role.id)}
                                    onChange={() => handleRoleToggle(role.id)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  />
                                  <div className="ml-3 flex-1">
                                    <label htmlFor={`role-${role.id}`} className="block text-sm font-medium text-gray-900">
                                      {role.name}
                                    </label>
                                    {role.description && (
                                      <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                                    )}
                                    {role.permissions && role.permissions.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {role.permissions.slice(0, 3).map((permission) => (
                                          <span key={permission.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            {permission.name}
                                          </span>
                                        ))}
                                        {role.permissions.length > 3 && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            +{role.permissions.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {availableRoles.length === 0 && !rolesLoading && (
                          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">No roles available.</p>
                            <p className="text-sm text-gray-500">Create roles first to assign them to titles.</p>
                          </div>
                        )}
                      </div>

                      {selectedPermissions.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Permissions Granted by Selected Roles
                          </label>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex flex-wrap gap-2">
                              {selectedPermissions.map((permission) => (
                                <span key={permission.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {permission.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
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
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
                      >
                        {loading ? 'Saving...' : (title ? 'Update Title' : 'Create Title')}
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