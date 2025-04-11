import api from './api';

// Conversations
export const getConversations = () => {
  return api.get('/messaging/conversations/');
};

export const getConversation = (id) => {
  return api.get(`/messaging/conversations/${id}/`);
};

export const createConversation = (data) => {
  return api.post('/messaging/conversations/', data);
};

export const addParticipant = (conversationId, userId) => {
  return api.post(`/messaging/conversations/${conversationId}/add_participant/`, { user_id: userId });
};

export const removeParticipant = (conversationId, userId) => {
  return api.post(`/messaging/conversations/${conversationId}/remove_participant/`, { user_id: userId });
};

export const getOrganizationUsers = (organizationId) => {
  if (!organizationId) {
    return Promise.reject(new Error('Organization ID is required'));
  }
  
  console.log("Fetching organization users for ID:", organizationId);
  return api.get('/messaging/conversations/organization_users/', {
    params: { organization_id: organizationId }
  });
};

// Messages
export const getMessages = (conversationId, params = {}) => {
  if (!conversationId) {
    return Promise.reject(new Error('Conversation ID is required'));
  }
  
  return api.get('/messaging/messages/', {
    params: {
      conversation_id: conversationId,
      ...params
    }
  });
};

export const sendMessage = (data) => {
  // Add basic validation
  if (!data.conversation || !data.content) {
    return Promise.reject(new Error('Conversation and content are required'));
  }
  
  return api.post('/messaging/messages/', data);
};

export const sendMessageWithAttachments = (conversationId, content, files) => {
  // Validate inputs
  if (!conversationId || (!content && files.length === 0)) {
    return Promise.reject(new Error('Conversation ID and content or files are required'));
  }
  
  const formData = new FormData();
  formData.append('conversation', conversationId);
  
  // Only append content if it exists
  if (content) {
    formData.append('content', content);
  }
  
  files.forEach((file, index) => {
    formData.append(`files`, file, file.name || `file-${index}`);
  });
  
  return api.post('/messaging/messages/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const markAsRead = (messageId) => {
  if (!messageId) {
    return Promise.reject(new Error('Message ID is required'));
  }
  
  return api.post(`/messaging/messages/${messageId}/read/`);
};

export const reactToMessage = (messageId, reaction) => {
  if (!messageId || !reaction) {
    return Promise.reject(new Error('Message ID and reaction are required'));
  }
  
  return api.post(`/messaging/messages/${messageId}/react/`, { reaction });
};

export const pinMessage = (messageId) => {
  if (!messageId) {
    return Promise.reject(new Error('Message ID is required'));
  }
  
  return api.post(`/messaging/messages/${messageId}/pin/`);
};

export const unpinMessage = (messageId) => {
  if (!messageId) {
    return Promise.reject(new Error('Message ID is required'));
  }
  
  return api.post(`/messaging/messages/${messageId}/unpin/`);
};

export const saveMessage = (messageId) => {
  if (!messageId) {
    return Promise.reject(new Error('Message ID is required'));
  }
  
  return api.post(`/messaging/messages/${messageId}/save/`);
};

export const unsaveMessage = (messageId) => {
  if (!messageId) {
    return Promise.reject(new Error('Message ID is required'));
  }
  
  return api.post(`/messaging/messages/${messageId}/unsave/`);
};

export const getThreadMessages = (parentMessageId) => {
  if (!parentMessageId) {
    return Promise.reject(new Error('Parent Message ID is required'));
  }
  
  return api.get('/messaging/messages/thread/', {
    params: { parent_message_id: parentMessageId }
  });
};

export const getSavedMessages = () => {
  return api.get('/messaging/messages/saved/');
};

export const getPinnedMessages = (conversationId) => {
  if (!conversationId) {
    return Promise.reject(new Error('Conversation ID is required'));
  }
  
  return api.get('/messaging/messages/pinned/', {
    params: { conversation_id: conversationId }
  });
};

export const sendTypingIndicator = (messageId) => {
  if (!messageId) {
    return Promise.reject(new Error('Message ID is required'));
  }
  
  return api.post(`/messaging/messages/${messageId}/typing/`);
};