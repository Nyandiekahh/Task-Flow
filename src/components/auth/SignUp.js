// src/components/auth/SignUp.js

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  terms: Yup.boolean().oneOf([true], 'You must accept the terms and conditions')
});

const SignUp = () => {
  const { signUp } = useContext(AuthContext);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      console.log('Submitting registration with:', {
        email: values.email,
        password: values.password,
        name: values.name,
        confirmPassword: values.confirmPassword
      });
      
      await signUp(values.email, values.password, values.name);
      
      // After successful registration and login, navigate to the first onboarding step
      navigate('/onboarding/org-details');
    } catch (error) {
      console.error('Registration error full details:', error);
      
      // Log the complete error structure
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.responseData) {
        console.error('Error responseData:', error.responseData);
      } else if (error.request) {
        console.error('Error request:', error.request);
      }
      
      // Handle axios error response
      let errorMessage = 'An error occurred during sign up. Please try again.';
      
      // Try to get the response data from error.response or error.responseData
      const responseData = error.response?.data || error.responseData;
      
      if (responseData) {
        // Handle different error formats from Django REST Framework
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.non_field_errors) {
          errorMessage = Array.isArray(responseData.non_field_errors) 
            ? responseData.non_field_errors.join(' ') 
            : responseData.non_field_errors;
        } else {
          // Check for field-specific errors and create a formatted message
          const fieldErrors = [];
          
          // Update field names to match backend expectations
          const fieldMap = {
            'name': 'Name',
            'email': 'Email',
            'password': 'Password',
            'confirm_password': 'Confirm Password'
          };
          
          // Check each possible field error
          Object.keys(fieldMap).forEach(field => {
            if (responseData[field]) {
              const fieldError = Array.isArray(responseData[field]) 
                ? responseData[field].join(' ') 
                : responseData[field];
              fieldErrors.push(`${fieldMap[field]}: ${fieldError}`);
            }
          });
          
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n');
          } else {
            // If we couldn't extract specific errors, show the raw response
            errorMessage = JSON.stringify(responseData, null, 2);
          }
        }
      } else {
        // For other types of errors
        errorMessage = error.message || 'An error occurred during sign up. Please try again.';
      }
      
      console.log('Setting error message:', errorMessage);
      setApiError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <h2 className="text-center text-3xl font-extrabold text-secondary-900">
            <span className="text-primary-600">TaskFlow</span>
          </h2>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-600">
          Or{' '}
          <Link to="/signin" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
      </motion.div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {apiError && (
            <div className="mb-4 bg-danger-50 border border-danger-500 text-danger-700 px-4 py-3 rounded">
              {apiError}
            </div>
          )}

          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              terms: false
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={`input ${errors.name && touched.name ? 'border-danger-500' : ''}`}
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
                    autoComplete="email"
                    className={`input ${errors.email && touched.email ? 'border-danger-500' : ''}`}
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-danger-600" />
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    className={`input ${errors.password && touched.password ? 'border-danger-500' : ''}`}
                  />
                  <ErrorMessage name="password" component="div" className="mt-1 text-sm text-danger-600" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirm Password
                  </label>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className={`input ${errors.confirmPassword && touched.confirmPassword ? 'border-danger-500' : ''}`}
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-danger-600" />
                </div>

                <div className="flex items-center">
                  <Field
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-secondary-700">
                    I agree to the{' '}
                    <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <ErrorMessage name="terms" component="div" className="mt-1 text-sm text-danger-600" />

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full py-3"
                  >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-secondary-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="py-2.5 px-4 border border-secondary-300 rounded-md shadow-sm bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50"
              >
                Google
              </button>
              <button
                type="button"
                className="py-2.5 px-4 border border-secondary-300 rounded-md shadow-sm bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50"
              >
                Microsoft
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;