import axios from 'axios';

// Get API base URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Don't add auth headers for these endpoints - using relative paths without leading slash
    const noAuthEndpoints = ['auth/verify-otp/', 'auth/token/', 'auth/register/'];
    const requiresAuth = !noAuthEndpoints.some(endpoint => config.url.includes(endpoint));

    if (requiresAuth) {
      const token = localStorage.getItem('token') || 
        localStorage.getItem('accessToken') || 
        Object.values(localStorage)
          .find(value => value && typeof value === 'string' && value.startsWith('eyJ'));
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('API Error Response:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    // Keep the original error but enhance it with the response data
    if (error.response && error.response.data) {
      error.responseData = error.response.data;
    }
    
    return Promise.reject(error);
  }
);

// Auth API service
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('auth/token/', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    console.log('API register called with:', userData);
    const response = await api.post('auth/register/', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('auth/me/');
    return response.data;
  },
  
  resetPassword: async (email) => {
    const response = await api.post('auth/password-reset/', { email });
    return response.data;
  },
  
  confirmResetPassword: async (email, otp, newPassword) => {
    const response = await api.post('auth/password-reset-verify/', {
      email,
      otp,
      new_password: newPassword
    });
    return response.data;
  },
  
  refreshToken: async (refreshToken) => {
    const response = await api.post('auth/token/refresh/', { refresh: refreshToken });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('auth/verify-otp/', { email, otp });
    return response.data;
  },

  acceptInvitation: async (token, password) => {
    const response = await api.post(`auth/invitation/${token}/`, {
      password: password
    });
    return response.data;
  },

  setPasswordWithOtp: async (email, newPassword, tempToken) => {
    // If tempToken is provided, use it in headers
    const headers = tempToken ? { Authorization: `Bearer ${tempToken}` } : {};
    
    const response = await api.post('auth/set-password/', 
      { email, new_password: newPassword },
      { headers }
    );
    return response.data;
  },

  sendTeamInvite: async (email, role, title) => {
    const response = await api.post('auth/send-invite/', { 
      email, 
      role, 
      title,
      use_otp: true // Always use OTP for invitations
    });
    return response.data;
  }
};

