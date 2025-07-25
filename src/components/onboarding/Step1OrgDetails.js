import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { OnboardingContext } from '../../context/OnboardingContext';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .required('Organization name is required'),
  industry: Yup.string().required('Industry is required'),
  size: Yup.string().required('Organization size is required'),
});

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Construction',
  'Non-profit',
  'Entertainment',
  'Media',
  'Hospitality',
  'Transportation',
  'Real Estate',
  'Other'
];

const sizeOptions = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const Step1OrgDetails = () => {
  const navigate = useNavigate();
  const { onboardingData, updateOrganizationData, nextStep } = useContext(OnboardingContext);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      
      // Create organization
      await updateOrganizationData(values);
      
      // Show success message briefly
      setSuccessMessage('Organization created successfully!');
      
      // Auto-advance to next step after a short delay
      setTimeout(() => {
        nextStep();
        navigate('/onboarding/team-members');
      }, 1000); // 1 second delay to show success message
      
    } catch (err) {
      console.error('Error creating organization:', err);
      
      // Handle different types of errors
      if (err.response?.data) {
        // API validation errors
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          // Format field-specific errors
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          setError(errorMessages);
        } else {
          setError(errorData.toString());
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create organization. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Ensure organization is always an object to prevent null/undefined errors
  const organization = onboardingData.organization || {};

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Tell us about your organization
        </h2>
        <p className="text-secondary-600 mb-8">
          This information helps us customize your experience and set up your workspace.
        </p>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-success-50 border-l-4 border-success-500 text-success-700 p-4 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>{successMessage}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-4 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="font-medium">There was an error creating your organization:</p>
              <p className="mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        <Formik
          initialValues={{
            name: organization.name || '',
            industry: organization.industry || '',
            size: organization.size || '',
            logo: organization.logo || null
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting: formikSubmitting, errors, touched, setFieldValue, values }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="name" className="label">
                  Organization Name *
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  className={`input ${errors.name && touched.name ? 'border-danger-500 ring-danger-500' : ''}`}
                  placeholder="Enter your organization name"
                  disabled={isSubmitting}
                />
                <ErrorMessage name="name" component="div" className="mt-1 text-sm text-danger-600" />
              </div>

              <div>
                <label htmlFor="industry" className="label">
                  Industry *
                </label>
                <Field
                  as="select"
                  id="industry"
                  name="industry"
                  className={`input ${errors.industry && touched.industry ? 'border-danger-500 ring-danger-500' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Select an industry</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="industry" component="div" className="mt-1 text-sm text-danger-600" />
              </div>

              <div>
                <label htmlFor="size" className="label">
                  Organization Size *
                </label>
                <Field
                  as="select"
                  id="size"
                  name="size"
                  className={`input ${errors.size && touched.size ? 'border-danger-500 ring-danger-500' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Select organization size</option>
                  {sizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="size" component="div" className="mt-1 text-sm text-danger-600" />
              </div>

              <div>
                <label htmlFor="logo" className="label">
                  Organization Logo (Optional)
                </label>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-secondary-100 rounded-lg flex items-center justify-center border border-secondary-200 overflow-hidden">
                    {values.logo ? (
                      <img
                        src={
                          typeof values.logo === 'string' 
                            ? values.logo 
                            : URL.createObjectURL(values.logo)
                        }
                        alt="Organization logo preview"
                        className="max-h-full max-w-full object-cover"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  
                  <div>
                    <input
                      id="logo"
                      name="logo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isSubmitting}
                      onChange={(event) => {
                        const file = event.currentTarget.files[0];
                        if (file) {
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Logo file size must be less than 5MB');
                            return;
                          }
                          
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            setError('Logo must be an image file');
                            return;
                          }
                          
                          setFieldValue('logo', file);
                          setError(null); // Clear any previous errors
                        }
                      }}
                    />
                    <label
                      htmlFor="logo"
                      className={`btn btn-secondary cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {values.logo ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <p className="mt-1 text-xs text-secondary-500">
                      Recommended: Square image, at least 400×400px, max 5MB
                    </p>
                    {values.logo && (
                      <button
                        type="button"
                        onClick={() => setFieldValue('logo', null)}
                        className="mt-2 text-xs text-danger-600 hover:text-danger-800"
                        disabled={isSubmitting}
                      >
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className={`btn btn-primary w-full ${isSubmitting || formikSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting || formikSubmitting}
                >
                  {isSubmitting || formikSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Organization...
                    </div>
                  ) : (
                    'Create Organization & Continue'
                  )}
                </button>
              </div>

              {/* Help text */}
              <div className="text-center">
                <p className="text-sm text-secondary-500">
                  After saving, you'll automatically proceed to set up your team members.
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
};

export default Step1OrgDetails;