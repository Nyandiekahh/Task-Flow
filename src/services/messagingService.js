// src/services/messagingService.js
import api from './api';

// Conversations
export const getConversations = () => {
  return api.get('/api/v1/messaging/conversations/');
};

export const getConversation = (id) => {
  return api.get(`/api/v1/messaging/conversations/${id}/`);
};

export const createConversation = (data) => {
  return api.post('/api/v1/messaging/conversations/', data);
};

export const addParticipant = (conversationId, userId) => {
  return api.post(`/api/v1/messaging/conversations/${conversationId}/add_participant/`, { user_id: userId });
};

export const removeParticipant = (conversationId, userId) => {
  return api.post(`/api/v1/messaging/conversations/${conversationId}/remove_participant/`, { user_id: userId });
};

export const getOrganizationUsers = (organizationId) => {
  return api.get(`/api/v1/messaging/conversations/organization_users/?organization_id=${organizationId}`);
};

// Messages
export const getMessages = (conversationId) => {
  return api.get(`/api/v1/messaging/messages/?conversation_id=${conversationId}`);
};

export const sendMessage = (data) => {
  return api.post('/api/v1/messaging/messages/', data);
};

export const sendMessageWithAttachments = (conversationId, content, files) => {
  const formData = new FormData();
  formData.append('conversation', conversationId);
  formData.append('content', content);
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  return api.post('/api/v1/messaging/messages/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const markAsRead = (messageId) => {
  return api.post(`/api/v1/messaging/messages/${messageId}/read/`);
};

export const reactToMessage = (messageId, reaction) => {
  return api.post(`/api/v1/messaging/messages/${messageId}/react/`, { reaction });
};

export const pinMessage = (messageId) => {
  return api.post(`/api/v1/messaging/messages/${messageId}/pin/`);
};

export const unpinMessage = (messageId) => {
  return api.post(`/api/v1/messaging/messages/${messageId}/unpin/`);
};

export const saveMessage = (messageId) => {
  return api.post(`/api/v1/messaging/messages/${messageId}/save/`);
};

export const unsaveMessage = (messageId) => {
  return api.post(`/api/v1/messaging/messages/${messageId}/unsave/`);
};

export const getThreadMessages = (parentMessageId) => {
  return api.get(`/api/v1/messaging/messages/thread/?parent_message_id=${parentMessageId}`);
};

export const getSavedMessages = () => {
  return api.get('/api/v1/messaging/messages/saved/');
};

export const getPinnedMessages = (conversationId) => {
  return api.get(`/api/v1/messaging/messages/pinned/?conversation_id=${conversationId}`);
};

export const sendTypingIndicator = (messageId) => {
  return api.post(`/api/v1/messaging/messages/${messageId}/typing/`);
};