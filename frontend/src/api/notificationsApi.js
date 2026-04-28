import api from './axios';
export const getNotifications = (params) => api.get('/notifications', { params });
export const markRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllRead = () => api.patch('/notifications/mark-all-read');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
