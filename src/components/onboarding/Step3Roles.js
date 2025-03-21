// src/components/onboarding/Step3Roles.js

import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingContext } from '../../context/OnboardingContext';
import { rolesAPI } from '../../services/api';

const validationSchema = Yup.object({
  permissions: Yup.array().min(1, 'Select at least one permission')
});

const Step3Roles = () => {
  const { onboardingData, addRole, removeRole, updateRole, titles, nextStep } = useContext(OnboardingContext);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [titlesWithPermissions, setTitlesWithPermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Check if organization exists
  useEffect(() => {
    if (!onboardingData.organization || !onboardingData.organization.id) {
      const msg = 'You must create an organization before configuring roles';
      setError(msg);
      
      // Redirect after a short delay to allow the error message to be seen
      const timer = setTimeout(() => {
        navigate('/onboarding/org-details');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [onboardingData.organization, navigate]);
  
  // Fetch all permissions when component mounts
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const permissions = await rolesAPI.getPermissions();
        setAllPermissions(permissions);
      } catch (err) {
        setError('Failed to load permissions: ' + err.message);
        console.error('Error fetching permissions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPermissions();
  }, []);
  
  // Extract titles and map them to permissions
  useEffect(() => {
    if (!titles || titles.length === 0) {
      console.log('No titles available yet');
      return;
    }

    console.log('Titles from context:', titles);
    console.log('Roles from onboardingData:', onboardingData.roles);
    
    // Get all existing roles
    const existingRoles = onboardingData.roles || [];
    
    // Map each title to its permissions (if already assigned)
    const mappedTitles = titles.map(title => {
      // Try to find if there's a role already created for this title
      const existingRole = existingRoles.find(role => 
        role.name === title.name || role.title_id === title.id
      );
      
      return {
        title: title.name,
        titleId: title.id,
        id: existingRole?.id || `title_${title.id}`,
        permissions: existingRole?.permissions?.map(p => p.id) || [],
        description: existingRole?.description || `Permissions for ${title.name}`
      };
    });
    
    console.log('Mapped titles with permissions:', mappedTitles);
    setTitlesWithPermissions(mappedTitles);
  }, [titles, onboardingData.roles]);

  const handleUpdatePermissions = async (values, { resetForm }) => {
    try {
      // Check if organization exists
      if (!onboardingData.organization || !onboardingData.organization.id) {
        throw new Error('You must create an organization before configuring roles');
      }
      
      const titleToUpdate = titlesWithPermissions.find(t => t.id === editingTitleId);
      if (!titleToUpdate) {
        throw new Error('Title not found');
      }
      
      console.log('Updating permissions for title:', titleToUpdate);
      
      // Safely check if this title already exists as a role
      const roles = onboardingData.roles || [];
      const existingRole = roles.find(role => 
        role.id === editingTitleId || 
        role.name === titleToUpdate.title || 
        role.title_id === titleToUpdate.titleId
      );
      
      if (existingRole) {
        // Update existing role
        console.log('Updating existing role:', existingRole.id);
        await updateRole(existingRole.id, {
          name: titleToUpdate.title,
          description: titleToUpdate.description,
          permissions: values.permissions,
          title_id: titleToUpdate.titleId  // Include title_id in the update
        });
      } else {
        // Create new role based on title
        console.log('Creating new role for title:', titleToUpdate);
        await addRole({
          name: titleToUpdate.title,
          description: titleToUpdate.description,
          permissions: values.permissions,
          title_id: titleToUpdate.titleId  // Include title_id when creating
        });
      }
      
      // Update local state
      setTitlesWithPermissions(prev => 
        prev.map(t => t.id === editingTitleId 
          ? { ...t, permissions: values.permissions } 
          : t
        )
      );
      
      resetForm();
      setEditingTitleId(null);
    } catch (err) {
      setError('Failed to update role: ' + err.message);
      console.error('Error updating role:', err);
    }
  };
  
  const startEditing = (titleId) => {
    setEditingTitleId(titleId);
  };

  // Helper to get permissions for a title
  const getTitlePermissions = (titleId) => {
    const title = titlesWithPermissions.find(t => t.id === titleId);
    if (!title) return [];
    
    // Try to find an existing role with the same name or ID
    const roles = onboardingData.roles || [];
    const existingRole = roles.find(
      role => role.id === titleId || 
             role.name === title.title || 
             role.title_id === title.titleId
    );
    
    return existingRole?.permissions?.map(p => p.id) || title.permissions || [];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Configure Permissions for Titles</h2>
        <p className="text-secondary-600 mb-8">
          Assign permissions to each title in your organization. These permissions will determine what actions team members with each title can perform.
        </p>

        {error && (
          <div className="mb-4 bg-danger-50 border-l-4 border-danger-500 text-danger-700 px-4 py-3 rounded">
            <p>{error}</p>
            {(!onboardingData.organization || !onboardingData.organization.id) && (
              <p className="mt-2">
                Redirecting to organization creation...
              </p>
            )}
          </div>
        )}

        {/* Only show the rest of the content if organization exists */}
        {onboardingData.organization && onboardingData.organization.id && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-secondary-900">Title Permissions</h3>
            </div>
            
            <AnimatePresence>
              {editingTitleId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-secondary-50 rounded-lg p-6 mb-6 border border-secondary-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-secondary-900">
                      Assign Permissions for "{titlesWithPermissions.find(t => t.id === editingTitleId)?.title}"
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingTitleId(null)}
                      className="text-secondary-500 hover:text-secondary-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <Formik
                    initialValues={{
                      permissions: getTitlePermissions(editingTitleId)
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleUpdatePermissions}
                  >
                    {({ isSubmitting, errors, touched, values }) => (
                      <Form className="space-y-6">
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
                                          value={permission.id.toString()}
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
                            onClick={() => setEditingTitleId(null)}
                            className="btn btn-secondary mr-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                          >
                            {isSubmitting ? 'Saving...' : 'Save Permissions'}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </motion.div>
              )}
            </AnimatePresence>

            {titlesWithPermissions.length > 0 ? (
              <div className="space-y-4">
                {titlesWithPermissions.map((titleItem) => {
                  // Find if this title exists as a role with permissions
                  const roles = onboardingData.roles || [];
                  const roleWithPermissions = roles.find(
                    role => role.id === titleItem.id || 
                           role.name === titleItem.title ||
                           role.title_id === titleItem.titleId
                  );
                  
                  const permissionIds = roleWithPermissions?.permissions?.map(p => p.id) || titleItem.permissions || [];
                  
                  return (
                    <motion.div
                      key={titleItem.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-lg border border-secondary-200 overflow-hidden"
                    >
                      <div className="px-6 py-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold text-secondary-900">{titleItem.title}</h4>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => startEditing(titleItem.id)}
                              className="text-primary-600 hover:text-primary-800"
                              disabled={editingTitleId !== null}
                            >
                              {permissionIds.length > 0 ? 'Edit Permissions' : 'Assign Permissions'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          {permissionIds.length > 0 ? (
                            <>
                              <h5 className="text-sm font-medium text-secondary-700 mb-2">Assigned Permissions:</h5>
                              <div className="flex flex-wrap gap-2">
                                {permissionIds.map((permId) => {
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
                            </>
                          ) : (
                            <div className="text-secondary-500 mt-2 text-sm italic">
                              No permissions assigned yet. Click 'Assign Permissions' to configure.
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
                <h3 className="mt-2 text-sm font-medium text-secondary-900">No titles found</h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Please add titles in the previous step before configuring permissions.
                </p>
              </div>
            )}
          </div>
        )}

        {onboardingData.organization && onboardingData.organization.id && (
          <>
            <div className="text-secondary-600 bg-secondary-50 p-4 rounded-lg border border-secondary-200 mb-8">
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Permission management helps maintain security and workflow efficiency. You can customize permissions for each title anytime in your account settings.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  nextStep();
                  navigate('/onboarding/complete');
                }}
                className="btn btn-primary px-6 py-2"
              >
                Continue to Complete Setup
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Step3Roles;