import React, { useContext, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingContext } from '../../context/OnboardingContext';

// Logging function to debug context data
const logContextData = (data) => {
  console.log("Current Onboarding Data:", {
    teamMembers: data.teamMembers,
    roles: data.roles
  });
};

// Helper function to extract titles from localStorage directly
// This is a fallback method since titles in Step2 might not be in context
const getTitlesFromLocalStorage = () => {
  try {
    // First try to get titles from dedicated storage
    const storedTitles = localStorage.getItem('taskflow_team_titles');
    if (storedTitles) {
      return JSON.parse(storedTitles);
    }
    
    // Otherwise try to extract from team members
    const savedData = localStorage.getItem('taskflow_onboarding_progress');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.teamMembers && Array.isArray(parsedData.teamMembers)) {
        return parsedData.teamMembers
          .map(member => member.title)
          .filter(title => title)
          .filter((value, index, self) => self.indexOf(value) === index);
      }
    }
    
    return [];
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    return [];
  }
};

const validationSchema = Yup.object({
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
  const [editingTitleId, setEditingTitleId] = useState(null);
  
  // Get initial titles from localStorage as a fallback
  const initialTitles = getTitlesFromLocalStorage().map(title => ({
    title,
    id: `title_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    permissions: [],
    description: `Permissions for ${title}`
  }));
  
  // Initialize with titles from localStorage if available
  const [titlesWithPermissions, setTitlesWithPermissions] = useState(initialTitles);
  
  // Log data when component mounts to see what we're working with
  useEffect(() => {
    logContextData(onboardingData);
    console.log("Initial Titles from localStorage:", initialTitles);
  }, [onboardingData]);
  
  // Extract titles from previous steps
  useEffect(() => {
    console.log("Team Members:", onboardingData.teamMembers);
    
    // Get unique titles from team members
    const teamMemberTitles = onboardingData.teamMembers
      .map(member => member.title)
      .filter(title => title) // Make sure title exists
      .filter((value, index, self) => self.indexOf(value) === index);
    
    console.log("Team Member Titles:", teamMemberTitles);
    
    // Check if there's a titles array in the context
    // This looks for titles stored directly in onboardingData from Step 2
    const storedTitles = onboardingData.titles || [];
    console.log("Stored Titles:", storedTitles);
    
    // Combine titles from both sources
    let allTitles = [...teamMemberTitles, ...storedTitles];
    
    // If we still don't have titles, check localStorage directly
    if (allTitles.length === 0) {
      try {
        const savedData = localStorage.getItem('taskflow_onboarding_progress');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log("Data from localStorage:", parsedData);
          
          // Extract titles if they exist
          if (parsedData.titles && Array.isArray(parsedData.titles)) {
            allTitles = [...allTitles, ...parsedData.titles];
          }
          
          // Also check team members from localStorage
          if (parsedData.teamMembers && Array.isArray(parsedData.teamMembers)) {
            const titlesFromStorage = parsedData.teamMembers
              .map(member => member.title)
              .filter(title => title)
              .filter((value, index, self) => self.indexOf(value) === index);
            
            allTitles = [...allTitles, ...titlesFromStorage];
          }
        }
      } catch (e) {
        console.error("Error accessing localStorage:", e);
      }
    }
    
    // Add "Admin" title if not already present
    if (!allTitles.includes("Admin")) {
      allTitles.push("Admin");
    }
    
    // Add any existing titles with permissions
    const existingRoleTitles = onboardingData.roles.map(role => role.name);
    console.log("Existing Role Titles:", existingRoleTitles);
    
    // Combine unique titles that need permissions assigned
    const allUniqueTitles = [...new Set([...allTitles, ...existingRoleTitles])];
    console.log("All Unique Titles:", allUniqueTitles);
    
    // Create a mapping of titles with their permissions (if already assigned)
    const mappedTitles = allUniqueTitles.map(title => {
      const existingRole = onboardingData.roles.find(role => role.name === title);
      return {
        title,
        id: existingRole?.id || `title_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        permissions: existingRole?.permissions || [],
        description: existingRole?.description || `Permissions for ${title}`
      };
    });
    
    console.log("Mapped Titles:", mappedTitles);
    setTitlesWithPermissions(mappedTitles);
  }, [onboardingData]);

  const handleUpdatePermissions = (values, { resetForm }) => {
    const titleToUpdate = titlesWithPermissions.find(t => t.id === editingTitleId);
    
    // Check if this title already exists as a role
    const existingRoleIndex = onboardingData.roles.findIndex(role => role.id === editingTitleId);
    
    if (existingRoleIndex >= 0) {
      // Update existing role
      updateRole(editingTitleId, {
        name: titleToUpdate.title,
        description: titleToUpdate.description,
        permissions: values.permissions
      });
    } else {
      // Create new role based on title
      addRole({
        name: titleToUpdate.title,
        description: titleToUpdate.description,
        permissions: values.permissions
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
  };
  
  const startEditing = (titleId) => {
    setEditingTitleId(titleId);
  };

  // Helper to get permissions for a title
  const getTitlePermissions = (titleId) => {
    const title = titlesWithPermissions.find(t => t.id === titleId);
    if (!title) return [];
    
    const existingRole = onboardingData.roles.find(role => role.name === title.title);
    return existingRole?.permissions || title.permissions || [];
  };

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
                const roleWithPermissions = onboardingData.roles.find(role => role.name === titleItem.title);
                const permissionIds = roleWithPermissions?.permissions || titleItem.permissions || [];
                
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
                We couldn't find any titles to configure permissions for.
              </p>
              <div className="mt-6">
                <p className="text-secondary-600 mb-4">
                  Let's add some default titles to get started:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTitlesWithPermissions([
                      {
                        title: "Admin",
                        id: `title_${Date.now()}_1`,
                        permissions: [],
                        description: "Permissions for Admin"
                      },
                      {
                        title: "Manager",
                        id: `title_${Date.now()}_2`,
                        permissions: [],
                        description: "Permissions for Manager"
                      },
                      {
                        title: "Team Member",
                        id: `title_${Date.now()}_3`,
                        permissions: [],
                        description: "Permissions for Team Member"
                      }
                    ]);
                  }}
                  className="btn btn-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Default Titles
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
            Permission management helps maintain security and workflow efficiency. You can customize permissions for each title anytime in your account settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Step3Roles;