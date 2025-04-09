// src/components/onboarding/Step2TeamStructure.js

import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingContext } from '../../context/OnboardingContext';

// Validation schema for team members
const memberValidationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  title_id: Yup.string().required('Title is required')
});

// Validation schema for titles
const titleValidationSchema = Yup.object({
  name: Yup.string().required('Title name is required')
});

const Step2TeamStructure = () => {
  const { 
    onboardingData, 
    addTeamMember, 
    removeTeamMember, 
    error: contextError,
    addTitle,
    removeTitle,
    nextStep
  } = useContext(OnboardingContext);
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingTitle, setIsAddingTitle] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if organization exists
  useEffect(() => {
    if (!onboardingData.organization || !onboardingData.organization.id) {
      const msg = 'You must create an organization before adding team members';
      setError(msg);
      
      // Redirect after a short delay
      const timer = setTimeout(() => {
        navigate('/onboarding/org-details');
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setError(null);
    }
  }, [onboardingData.organization, navigate]);

  // Update error state when context error changes
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  // Handle adding a new title
  const handleAddTitle = async (values, { resetForm, setSubmitting }) => {
    try {
      // Clear any previous errors
      setError(null);
      
      // Check if organization exists
      if (!onboardingData.organization || !onboardingData.organization.id) {
        throw new Error('You must create an organization before adding titles');
      }
      
      await addTitle(values.name, values.description);
      resetForm();
      setIsAddingTitle(false);
    } catch (err) {
      setError(err.message || 'Failed to add title');
      console.error('Error adding title:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle adding a new team member
  const handleAddMember = async (values, { resetForm, setSubmitting }) => {
    try {
      // Clear any previous errors
      setError(null);
      
      // Check if organization exists
      if (!onboardingData.organization || !onboardingData.organization.id) {
        throw new Error('You must create an organization before adding team members');
      }
      
      await addTeamMember(values);
      resetForm();
      setIsAddingMember(false);
    } catch (err) {
      setError(err.message || 'Failed to add team member');
      console.error('Error adding team member:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if we have created titles
  const hasTitles = onboardingData.titles && onboardingData.titles.length > 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Create your team structure</h2>
        <p className="text-secondary-600 mb-8">
          Define titles for your team members and invite people to join your workspace.
        </p>

        {/* Display errors */}
        {error && (
          <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-4 mb-6 rounded">
            <p>{error}</p>
            {(!onboardingData.organization || !onboardingData.organization.id) && (
              <p className="mt-2">
                Redirecting to organization creation...
              </p>
            )}
          </div>
        )}

        {/* Continue only if we have an organization */}
        {onboardingData.organization && onboardingData.organization.id && (
          <>
            {/* Title Management Section */}
            <div className="mb-8 bg-white rounded-lg p-6 border border-secondary-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Team Titles</h3>
                
                {!isAddingTitle && (
                  <button
                    type="button"
                    onClick={() => setIsAddingTitle(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Title
                  </button>
                )}
              </div>
              
              <p className="text-secondary-600 mb-4">
                Create titles that reflect your organization's structure (e.g., Manager, Developer, Designer).
                You'll assign permissions to these titles in the next step.
              </p>
              
              <AnimatePresence>
                {isAddingTitle && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-secondary-50 rounded-lg p-4 mb-6 border border-secondary-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-secondary-900">Add a new title</h4>
                      <button
                        type="button"
                        onClick={() => setIsAddingTitle(false)}
                        className="text-secondary-500 hover:text-secondary-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <Formik
                      initialValues={{
                        name: '',
                        description: ''
                      }}
                      validationSchema={titleValidationSchema}
                      onSubmit={handleAddTitle}
                    >
                      {({ isSubmitting, errors, touched }) => (
                        <Form>
                          <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                              Title Name
                            </label>
                            <Field
                              id="name"
                              name="name"
                              type="text"
                              placeholder="E.g., Project Manager, Developer, Designer"
                              className={`block w-full rounded-md border ${errors.name && touched.name ? 'border-danger-500' : 'border-secondary-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                            />
                            <ErrorMessage name="name" component="div" className="mt-1 text-sm text-danger-600" />
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
                              Description (Optional)
                            </label>
                            <Field
                              as="textarea"
                              id="description"
                              name="description"
                              rows="2"
                              placeholder="Brief description of this role's responsibilities"
                              className="block w-full rounded-md border border-secondary-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setIsAddingTitle(false)}
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
                                  Adding...
                                </>
                              ) : 'Add Title'}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {onboardingData.titles && onboardingData.titles.map((title) => (
                  <div 
                    key={title.id} 
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full flex items-center"
                  >
                    <span className="mr-2">{title.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeTitle(title.id)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {(!onboardingData.titles || onboardingData.titles.length === 0) && (
                  <div className="text-secondary-500 italic text-sm">No titles created yet</div>
                )}
              </div>
            </div>

            {/* Team Members Section - Only show if we have at least one title */}
            {hasTitles && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-secondary-900">Team Members</h3>
                  {!isAddingMember && (
                    <button
                      type="button"
                      onClick={() => setIsAddingMember(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Team Member
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {isAddingMember && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-secondary-50 rounded-lg p-4 mb-6 border border-secondary-200"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-secondary-900">Add a new team member</h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingMember(false)}
                          className="text-secondary-500 hover:text-secondary-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <Formik
                        initialValues={{
                          name: '',
                          email: '',
                          title_id: ''
                        }}
                        validationSchema={memberValidationSchema}
                        onSubmit={handleAddMember}
                      >
                        {({ isSubmitting, errors, touched }) => (
                          <Form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                                Name
                              </label>
                              <Field
                                id="name"
                                name="name"
                                type="text"
                                className={`block w-full rounded-md border ${errors.name && touched.name ? 'border-danger-500' : 'border-secondary-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                                placeholder="John Doe"
                              />
                              <ErrorMessage name="name" component="div" className="mt-1 text-sm text-danger-600" />
                            </div>

                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                                Email address
                              </label>
                              <Field
                                id="email"
                                name="email"
                                type="email"
                                className={`block w-full rounded-md border ${errors.email && touched.email ? 'border-danger-500' : 'border-secondary-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                                placeholder="john@example.com"
                              />
                              <ErrorMessage name="email" component="div" className="mt-1 text-sm text-danger-600" />
                            </div>

                            <div>
                              <label htmlFor="title_id" className="block text-sm font-medium text-secondary-700 mb-1">
                                Title
                              </label>
                              <Field
                                as="select"
                                id="title_id"
                                name="title_id"
                                className={`block w-full rounded-md border ${errors.title_id && touched.title_id ? 'border-danger-500' : 'border-secondary-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                              >
                                <option value="">Select a title</option>
                                {onboardingData.titles && onboardingData.titles.map((title) => (
                                  <option key={title.id} value={title.id}>
                                    {title.name}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage name="title_id" component="div" className="mt-1 text-sm text-danger-600" />
                            </div>

                            <div className="md:col-span-3 flex justify-end mt-4">
                              <button
                                type="button"
                                onClick={() => setIsAddingMember(false)}
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
                                    Adding...
                                  </>
                                ) : 'Add Member'}
                              </button>
                            </div>
                          </Form>
                        )}
                      </Formik>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Team members list */}
                {onboardingData.teamMembers && onboardingData.teamMembers.length > 0 ? (
                  <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-secondary-200">
                      <thead className="bg-secondary-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-secondary-200">
                        {onboardingData.teamMembers.map((member) => (
                          <motion.tr 
                            key={member.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-primary-700 font-medium">
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-secondary-900">{member.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-secondary-600">{member.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                                {member.title_name || 'Unknown Title'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => removeTeamMember(member.id)}
                                className="text-danger-600 hover:text-danger-900"
                              >
                                Remove
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-secondary-900">No team members</h3>
                    <p className="mt-1 text-sm text-secondary-500">
                      Get started by adding your first team member.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setIsAddingMember(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Team Member
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-secondary-600 bg-secondary-50 p-4 rounded-lg border border-secondary-200">
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                You can add more team members and adjust their titles at any time after setup.
                In the next step, you'll define what each title can do in your organization.
              </p>
            </div>
            
            {/* Continue button - only enable if at least one title is created */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  if (hasTitles) {
                    nextStep();
                  } else {
                    setError("Please create at least one title before continuing");
                  }
                }}
                className={`${
                  hasTitles 
                    ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer' 
                    : 'bg-secondary-300 cursor-not-allowed'
                } inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                Continue to Access Control
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Step2TeamStructure;