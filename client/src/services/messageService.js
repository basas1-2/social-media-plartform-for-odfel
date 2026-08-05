import api from './api';

export const createConversation = (receiverId) =>
  api.post('/conversations', { receiverId });
export const getConversations = () => api.get('/conversations');
export const getMessages = (conversationId) =>
  api.get(`/conversations/${conversationId}/messages`);

export const sendMessage = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  return api.post('/messages', formData);
};

export const markAsSeen = (messageId) => api.put(`/messages/${messageId}/seen`);
export const deleteMessage = (messageId) => api.delete(`/messages/${messageId}`);
