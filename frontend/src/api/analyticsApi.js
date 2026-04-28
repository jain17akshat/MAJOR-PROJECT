import api from './axios';
export const getDashboard = () => api.get('/analytics/dashboard');
export const getTrends = (params) => api.get('/analytics/trends', { params });
export const getTopProducts = (params) => api.get('/analytics/top-products', { params });
export const getSlowMoving = (params) => api.get('/analytics/slow-moving', { params });
export const getCategoryBreakdown = () => api.get('/analytics/category-breakdown');
export const getRestockSuggestions = () => api.get('/analytics/restock-suggestions');
