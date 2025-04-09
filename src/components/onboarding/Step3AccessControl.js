// src/components/onboarding/Step3AccessControl.js

import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingContext } from '../../context/OnboardingContext';

// Validation schema
const validationSchema = Yup.object({
  permission_ids: Yup.array().min(1, 'Select at least one permission')
});

const Step3AccessControl = () => {
  const { 
    onboardingData, 
    addRole, 
    updateRole, 
    nextStep, 
    error: contextError 
  } = useContext(OnboardingContext);
  
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Check if organization and titles exist
  useEffect(() => {
    if (!onboardingData.organization || !onboardingData.organization.id) {
      const msg = 'You must create an organization before configuring access control';
      setError(msg);
      
      // Redirect after a short delay
      const timer = setTimeout(() => {
        navigate('/onboarding/org-details');
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (!onboardingData.titles || onboardingData.titles.length === 0) {
      const msg = 'You must create titles before configuring access control';
      setError(msg);
      
      // Redirect after a short delay
      const timer = setTimeout(() => {
        navigate('/onboarding/team-members');
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setError(null);
    }
  }, [onboardingData.organization, onboardingData.titles, navigate]);
  
  // Update error state when context error changes
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);
  
  // Fetch all permissions when component mounts
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/api/v1/permissions/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        setAllPermissions(response.data);
      } catch (err) {
        setError('Failed to load permissions: ' + (err.message || 'Unknown error'));
        console.error('Error fetching permissions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPermissions();
  }, [API_URL]);
  
  // Handle updating permissions for a title
  const handleUpdatePermissions = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      // Check if organization exists
      if (!onboardingData.organization || !onboardingData.organization.id) {
        throw new Error('You must create an organization before configuring access control');
      }
      
      const titleToUpdate = onboardingData.titles.find(t => t.id === editingTitleId);
      if (!titleToUpdate) {
        throw new Error('Title not found');
      }
      
      // Find if there's already a role for this title
      const existingRole = (onboardingData.roles || []).find(
        role => role.name === titleToUpdate.name || role.title_id === titleToUpdate.id
      );
      
      if (existingRole) {
        // Update existing role
        await updateRole(existingRole.id, {
          name: titleToUpdate.name,
          description: titleToUpdate.description || `Permissions for ${titleToUpdate.name}`,
          permission_ids: values.permission_ids
        });
      } else {
        // Create new role based on title
        await addRole({
          name: titleToUpdate.name,
          description: titleToUpdate.description || `Permissions for ${titleToUpdate.name}`,
          permission_ids: values.permission_ids,
          title_id: titleToUpdate.id
        });
      }
      
      setEditingTitleId(null);
    } catch (err) {
      setError(err.message || 'Failed to update permissions');
      console.error('Error updating permissions:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get permissions for a title
  const getTitlePermissions = (titleId) => {
    const title = onboardingData.titles.find(t => t.id === titleId);
    if (!title) return [];
    
    // Try to find an existing role with the same name or ID
    const existingRole = (onboardingData.roles || []).find(
      role => role.name === title.name || role.title_id === title.id
    );
    
    if (existingRole && existingRole.permissions) {
      return existingRole.permissions.map(p => p.id.toString());
    }
    
    return [];
  };
  
  // Check if title has permissions assigned
  const hasTitlePermissions = (titleId) => {
    return getTitlePermissions(titleId).length > 0;
  };
  
  // Check if all titles have permissions
  const allTitlesHavePermissions = () => {
    return onboardingData.titles && 
           onboardingData.titles.length > 0 && 
           onboardingData.titles.every(title => hasTitlePermissions(title.id));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-secondary-600">Loading permissions...</p>
        </div>
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
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Configure Access Control</h2>
        <p className="text-secondary-600 mb-8">
          Assign permissions to each title in your organization. These permissions determine what actions team members with each title can perform.
        </p>

        {/* Display errors */}
        {error && (
          <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-4 mb-6 rounded">
            <p>{error}</p>
            {(!onboardingData.organization || !onboardingData.organization.id) && (
              <p className="mt-2">
                Redirecting to organization setup...
              </p>
            )}
            {(onboardingData.organization && (!onboardingData.titles || onboardingData.titles.length === 0)) && (
              <p className="mt-2">
                Redirecting to team structure setup...
              </p>
            )}
          </div>
        )}

        {/* Continue only if we have an organization and titles */}
        {onboardingData.organization && onboardingData.organization.id && 
         onboardingData.titles && onboardingData.titles.length > 0 && (
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
                      Assign Permissions for "{onboardingData.titles.find(t => t.id === editingTitleId)?.name}"
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
                      permission_ids: getTitlePermissions(editingTitleId)
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleUpdatePermissions}
                  >
                    {({ isSubmitting, errors, touched, values }) => (
                      <Form className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Permissions
                          </label>
                          <div className="mt-2 bg-white rounded-lg border border-secondary-200 p-4">
                            <FieldArray name="permission_ids">
                              {() => (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                  {allPermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-start">
                                      <div className="flex items-center h-5">
                                        <Field
                                          type="checkbox"
                                          name="permission_ids"
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
                            {errors.permission_ids && touched.permission_ids && (
                              <div className="mt-2 text-sm text-danger-600">{errors.permission_ids}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingTitleId(null)}
                            className="mr-3 inline-flex items-center px-3 py-2 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : 'Save Permissions'}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title permission cards */}
            <div className="space-y-4">
              {onboardingData.titles.map((title) => {
                const permissions = getTitlePermissions(title.id);
                
                return (
                  <motion.div
                    key={title.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-lg border border-secondary-200 overflow-hidden shadow-sm"
                  >
                    <div className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-secondary-900">{title.name}</h4>
                        <div>
                          <button
                            type="button"
                            onClick={() => setEditingTitleId(title.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            disabled={editingTitleId !== null}
                          >
                            {permissions.length > 0 ? 'Edit Permissions' : 'Assign Permissions'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        {permissions.length > 0 ? (
                          <>
                            <h5 className="text-sm font-medium text-secondary-700 mb-2">Assigned Permissions:</h5>
                            <div className="flex flex-wrap gap-2">
                              {permissions.map((permId) => {
                                const permission = allPermissions.find(p => p.id.toString() === permId);
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
            
            <div className="text-secondary-600 bg-secondary-50 p-4 rounded-lg border border-secondary-200 mt-6">
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Permission management helps maintain security and workflow efficiency. You can customize permissions for each title anytime in your account settings.
              </p>
            </div>
            
            {/* Continue button - only enable if all titles have permissions */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  if (allTitlesHavePermissions()) {
                    nextStep();
                  } else {
                    setError("Please assign permissions to all titles before continuing");
                  }
                }}
                className={`${
                  allTitlesHavePermissions() 
                    ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer' 
                    : 'bg-secondary-300 cursor-not-allowed'
                } inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Step3AccessControl;