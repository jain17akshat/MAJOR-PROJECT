import api from './axios';
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getProductStats = () => api.get('/products/stats/summary');
export const bulkImport = (formData) => api.post('/products/bulk-import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
