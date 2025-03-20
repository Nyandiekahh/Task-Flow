import React, { useContext, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingContext } from '../../context/OnboardingContext';

const validationSchema = Yup.object({
  name: Yup.string().required('Role name is required'),
  description: Yup.string().required('Description is required'),
  permissions: Yup.array().min(1, 'Select at least one permission')
});

const allPermissions = [
  { id: 'create_tasks', name: 'Create Tasks', description: 'Can create new tasks in the system' },
  { id: 'view_tasks', name: 'View Tasks', description: 'Can view tasks assigned to them or their team' },
  { id: 'assign_tasks', name: 'Assign Tasks', description: 'Can assign tasks to other team members' },
  { id: 'update_tasks', name: 'Update Tasks', description: 'Can update task details and progress' },
  { id: 'delete_tasks', name: 'Delete Tasks', description: 'Can permanently delete tasks' },
  { id: 'approve_tasks', name: 'Approve Tasks', description: 'Can review and approve completed tasks' },
  { id: 'reject_tasks', name: 'Reject Tasks', description: 'Can reject tasks and request changes' },
  { id: 'comment', name: 'Comment', description: 'Can leave comments on tasks' },
  { id: 'view_reports', name: 'View Reports', description: 'Can access analytics and reporting' },
  { id: 'manage_users', name: 'Manage Users', description: 'Can add, edit, and remove users' },
  { id: 'manage_roles', name: 'Manage Roles', description: 'Can create and modify roles and permissions' }
];

const Step3Roles = () => {
  const { onboardingData, addRole, removeRole, updateRole } = useContext(OnboardingContext);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  
  const handleAddRole = (values, { resetForm }) => {
    addRole({
      name: values.name,
      description: values.description,
      permissions: values.permissions
    });
    resetForm();
    setIsAddingRole(false);
  };
  
  const handleUpdateRole = (values, { resetForm }) => {
    updateRole(editingRoleId, {
      name: values.name,
      description: values.description,
      permissions: values.permissions
    });
    resetForm();
    setEditingRoleId(null);
  };
  
  const startEditing = (role) => {
    setEditingRoleId(role.id);
    setIsAddingRole(false);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Configure Roles & Permissions</h2>
        <p className="text-secondary-600 mb-8">
          Define the roles in your organization and the permissions each role should have.
          You can customize these further at any time.
        </p>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-secondary-900">Roles</h3>
            {!isAddingRole && !editingRoleId && (
              <button
                type="button"
                onClick={() => setIsAddingRole(true)}
                className="btn btn-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Role
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {(isAddingRole || editingRoleId) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-secondary-50 rounded-lg p-6 mb-6 border border-secondary-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-secondary-900">
                    {editingRoleId ? 'Edit Role' : 'Add a new role'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingRole(false);
                      setEditingRoleId(null);
                    }}
                    className="text-secondary-500 hover:text-secondary-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <Formik
                  initialValues={
                    editingRoleId
                      ? {
                          name: onboardingData.roles.find(r => r.id === editingRoleId)?.name || '',
                          description: onboardingData.roles.find(r => r.id === editingRoleId)?.description || '',
                          permissions: onboardingData.roles.find(r => r.id === editingRoleId)?.permissions || []
                        }
                      : {
                          name: '',
                          description: '',
                          permissions: []
                        }
                  }
                  validationSchema={validationSchema}
                  onSubmit={editingRoleId ? handleUpdateRole : handleAddRole}
                >
                  {({ isSubmitting, errors, touched, values }) => (
                    <Form className="space-y-6">
                      <div>
                        <label htmlFor="name" className="label">
                          Role Name
                        </label>
                        <Field
                          id="name"
                          name="name"
                          type="text"
                          className={`input ${errors.name && touched.name ? 'border-danger-500' : ''}`}
                          placeholder="e.g., Project Manager"
                        />
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-danger-600" />
                      </div>

                      <div>
                        <label htmlFor="description" className="label">
                          Description
                        </label>
                        <Field
                          as="textarea"
                          id="description"
                          name="description"
                          rows={3}
                          className={`input ${errors.description && touched.description ? 'border-danger-500' : ''}`}
                          placeholder="Describe the responsibilities of this role"
                        />
                        <ErrorMessage name="description" component="div" className="mt-1 text-sm text-danger-600" />
                      </div>

                      <div>
                        <label className="label">
                          Permissions
                        </label>
                        <div className="mt-2 bg-white rounded-lg border border-secondary-200 p-3">
                          <FieldArray name="permissions">
                            {() => (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {allPermissions.map((permission) => (
                                  <div key={permission.id} className="flex items-start">
                                    <div className="flex items-center h-5">
                                      <Field
                                        type="checkbox"
                                        name="permissions"
                                        value={permission.id}
                                        className="h-4 w-4 text-primary-600 border-secondary-300 rounded"
                                      />
                                    </div>
                                    <div className="ml-3 text-sm">
                                      <label className="font-medium text-secondary-700">{permission.name}</label>
                                      <p className="text-secondary-500">{permission.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </FieldArray>
                          {errors.permissions && touched.permissions && (
                            <div className="mt-2 text-sm text-danger-600">{errors.permissions}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingRole(false);
                            setEditingRoleId(null);
                          }}
                          className="btn btn-secondary mr-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn btn-primary"
                        >
                          {isSubmitting 
                            ? (editingRoleId ? 'Updating...' : 'Adding...') 
                            : (editingRoleId ? 'Update Role' : 'Add Role')}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </motion.div>
            )}
          </AnimatePresence>

          {onboardingData.roles.length > 0 ? (
            <div className="space-y-4">
              {onboardingData.roles.map((role) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg border border-secondary-200 overflow-hidden"
                >
                  <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold text-secondary-900">{role.name}</h4>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => startEditing(role)}
                          className="text-primary-600 hover:text-primary-800"
                          disabled={editingRoleId !== null || isAddingRole}
                        >
                          Edit
                        </button>
                        {/* Don't allow removing the Admin role */}
                        {role.name !== 'Admin' && (
                          <button
                            type="button"
                            onClick={() => removeRole(role.id)}
                            className="text-danger-600 hover:text-danger-800"
                            disabled={editingRoleId !== null || isAddingRole}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-secondary-600 mt-1">{role.description}</p>
                    
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-secondary-700 mb-2">Permissions:</h5>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((permId) => {
                          const permission = allPermissions.find(p => p.id === permId);
                          return permission ? (
                            <span 
                              key={permId} 
                              className="px-2 py-1 text-xs bg-secondary-100 text-secondary-800 rounded-full"
                              title={permission.description}
                            >
                              {permission.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-secondary-50 rounded-lg border border-dashed border-secondary-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-secondary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-secondary-900">No roles defined</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Get started by creating your first role.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddingRole(true)}
                  className="btn btn-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Role
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-secondary-600 bg-secondary-50 p-4 rounded-lg border border-secondary-200">
          <p className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Role management helps maintain security and workflow efficiency. You can customize roles and permissions anytime in your account settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Step3Roles;