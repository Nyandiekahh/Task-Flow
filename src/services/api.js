import axios from 'axios';

// Get API base URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
    const response = await api.post('/auth/token/', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    console.log('API register called with:', userData);
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
  
  resetPassword: async (email) => {
    const response = await api.post('/auth/password-reset/', { email });
    return response.data;
  },
  
  confirmResetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/password-reset-verify/', {
      email,
      otp,
      new_password: newPassword
    });
    return response.data;
  },
  
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
    return response.data;
  },
};

// Organization API service
export const organizationAPI = {
  createOrganization: async (organizationData) => {
    const response = await api.post('/organizations/', organizationData);
    return response.data;
  },
  
  getOrganization: async () => {
    const response = await api.get('/organizations/');
    return response.data;
  },
  
  updateOrganization: async (id, organizationData) => {
    const response = await api.patch(`/organizations/${id}/`, organizationData);
    return response.data;
  },
};

// Team Members API service
export const teamMembersAPI = {
  getTeamMembers: async () => {
    const response = await api.get('/team-members/');
    return response.data;
  },
  
  addTeamMember: async (memberData) => {
    const response = await api.post('/team-members/', memberData);
    return response.data;
  },
  
  removeTeamMember: async (id) => {
    const response = await api.delete(`/team-members/${id}/`);
    return response.data;
  },
};

// Titles API service
export const titlesAPI = {
  getTitles: async () => {
    const response = await api.get('/titles/');
    return response.data;
  },
  
  createTitle: async (titleData) => {
    const response = await api.post('/titles/', titleData);
    return response.data;
  },
  
  deleteTitle: async (id) => {
    const response = await api.delete(`/titles/${id}/`);
    return response.data;
  },
};

// Roles API service
export const rolesAPI = {
  getRoles: async () => {
    const response = await api.get('/roles/');
    return response.data;
  },
  
  createRole: async (roleData) => {
    const response = await api.post('/roles/', roleData);
    return response.data;
  },
  
  updateRole: async (id, roleData) => {
    const response = await api.patch(`/roles/${id}/`, roleData);
    return response.data;
  },
  
  deleteRole: async (id) => {
    const response = await api.delete(`/roles/${id}/`);
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
    const response = await api.get('/permissions/');
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
    
    const response = await api.get(`/tasks/?${queryParams.toString()}`);
    return response.data;
  },
  
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
  },
  
  createTask: async (taskData) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },
  
  updateTask: async (id, taskData) => {
    const response = await api.patch(`/tasks/${id}/`, taskData);
    return response.data;
  },
  
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}/`);
    return response.data;
  },
  
  assignTask: async (id, teamMemberId) => {
    const response = await api.post(`/tasks/${id}/assign/`, { team_member_id: teamMemberId });
    return response.data;
  },
  
  delegateTask: async (id, teamMemberId, delegationNotes = '') => {
    const response = await api.post(`/tasks/${id}/delegate/`, {
      team_member_id: teamMemberId,
      delegation_notes: delegationNotes
    });
    return response.data;
  },
  
  approveTask: async (id) => {
    const response = await api.post(`/tasks/${id}/approve/`, {});
    return response.data;
  },
  
  rejectTask: async (id, rejectionReason) => {
    const response = await api.post(`/tasks/${id}/reject/`, { rejection_reason: rejectionReason });
    return response.data;
  },
  
  addComment: async (id, text) => {
    const response = await api.post(`/tasks/${id}/add_comment/`, { text });
    return response.data;
  },
  
  addAttachment: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/tasks/${id}/add_attachment/`, formData, {
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
    const url = taskId ? `/comments/?task_id=${taskId}` : '/comments/';
    const response = await api.get(url);
    return response.data;
  },
  
  createComment: async (commentData) => {
    const response = await api.post('/comments/', commentData);
    return response.data;
  },
  
  updateComment: async (id, commentData) => {
    const response = await api.put(`/comments/${id}/`, commentData);
    return response.data;
  },
  
  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}/`);
    return response.data;
  },
};

// Task history API service
export const historyAPI = {
  getTaskHistory: async (taskId = null) => {
    const url = taskId ? `/history/?task_id=${taskId}` : '/history/';
    const response = await api.get(url);
    return response.data;
  },
};

// Onboarding API service
export const onboardingAPI = {
  getOnboardingData: async () => {
    const response = await api.get('/onboarding/data/');
    return response.data;
  },
  
  completeOnboarding: async () => {
    const response = await api.post('/onboarding/complete/');
    return response.data;
  },
};

// Export all APIs
const apiServices = {
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

export default apiServices;