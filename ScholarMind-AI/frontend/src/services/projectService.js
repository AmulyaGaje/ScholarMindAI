import api from './api';
export default {
  list: async () => (await api.get('/projects')).data,
  create: async (data) => (await api.post('/projects', data)).data,
  get: async (id) => (await api.get(`/projects/${id}`)).data,
  delete: async (id) => (await api.delete(`/projects/${id}`)).data,
};
