import api from './api';

const historyService = {
  list: async () => (await api.get('/history')).data,
  create: async (data) => (await api.post('/history', data)).data,
  delete: async (id) => (await api.delete(`/history/${id}`)).data,
  clearAll: async () => (await api.delete('/history')).data,
};

export default historyService;
