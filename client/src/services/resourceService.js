import api from './api';

export const uploadResource = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  return api.post('/resources', formData);
};

export const getResources = (category = 'all', courseCode = '', search = '') =>
  api.get(`/resources?category=${category}&courseCode=${encodeURIComponent(courseCode)}&search=${encodeURIComponent(search)}`);

export const incrementDownload = (id) => api.put(`/resources/${id}/download`);

export const toggleUpvoteResource = (id) => api.put(`/resources/${id}/upvote`);
