// src/components/auth/ResetPasswordConfirm.js

import React, { useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPasswordConfirm = () => {
  const { confirmPasswordReset } = useContext(AuthContext);
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [resetComplete, setResetComplete] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      await confirmPasswordReset(uid, token, values.password);
      setResetComplete(true);
    } catch (error) {
      setApiError(error.message || 'Failed to reset password. Please try again or request a new reset link.');
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
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-600">
          Enter your new password below
        </p>
      </motion.div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {resetComplete ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-success-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Password reset successful</h3>
              <p className="text-secondary-600 mb-6">
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
              <Link to="/signin" className="btn btn-primary">
                Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              {apiError && (
                <div className="mb-4 bg-danger-50 border border-danger-500 text-danger-700 px-4 py-3 rounded">
                  {apiError}
                </div>
              )}

              <Formik
                initialValues={{
                  password: '',
                  confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div>
                      <label htmlFor="password" className="label">
                        New Password
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
                        Confirm New Password
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

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary w-full py-3"
                      >
                        {isSubmitting ? 'Setting new password...' : 'Set new password'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>

              <div className="mt-6 text-center">
                <Link to="/signin" className="font-medium text-primary-600 hover:text-primary-500">
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordConfirm;