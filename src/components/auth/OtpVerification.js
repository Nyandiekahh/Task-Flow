// src/components/auth/OtpVerification.js

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';

// Validation schema for OTP verification
const otpValidationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  otp: Yup.string().required('OTP is required').matches(/^\d+$/, 'OTP must contain only digits')
});

// Validation schema for password change
const passwordChangeValidationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const OtpVerification = () => {
  const { verifyOtp, acceptInvitation } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [invitationToken, setInvitationToken] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Get email from URL params if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleOtpSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      
      // Call API to verify OTP
      const response = await verifyOtp(values.email, values.otp);
      
      // Store email and invitation token for the password change step
      setEmail(values.email);
      if (response && response.token) {
        setInvitationToken(response.token);
      }
      
      // Show success message
      setSuccessMessage("OTP verified successfully. Please set your password to continue.");
      
      // Mark OTP as verified to show password change form
      setOtpVerified(true);
      
    } catch (error) {
      console.error('OTP verification error:', error);
      setApiError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChangeSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      setSuccessMessage(null);
      
      // Call API to accept invitation with new password
      await acceptInvitation(invitationToken, values.password);
      
      // Show success message briefly before redirecting
      setSuccessMessage("Password set successfully. Redirecting to dashboard...");
      
      // Add a small delay before redirecting to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Password change error:', error);
      setApiError(error.message || 'Failed to set password. Please try again.');
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
          {otpVerified ? 'Set Your Password' : 'Verify Your Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-600">
          {otpVerified 
            ? 'Create a secure password for your account' 
            : 'Enter the OTP sent to your email'}
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

          {successMessage && (
            <div className="mb-4 bg-success-50 border border-success-500 text-success-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {!otpVerified ? (
            // OTP Verification Form
            <Formik
              initialValues={{
                email: email || '',
                otp: ''
              }}
              validationSchema={otpValidationSchema}
              onSubmit={handleOtpSubmit}
              enableReinitialize={true}
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
                    <label htmlFor="otp" className="label">
                      One-Time Password (OTP)
                    </label>
                    <Field
                      id="otp"
                      name="otp"
                      type="text"
                      autoComplete="one-time-code"
                      className={`input ${errors.otp && touched.otp ? 'border-danger-500' : ''}`}
                    />
                    <ErrorMessage name="otp" component="div" className="mt-1 text-sm text-danger-600" />
                    <p className="mt-1 text-sm text-secondary-500">
                      Please enter the OTP that was sent to your email address when you were invited to join the organization.
                    </p>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary w-full py-3"
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            // Password Change Form
            <Formik
              initialValues={{
                password: '',
                confirmPassword: ''
              }}
              validationSchema={passwordChangeValidationSchema}
              onSubmit={handlePasswordChangeSubmit}
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
                    <p className="mt-1 text-sm text-secondary-500">
                      Password must be at least 8 characters long.
                    </p>
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
                      {isSubmitting ? 'Setting password...' : 'Set Password & Continue'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OtpVerification;