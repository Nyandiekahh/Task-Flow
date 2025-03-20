import React, { useContext, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingContext } from '../../context/OnboardingContext';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  role: Yup.string().required('Role is required')
});

const Step2TeamMembers = () => {
  const { onboardingData, addTeamMember, removeTeamMember } = useContext(OnboardingContext);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const handleAddMember = (values, { resetForm }) => {
    addTeamMember(values);
    resetForm();
    setIsAddingMember(false);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Invite your team members</h2>
        <p className="text-secondary-600 mb-8">
          Add the people you work with to collaborate on tasks and projects. You can always invite more team members later.
        </p>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-secondary-900">Team Members</h3>
            {!isAddingMember && (
              <button
                type="button"
                onClick={() => setIsAddingMember(true)}
                className="btn btn-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
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
                    role: ''
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleAddMember}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="name" className="label">
                          Name
                        </label>
                        <Field
                          id="name"
                          name="name"
                          type="text"
                          className={`input ${errors.name && touched.name ? 'border-danger-500' : ''}`}
                          placeholder="John Doe"
                        />
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-danger-600" />
                      </div>

                      <div>
                        <label htmlFor="email" className="label">
                          Email address
                        </label>
                        <Field
                          id="email"
                          name="email"
                          type="email"
                          className={`input ${errors.email && touched.email ? 'border-danger-500' : ''}`}
                          placeholder="john@example.com"
                        />
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-danger-600" />
                      </div>

                      <div>
                        <label htmlFor="role" className="label">
                          Role
                        </label>
                        <Field
                          as="select"
                          id="role"
                          name="role"
                          className={`input ${errors.role && touched.role ? 'border-danger-500' : ''}`}
                        >
                          <option value="">Select a role</option>
                          {onboardingData.roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="role" component="div" className="mt-1 text-sm text-danger-600" />
                      </div>

                      <div className="md:col-span-3 flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => setIsAddingMember(false)}
                          className="btn btn-secondary mr-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn btn-primary"
                        >
                          {isSubmitting ? 'Adding...' : 'Add Member'}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </motion.div>
            )}
          </AnimatePresence>

          {onboardingData.teamMembers.length > 0 ? (
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
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {onboardingData.teamMembers.map((member) => {
                    const role = onboardingData.roles.find(r => r.id === member.role);
                    return (
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
                            {role?.name || 'Unknown Role'}
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
                    );
                  })}
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
                  className="btn btn-primary"
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

        <div className="text-secondary-600 bg-secondary-50 p-4 rounded-lg border border-secondary-200">
          <p className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            You can add more team members and adjust their roles at any time after setup.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Step2TeamMembers;