// src/services/api.js

// API base URL (replace with your production URL when deploying)
const API_URL = 'http://127.0.0.1:8000/api/v1';

// Helper function to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Handle common API response errors
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Format error message from the backend
    const errorMessage = data.detail || 
                         (typeof data === 'object' ? Object.values(data).flat().join(', ') : data) || 
                         'Unknown error occurred';
    throw new Error(errorMessage);
  }
  
  return data;
};

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: async (email, password, name) => {
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          confirm_password: password,
          name
        }),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await handleResponse(response);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me/`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Confirm password reset
  confirmPasswordReset: async (uid, token, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/password-reset-confirm/${uid}/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          confirm_password: password
        }),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// Organization API endpoints
export const organizationAPI = {
  // Create organization
  createOrganization: async (organizationData) => {
    try {
      const response = await fetch(`${API_URL}/organizations/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(organizationData),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Get organization
  getOrganization: async () => {
    try {
      const response = await fetch(`${API_URL}/organizations/`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Update organization
  updateOrganization: async (organizationId, organizationData) => {
    try {
      const response = await fetch(`${API_URL}/organizations/${organizationId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(organizationData),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
};

// Titles API endpoints
export const titlesAPI = {
  // Create title
  createTitle: async (titleName) => {
    try {
      const response = await fetch(`${API_URL}/titles/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: titleName }),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Get titles
  getTitles: async () => {
    try {
      const response = await fetch(`${API_URL}/titles/`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Delete title
  deleteTitle: async (titleId) => {
    try {
      const response = await fetch(`${API_URL}/titles/${titleId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.status === 204) {
        return { success: true };
      }
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
};

// Team Members API endpoints
export const teamMembersAPI = {
  // Add team member
  addTeamMember: async (memberData) => {
    try {
      const response = await fetch(`${API_URL}/team-members/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(memberData),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Get team members
  getTeamMembers: async () => {
    try {
      const response = await fetch(`${API_URL}/team-members/`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Delete team member
  removeTeamMember: async (memberId) => {
    try {
      const response = await fetch(`${API_URL}/team-members/${memberId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.status === 204) {
        return { success: true };
      }
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
};

// Roles API endpoints
export const rolesAPI = {
  // Get all permissions
  getPermissions: async () => {
    try {
      const response = await fetch(`${API_URL}/permissions/`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Create role
  createRole: async (roleData) => {
    try {
      const response = await fetch(`${API_URL}/roles/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Get roles
  getRoles: async () => {
    try {
      const response = await fetch(`${API_URL}/roles/`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Update role
  updateRole: async (roleId, roleData) => {
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Delete role
  deleteRole: async (roleId) => {
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.status === 204) {
        return { success: true };
      }
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
};

// Onboarding API endpoints
export const onboardingAPI = {
  // Get onboarding data
  getOnboardingData: async () => {
    try {
      const response = await fetch(`${API_URL}/onboarding/data/`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // Complete onboarding
  completeOnboarding: async () => {
    try {
      const response = await fetch(`${API_URL}/onboarding/complete/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
};