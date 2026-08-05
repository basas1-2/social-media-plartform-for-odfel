import api from './api';

export const getProfile = (username) => api.get(`/users/${username}`);
export const updateProfile = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  return api.put('/users/me', formData);
};
export const toggleFollow = (userId) => api.put(`/users/${userId}/follow`);
export const searchUsers = (query) => api.get(`/users/search?q=${query}`);
export const getSuggestions = () => api.get('/users/suggestions');
export const getFriends = (userId) => api.get(`/users/${userId}/friends`);
