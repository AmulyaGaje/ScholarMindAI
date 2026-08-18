import api from './api';
export default {
  search: async (query, type) => (await api.get('/search', { params: { q: query, type } })).data,
};
