import api from './api';

export const createSchedule = (data) => api.post('/schedule', data);

export const getSchedules = (eventType = 'all', courseCode = '') =>
  api.get(`/schedule?eventType=${eventType}&courseCode=${encodeURIComponent(courseCode)}`);

export const deleteSchedule = (id) => api.delete(`/schedule/${id}`);
