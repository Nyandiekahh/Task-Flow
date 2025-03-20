import React, { createContext, useState } from 'react';

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
    roles: [
      { 
        id: 'role_1',
        name: 'Admin',
        description: 'Full access to all settings and features',
        permissions: ['create_tasks', 'assign_tasks', 'approve_tasks', 'delete_tasks', 'manage_users', 'manage_roles']
      },
      { 
        id: 'role_2',
        name: 'Manager',
        description: 'Can create and assign tasks to team members',
        permissions: ['create_tasks', 'assign_tasks', 'approve_tasks', 'view_reports']
      },
      { 
        id: 'role_3',
        name: 'Reviewer',
        description: 'Can review and approve/reject tasks',
        permissions: ['view_tasks', 'approve_tasks', 'reject_tasks', 'comment']
      },
      { 
        id: 'role_4',
        name: 'Team Member',
        description: 'Can view and complete assigned tasks',
        permissions: ['view_tasks', 'update_tasks', 'comment']
      }
    ],
    completed: false,
  });

  const updateOrganizationData = (data) => {
    setOnboardingData(prev => ({
      ...prev,
      organization: {
        ...prev.organization,
        ...data
      }
    }));
  };

  const addTeamMember = (member) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, {
        id: `member_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...member
      }]
    }));
  };

  const removeTeamMember = (memberId) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== memberId)
    }));
  };

  const updateTeamMember = (memberId, data) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member => 
        member.id === memberId ? { ...member, ...data } : member
      )
    }));
  };

  const addRole = (role) => {
    setOnboardingData(prev => ({
      ...prev,
      roles: [...prev.roles, {
        id: `role_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...role
      }]
    }));
  };

  const removeRole = (roleId) => {
    setOnboardingData(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role.id !== roleId)
    }));
  };

  const updateRole = (roleId, data) => {
    setOnboardingData(prev => ({
      ...prev,
      roles: prev.roles.map(role => 
        role.id === roleId ? { ...role, ...data } : role
      )
    }));
  };

  const completeOnboarding = () => {
    setOnboardingData(prev => ({
      ...prev,
      completed: true
    }));
    
    // In a real app, you would save all this data to your backend
    localStorage.setItem('taskflow_onboarding', JSON.stringify({
      ...onboardingData,
      completed: true
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

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
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};