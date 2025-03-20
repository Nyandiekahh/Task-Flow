import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { OnboardingContext } from '../../context/OnboardingContext';

const steps = [
  { id: 1, name: 'Organization Details', path: '/onboarding/org-details' },
  { id: 2, name: 'Team Members', path: '/onboarding/team-members' },
  { id: 3, name: 'Role Management', path: '/onboarding/roles' },
  { id: 4, name: 'Complete', path: '/onboarding/complete' },
];

const OnboardingLayout = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const { currentStep, nextStep, prevStep } = useContext(OnboardingContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/signin');
    }
  }, [currentUser, loading, navigate]);

  // Determine current step from URL
  useEffect(() => {
    const currentPath = location.pathname;
    const stepIndex = steps.findIndex(step => step.path === currentPath);
    
    // If valid step found and not already on that step
    if (stepIndex !== -1 && stepIndex + 1 !== currentStep) {
      // TODO: In a real app, we would validate that previous steps are completed
      // before allowing navigation to a later step
    }
  }, [location, currentStep]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with progress steps */}
      <header className="bg-white shadow-sm border-b border-secondary-100">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary-600">TaskFlow</div>
            <div className="text-secondary-600">Setting up your workspace</div>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-8 mb-2">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {steps.map((step, stepIdx) => (
                  <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} ${stepIdx !== 0 ? 'pl-8 sm:pl-20' : ''}`}>
                    {stepIdx !== steps.length - 1 && (
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div 
                          className={`h-0.5 w-full ${
                            getStepStatus(step.id) === 'completed' ? 'bg-primary-600' : 'bg-secondary-200'
                          }`}
                        ></div>
                      </div>
                    )}
                    
                    <div className="relative flex items-center justify-center">
                      {getStepStatus(step.id) === 'completed' ? (
                        <span className="h-10 w-10 flex items-center justify-center bg-primary-600 rounded-full">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : getStepStatus(step.id) === 'current' ? (
                        <span className="h-10 w-10 flex items-center justify-center border-2 border-primary-600 bg-white rounded-full text-primary-600 font-semibold">
                          {step.id}
                        </span>
                      ) : (
                        <span className="h-10 w-10 flex items-center justify-center border-2 border-secondary-300 bg-white rounded-full text-secondary-500">
                          {step.id}
                        </span>
                      )}
                    </div>
                    
                    <div className={`mt-2 text-sm font-medium ${
                      getStepStatus(step.id) === 'completed' ? 'text-primary-600' : 
                      getStepStatus(step.id) === 'current' ? 'text-secondary-900' : 'text-secondary-500'
                    }`}>
                      {step.name}
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="flex-1 py-10">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-100 p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Navigation buttons */}
      <footer className="bg-white border-t border-secondary-100 py-4">
        <div className="container-custom flex justify-between">
          <button
            onClick={() => {
              prevStep();
              const prevPath = steps[currentStep - 2]?.path || '/signup';
              navigate(prevPath);
            }}
            className={`btn btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentStep === 1}
          >
            Back
          </button>
          
          {currentStep < steps.length && (
            <button
              onClick={() => {
                nextStep();
                const nextPath = steps[currentStep]?.path;
                if (nextPath) navigate(nextPath);
              }}
              className="btn btn-primary"
            >
              Continue
            </button>
          )}
          
          {currentStep === steps.length && (
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-success"
            >
              Get Started
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLayout;