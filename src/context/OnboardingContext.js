// src/context/OnboardingContext.js

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { 
  organizationAPI, 
  teamMembersAPI, 
  rolesAPI, 
  onboardingAPI,
  titlesAPI
} from '../services/api';

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
    teamMembers: [], // Initialize as an empty array to avoid undefined errors
    roles: [],
    completed: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [titles, setTitles] = useState([]);

  // Load onboarding data from API when component mounts
  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        setLoading(true);
        // Check if there's an auth token
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          const data = await onboardingAPI.getOnboardingData();
          // Ensure teamMembers and roles are always arrays even if the backend returns null/undefined
          setOnboardingData({
            organization: data.organization || {},
            teamMembers: data.teamMembers || [],
            roles: data.roles || [],
            completed: data.completed || false
          });
          
          // If onboarding is already completed, start at step 4
          if (data.completed) {
            setCurrentStep(4);
          }
          
          // Fetch titles if organization exists
          if (data.organization && data.organization.id) {
            const titlesData = await titlesAPI.getTitles();
            setTitles(titlesData);
          }
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOnboardingData();
  }, []);

  // Add title - FIXED: Now sends proper object format
  const addTitle = useCallback(async (titleName) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if organization exists and has an ID
      if (!onboardingData.organization || !onboardingData.organization.id) {
        const errorMsg = 'You must create an organization before adding titles';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // FIXED: Send object with name property instead of just string
      const newTitle = await titlesAPI.createTitle({ name: titleName });
      setTitles(prev => [...prev, newTitle]);
      
      return newTitle;
    } catch (error) {
      console.error('Error adding title:', error);
      setError(error.message || 'Failed to add title');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onboardingData.organization]);

  // Remove title
  const removeTitle = useCallback(async (titleId) => {
    try {
      setLoading(true);
      setError(null);
      
      await titlesAPI.deleteTitle(titleId);
      setTitles(prev => prev.filter(title => title.id !== titleId));
    } catch (error) {
      console.error('Error removing title:', error);
      setError(error.message || 'Failed to remove title');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update organization data
  const updateOrganizationData = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // For onboarding, always create a new organization
      // This simplifies the flow and prevents issues with stale IDs
      const organizationResponse = await organizationAPI.createOrganization(data);
      
      setOnboardingData(prev => ({
        ...prev,
        organization: organizationResponse
      }));
      
      console.log('Created new organization:', organizationResponse);
      return organizationResponse;
    } catch (error) {
      console.error('Error creating organization:', error);
      setError(error.message || 'Failed to create organization');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add team member
  const addTeamMember = useCallback(async (member) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if organization exists and has an ID
      if (!onboardingData.organization || !onboardingData.organization.id) {
        const errorMsg = 'You must create an organization before adding team members';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      const newMember = await teamMembersAPI.addTeamMember(member);
      
      setOnboardingData(prev => ({
        ...prev,
        teamMembers: [...(prev.teamMembers || []), newMember]
      }));
      
      return newMember;
    } catch (error) {
      console.error('Error adding team member:', error);
      setError(error.message || 'Failed to add team member');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onboardingData.organization]);

  // Remove team member
  const removeTeamMember = useCallback(async (memberId) => {
    try {
      setLoading(true);
      setError(null);
      
      await teamMembersAPI.removeTeamMember(memberId);
      
      setOnboardingData(prev => ({
        ...prev,
        teamMembers: (prev.teamMembers || []).filter(member => member.id !== memberId)
      }));
    } catch (error) {
      console.error('Error removing team member:', error);
      setError(error.message || 'Failed to remove team member');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update team member
  const updateTeamMember = useCallback((memberId, data) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: (prev.teamMembers || []).map(member => 
        member.id === memberId ? { ...member, ...data } : member
      )
    }));
  }, []);

  // Add role
  const addRole = useCallback(async (role) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if organization exists and has an ID
      if (!onboardingData.organization || !onboardingData.organization.id) {
        const errorMsg = 'You must create an organization before adding roles';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Format the data for the API
      const roleData = {
        name: role.name,
        description: role.description,
        permission_ids: role.permissions // Backend expects permission_ids
      };
      
      const newRole = await rolesAPI.createRole(roleData);
      
      setOnboardingData(prev => ({
        ...prev,
        roles: [...(prev.roles || []), newRole]
      }));
      
      return newRole;
    } catch (error) {
      console.error('Error adding role:', error);
      setError(error.message || 'Failed to add role');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onboardingData.organization]);

  // Remove role
  const removeRole = useCallback(async (roleId) => {
    try {
      setLoading(true);
      setError(null);
      
      await rolesAPI.deleteRole(roleId);
      
      setOnboardingData(prev => ({
        ...prev,
        roles: (prev.roles || []).filter(role => role.id !== roleId)
      }));
    } catch (error) {
      console.error('Error removing role:', error);
      setError(error.message || 'Failed to remove role');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update role
  const updateRole = useCallback(async (roleId, data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Format the data for the API if it contains permissions
      const roleData = {
        ...data,
        permission_ids: data.permissions // Backend expects permission_ids
      };
      delete roleData.permissions;
      
      const updatedRole = await rolesAPI.updateRole(roleId, roleData);
      
      setOnboardingData(prev => ({
        ...prev,
        roles: (prev.roles || []).map(role => 
          role.id === roleId ? updatedRole : role
        )
      }));
      
      return updatedRole;
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error.message || 'Failed to update role');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await onboardingAPI.completeOnboarding();
      
      setOnboardingData(prev => ({
        ...prev,
        completed: true
      }));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError(error.message || 'Failed to complete onboarding');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigation controls
  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const nextStepValue = prev + 1;
      // Save current step to localStorage as a backup
      localStorage.setItem('taskflow_onboarding_step', nextStepValue);
      return nextStepValue;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => {
      const prevStepValue = prev - 1;
      // Save current step to localStorage as a backup
      localStorage.setItem('taskflow_onboarding_step', prevStepValue);
      return prevStepValue;
    });
  }, []);

  // Reset onboarding for testing
  const resetOnboarding = useCallback(async () => {
    // This would need a backend endpoint to reset onboarding
    // For now, just reset the local state
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
    setTitles([]);
  }, []);

  const value = {
    currentStep,
    onboardingData,
    loading,
    error,
    titles,
    addTitle,
    removeTitle,
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