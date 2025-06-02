import React, { useState, useEffect } from 'react';

const RoleModal = ({ isOpen, onClose, onSave, role = null, permissions = [], token }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permission_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset form when modal opens/closes or role changes
    if (isOpen) {
      if (role) {
        // Edit mode - populate with existing data
        setFormData({
          name: role.name || '',
          description: role.description || '',
          permission_ids: role.permissions ? role.permissions.map(p => p.id) : []
        });
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          description: '',
          permission_ids: []
        });
      }
    }
  }, [isOpen, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => {
      // Check if permission is already selected
      if (prev.permission_ids.includes(permissionId)) {
        // Remove it
        return {
          ...prev,
          permission_ids: prev.permission_ids.filter(id => id !== permissionId)
        };
      } else {
        // Add it
        return {
          ...prev,
          permission_ids: [...prev.permission_ids, permissionId]
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
      console.error('Error saving role:', err);
      setError('Failed to save role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by category for better organization
  const groupPermissionsByCategory = () => {
    const groups = {
      'Task Management': [],
      'User Management': [],
      'Reports & Analytics': [],
      'Other': []
    };

    permissions.forEach(permission => {
      if (permission.code.includes('task')) {
        groups['Task Management'].push(permission);
      } else if (permission.code.includes('user') || permission.code.includes('role')) {
        groups['User Management'].push(permission);
      } else if (permission.code.includes('report')) {
        groups['Reports & Analytics'].push(permission);
      } else {
        groups['Other'].push(permission);
      }
    });

    return groups;
  };

  if (!isOpen) return null;

  const permissionGroups = groupPermissionsByCategory();

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
                  {role ? 'Edit Role' : 'Create New Role'}
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
                          Role Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="e.g., Project Manager, Developer, Admin"
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
                          placeholder="Brief description of this role and its responsibilities"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Permissions
                        </label>
                        <div className="space-y-6">
                          {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => (
                            groupPermissions.length > 0 && (
                              <div key={groupName}>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">{groupName}</h4>
                                <div className="grid grid-cols-1 gap-3">
                                  {groupPermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-start">
                                      <div className="flex items-center h-5">
                                        <input
                                          type="checkbox"
                                          id={`permission-${permission.id}`}
                                          checked={formData.permission_ids.includes(permission.id)}
                                          onChange={() => handlePermissionToggle(permission.id)}
                                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                      </div>
                                      <div className="ml-3 text-sm">
                                        <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-700">
                                          {permission.name}
                                        </label>
                                        {permission.description && (
                                          <p className="text-gray-500 mt-1">{permission.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                        {permissions.length === 0 && (
                          <p className="text-sm text-gray-500 mt-2">No permissions available.</p>
                        )}
                      </div>
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
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
                      >
                        {loading ? 'Saving...' : (role ? 'Update Role' : 'Create Role')}
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

export default RoleModal;