// Organization API service - UPDATED WITH FILE UPLOAD SUPPORT
export const organizationAPI = {
  createOrganization: async (organizationData) => {
    // Check if there's a file in the data
    const hasFile = organizationData.logo && typeof organizationData.logo === 'object' && organizationData.logo instanceof File;
    
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('name', organizationData.name);
      formData.append('industry', organizationData.industry);
      formData.append('size', organizationData.size);
      formData.append('logo', organizationData.logo);
      
      const response = await api.post('organizations/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Use JSON for data without files
      const dataToSend = { ...organizationData };
      // Remove logo if it's null or empty
      if (!dataToSend.logo) {
        delete dataToSend.logo;
      }
      
      const response = await api.post('organizations/', dataToSend);
      return response.data;
    }
  },
  
  getOrganization: async () => {
    const response = await api.get('organizations/');
    return response.data;
  },
  
  updateOrganization: async (id, organizationData) => {
    // Check if there's a file in the data
    const hasFile = organizationData.logo && typeof organizationData.logo === 'object' && organizationData.logo instanceof File;
    
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData();
      Object.keys(organizationData).forEach(key => {
        if (organizationData[key] !== null && organizationData[key] !== undefined) {
          formData.append(key, organizationData[key]);
        }
      });
      
      const response = await api.patch(`organizations/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Use JSON for data without files
      const response = await api.patch(`organizations/${id}/`, organizationData);
      return response.data;
    }
  },
};

// Team Members API service
export const teamMembersAPI = {
  getTeamMembers: async () => {
    const response = await api.get('team-members/');
    return response.data;
  },
  
  addTeamMember: async (memberData) => {
    const response = await api.post('team-members/', memberData);
    return response.data;
  },
  
  removeTeamMember: async (id) => {
    const response = await api.delete(`team-members/${id}/`);
    return response.data;
  },
};

// Titles API service
export const titlesAPI = {
  getTitles: async () => {
    const response = await api.get('titles/');
    return response.data;
  },
  
  createTitle: async (titleData) => {
    const response = await api.post('titles/', titleData);
    return response.data;
  },
  
  deleteTitle: async (id) => {
    const response = await api.delete(`titles/${id}/`);
    return response.data;
  },
};

// Roles API service - FIXED with getPermissions function
export const rolesAPI = {
  getRoles: async () => {
    const response = await api.get('roles/');
    return response.data;
  },
  
  createRole: async (roleData) => {
    const response = await api.post('roles/', roleData);
    return response.data;
  },
  
  updateRole: async (id, roleData) => {
    const response = await api.patch(`roles/${id}/`, roleData);
    return response.data;
  },
  
  deleteRole: async (id) => {
    const response = await api.delete(`roles/${id}/`);
    return response.data;
  },
  
  // ADDED: getPermissions function
  getPermissions: async () => {
    const response = await api.get('titles/available_permissions/');
    return response.data;
  },
};

// Also keep the singular versions for backward compatibility
export const teamMemberAPI = teamMembersAPI;
export const titleAPI = titlesAPI;
export const roleAPI = rolesAPI;

// Permissions API service
export const permissionAPI = {
  getPermissions: async () => {
    const response = await api.get('titles/available_permissions/');
    return response.data;
  },
};

// Tasks API service
export const taskAPI = {
  getTasks: async (filters = {}) => {
    // Convert filters object to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await api.get(`tasks/?${queryParams.toString()}`);
    return response.data;
  },
  
  getTask: async (id) => {
    const response = await api.get(`tasks/${id}/`);
    return response.data;
  },
  
  createTask: async (taskData) => {
    const response = await api.post('tasks/', taskData);
    return response.data;
  },
  
  updateTask: async (id, taskData) => {
    const response = await api.patch(`tasks/${id}/`, taskData);
    return response.data;
  },
  
  deleteTask: async (id) => {
    const response = await api.delete(`tasks/${id}/`);
    return response.data;
  },
  
  assignTask: async (id, teamMemberId) => {
    const response = await api.post(`tasks/${id}/assign/`, { team_member_id: teamMemberId });
    return response.data;
  },
  
  delegateTask: async (id, teamMemberId, delegationNotes = '') => {
    const response = await api.post(`tasks/${id}/delegate/`, {
      team_member_id: teamMemberId,
      delegation_notes: delegationNotes
    });
    return response.data;
  },
  
  approveTask: async (id) => {
    const response = await api.post(`tasks/${id}/approve/`, {});
    return response.data;
  },
  
  rejectTask: async (id, rejectionReason) => {
    const response = await api.post(`tasks/${id}/reject/`, { rejection_reason: rejectionReason });
    return response.data;
  },
  
  addComment: async (id, text) => {
    const response = await api.post(`tasks/${id}/add_comment/`, { text });
    return response.data;
  },
  
  addAttachment: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`tasks/${id}/add_attachment/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Comments API service
export const commentAPI = {
  getComments: async (taskId = null) => {
    const url = taskId ? `comments/?task_id=${taskId}` : 'comments/';
    const response = await api.get(url);
    return response.data;
  },
  
  createComment: async (commentData) => {
    const response = await api.post('comments/', commentData);
    return response.data;
  },
  
  updateComment: async (id, commentData) => {
    const response = await api.put(`comments/${id}/`, commentData);
    return response.data;
  },
  
  deleteComment: async (id) => {
    const response = await api.delete(`comments/${id}/`);
    return response.data;
  },
};

// Task history API service
export const historyAPI = {
  getTaskHistory: async (taskId = null) => {
    const url = taskId ? `history/?task_id=${taskId}` : 'history/';
    const response = await api.get(url);
    return response.data;
  },
};

// Onboarding API service
export const onboardingAPI = {
  getOnboardingData: async () => {
    const response = await api.get('onboarding/data/');
    return response.data;
  },
  
  completeOnboarding: async () => {
    const response = await api.post('onboarding/complete/');
    return response.data;
  },
};

// Export all APIs
export const apiServices = {
  authAPI,
  organizationAPI,
  teamMembersAPI,
  teamMemberAPI,
  titlesAPI,
  titleAPI,
  rolesAPI,
  roleAPI,
  permissionAPI,
  taskAPI,
  commentAPI,
  historyAPI,
  onboardingAPI,
};

// Export the axios instance as the default export instead of apiServices
export default api;