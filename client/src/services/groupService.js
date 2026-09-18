import api from './api';

const getFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

export const createGroup = (data) => {
  const formData = getFormData(data);
  return api.post('/groups', formData);
};

export const getGroups = (category = 'all', search = '') =>
  api.get(`/groups?category=${category}&search=${encodeURIComponent(search)}`);

export const getGroupDetail = (id) => api.get(`/groups/${id}`);

export const toggleJoinGroup = (id) => api.put(`/groups/${id}/join`);
