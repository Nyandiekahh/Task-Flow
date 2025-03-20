import React, { useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { OnboardingContext } from '../../context/OnboardingContext';

const validationSchema = Yup.object({
  name: Yup.string().required('Organization name is required'),
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
  const { onboardingData, updateOrganizationData } = useContext(OnboardingContext);
  
  const handleSubmit = (values) => {
    updateOrganizationData(values);
    // Note: Navigation happens in the parent OnboardingLayout component
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Tell us about your organization</h2>
        <p className="text-secondary-600 mb-8">
          This information helps us customize your experience and set up your workspace.
        </p>

        <Formik
          initialValues={{
            name: onboardingData.organization.name || '',
            industry: onboardingData.organization.industry || '',
            size: onboardingData.organization.size || '',
            logo: onboardingData.organization.logo || null
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, setFieldValue }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="name" className="label">
                  Organization Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  className={`input ${errors.name && touched.name ? 'border-danger-500' : ''}`}
                  placeholder="Acme Corporation"
                />
                <ErrorMessage name="name" component="div" className="mt-1 text-sm text-danger-600" />
              </div>

              <div>
                <label htmlFor="industry" className="label">
                  Industry
                </label>
                <Field
                  as="select"
                  id="industry"
                  name="industry"
                  className={`input ${errors.industry && touched.industry ? 'border-danger-500' : ''}`}
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
                  Organization Size
                </label>
                <Field
                  as="select"
                  id="size"
                  name="size"
                  className={`input ${errors.size && touched.size ? 'border-danger-500' : ''}`}
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
                  <div className="w-20 h-20 bg-secondary-100 rounded-lg flex items-center justify-center border border-secondary-200">
                    {onboardingData.organization.logo ? (
                      <img
                        src={URL.createObjectURL(onboardingData.organization.logo)}
                        alt="Organization logo"
                        className="max-h-full max-w-full"
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
                      onChange={(event) => {
                        const file = event.currentTarget.files[0];
                        setFieldValue('logo', file);
                      }}
                    />
                    <label
                      htmlFor="logo"
                      className="btn btn-secondary cursor-pointer"
                    >
                      Upload Logo
                    </label>
                    <p className="mt-1 text-xs text-secondary-500">
                      Recommended: Square image, at least 400x400px
                    </p>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
};

export default Step1OrgDetails;