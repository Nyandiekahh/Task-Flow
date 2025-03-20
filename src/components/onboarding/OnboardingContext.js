import React, { createContext, useState, useCallback, useEffect } from 'react';

export const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    organization: {
      name: '',
      industry: '',
      size: '',
      logo: null,
    },
    teamMembers: [],
    roles: [], // Start with empty roles, will be created by admin
    completed: false,
  });

  // Load onboarding data from localStorage if it exists
  useEffect(() => {
    const savedData = localStorage.getItem('taskflow_onboarding_progress');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setOnboardingData(parsedData);
      } catch (e) {
        console.error('Error loading onboarding data:', e);
      }
    }
  }, []);

  // Save onboarding progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taskflow_onboarding_progress', JSON.stringify(onboardingData));
  }, [onboardingData]);

  const updateOrganizationData = useCallback((data) => {
    setOnboardingData(prev => ({
      ...prev,
      organization: {
        ...prev.organization,
        ...data
      }
    }));
  }, []);

  const addTeamMember = useCallback((member) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, {
        id: `member_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...member
      }]
    }));
  }, []);

  const removeTeamMember = useCallback((memberId) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== memberId)
    }));
  }, []);

  const updateTeamMember = useCallback((memberId, data) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member => 
        member.id === memberId ? { ...member, ...data } : member
      )
    }));
  }, []);

  const addRole = useCallback((role) => {
    setOnboardingData(prev => ({
      ...prev,
      roles: [...prev.roles, {
        id: `role_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...role
      }]
    }));
  }, []);

  const removeRole = useCallback((roleId) => {
    setOnboardingData(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role.id !== roleId)
    }));
  }, []);

  const updateRole = useCallback((roleId, data) => {
    setOnboardingData(prev => ({
      ...prev,
      roles: prev.roles.map(role => 
        role.id === roleId ? { ...role, ...data } : role
      )
    }));
  }, []);

  // Use a memoized version of the current data to avoid the dependency cycle
  const completeOnboarding = useCallback(() => {
    setOnboardingData(prev => {
      const completedData = {
        ...prev,
        completed: true
      };
      // Save the completed data to localStorage
      localStorage.setItem('taskflow_onboarding', JSON.stringify(completedData));
      return completedData;
    });
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const nextStepValue = prev + 1;
      // Save current step to localStorage
      localStorage.setItem('taskflow_onboarding_step', nextStepValue);
      return nextStepValue;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => {
      const prevStepValue = prev - 1;
      // Save current step to localStorage
      localStorage.setItem('taskflow_onboarding_step', prevStepValue);
      return prevStepValue;
    });
  }, []);

  // Load current step from localStorage if it exists
  useEffect(() => {
    const savedStep = localStorage.getItem('taskflow_onboarding_step');
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, []);

  // Add a function to reset onboarding for testing
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('taskflow_onboarding');
    localStorage.removeItem('taskflow_onboarding_progress');
    localStorage.removeItem('taskflow_onboarding_step');
    setCurrentStep(1);
    setOnboardingData({
      organization: {
        name: '',
        industry: '',
        size: '',
        logo: null,
      },
      teamMembers: [],
      roles: [],
      completed: false,
    });
  }, []);

  const value = {
    currentStep,
    onboardingData,
    updateOrganizationData,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    addRole,
    removeRole,
    updateRole,
    completeOnboarding,
    nextStep,
    prevStep,
    resetOnboarding,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};