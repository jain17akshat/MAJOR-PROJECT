import api from './axios';
export const exportReport = (params) =>
  api.get('/reports/export', { params, responseType: 'blob' });
