import api from './api';

export const linkService = {
  create:  (data) => api.post('/links', data),
  getAll:  ()     => api.get('/links'),
  delete:  (id)   => api.delete(`/links/${id}`),
  getStats:(id)   => api.get(`/links/${id}/stats`),
};
