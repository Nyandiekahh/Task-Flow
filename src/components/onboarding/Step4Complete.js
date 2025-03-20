import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OnboardingContext } from '../../context/OnboardingContext';
import { AuthContext } from '../../context/AuthContext';

const Step4Complete = () => {
  const { onboardingData } = useContext(OnboardingContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // The problem is likely here - we're calling completeOnboarding in useEffect
  // but not including it in the dependency array, or it's changing on every render
  // Let's modify this to avoid the infinite loop
  
  // We'll use a ref to ensure this only runs once
  const hasCompletedRef = React.useRef(false);
  const { completeOnboarding } = useContext(OnboardingContext);
  
  useEffect(() => {
    // Only run this once
    if (!hasCompletedRef.current) {
      completeOnboarding();
      hasCompletedRef.current = true;
    }
  }, [completeOnboarding]);

  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto"
      >
        <div className="mb-8">
          <div className="mx-auto h-20 w-20 rounded-full bg-success-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-success-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-secondary-900 mb-4">
          You're all set, {currentUser?.name || 'Admin'}!
        </h2>
        
        <p className="text-lg text-secondary-600 mb-8">
          Your TaskFlow workspace has been successfully set up. You're ready to start managing tasks and collaborating with your team.
        </p>

        <div className="bg-white rounded-xl p-6 shadow-md border border-secondary-100 mb-8">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">Your Workspace Summary</h3>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-sm text-secondary-500">Organization</p>
              <p className="font-medium text-secondary-900">{onboardingData.organization.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-secondary-500">Industry</p>
              <p className="font-medium text-secondary-900">{onboardingData.organization.industry}</p>
            </div>
            
            <div>
              <p className="text-sm text-secondary-500">Team Size</p>
              <p className="font-medium text-secondary-900">{onboardingData.teamMembers.length + 1} members</p>
            </div>
            
            <div>
              <p className="text-sm text-secondary-500">Roles</p>
              <p className="font-medium text-secondary-900">{onboardingData.roles.length} roles configured</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-secondary-900 mb-4">What's Next?</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            className="bg-white p-4 rounded-lg border border-secondary-100 shadow-sm"
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
            </div>
            <h4 className="font-medium text-secondary-900">Create Your First Project</h4>
            <p className="text-secondary-600 text-sm mt-2">Set up your first project and add tasks to get started.</p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-4 rounded-lg border border-secondary-100 shadow-sm"
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h4 className="font-medium text-secondary-900">Invite Your Team</h4>
            <p className="text-secondary-600 text-sm mt-2">Send invitations to your team members to join your workspace.</p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-4 rounded-lg border border-secondary-100 shadow-sm"
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="font-medium text-secondary-900">Customize Settings</h4>
            <p className="text-secondary-600 text-sm mt-2">Personalize your workspace settings to fit your workflow.</p>
          </motion.div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary text-lg py-3 px-8"
        >
          Go to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default Step4Complete;