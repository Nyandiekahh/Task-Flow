// src/components/auth/ResetPassword.js

import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const ResetPassword = () => {
  const { resetPassword } = useContext(AuthContext);
  const [requestSent, setRequestSent] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      await resetPassword(values.email);
      setRequestSent(true);
    } catch (error) {
      setApiError(error.message || 'An error occurred. Please try again.');
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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-600">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
      </motion.div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {requestSent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-success-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Check your email</h3>
              <p className="text-secondary-600 mb-6">
                We've sent a 6-digit OTP code to your email address. Please check your inbox and use the code to reset your password.
              </p>
              <Link to="/reset-password-confirm" className="btn btn-primary mr-3">
                Enter OTP
              </Link>
              <Link to="/signin" className="btn btn-outline">
                Return to Sign In
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
                  email: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
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
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary w-full py-3"
                      >
                        {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
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

export default ResetPassword;