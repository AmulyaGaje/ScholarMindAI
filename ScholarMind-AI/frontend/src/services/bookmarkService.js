import api from './api';

const bookmarkService = {
  list: async () => (await api.get('/bookmarks')).data,
  add: async (paperId) => (await api.post('/bookmarks', { paper_id: paperId })).data,
  remove: async (id) => (await api.delete(`/bookmarks/${id}`)).data,
};

export default bookmarkService;
