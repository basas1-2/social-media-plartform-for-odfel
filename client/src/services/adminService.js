import api from './api';

export const getStats = () => api.get('/admin/stats');
export const getAllUsers = (page = 1) => api.get(`/admin/users?page=${page}`);
export const getAdminPosts = () => api.get('/admin/posts');
export const toggleSuspend = (userId) => api.put(`/admin/users/${userId}/suspend`);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const deletePost = (postId) => api.delete(`/admin/posts/${postId}`);
export const getReports = () => api.get('/reports');
export const updateReportStatus = (reportId, status) =>
  api.put(`/reports/${reportId}`, { status });
