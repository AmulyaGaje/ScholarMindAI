import api from './api';

const paperService = {
  list: async (params) => (await api.get('/papers', { params })).data,
  upload: async (formData) =>
    (
      await api.post('/papers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data,
  get: async (id) => (await api.get(`/papers/${id}`)).data,
  update: async (id, data) => (await api.put(`/papers/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/papers/${id}`)).data,

  // AI Paper Analysis Endpoints
  triggerAnalysis: async (id) => (await api.post(`/papers/${id}/analyze`)).data,
  getAnalysis: async (id) => (await api.get(`/papers/${id}/analysis`)).data,
  getAnalysisStatus: async (id) => (await api.get(`/papers/${id}/analysis/status`)).data,
  downloadAnalysisPdf: async (id) => {
    const response = await api.get(`/papers/${id}/analysis/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // RAG & Advanced AI Endpoints
  chat: async (paperId, query, chatHistory = []) =>
    (await api.post(`/papers/${paperId}/chat`, { query, chat_history: chatHistory })).data,
  compare: async (paperIds) => (await api.post('/papers/compare', { paper_ids: paperIds })).data,
  getResearchGaps: async (paperIds) => (await api.post('/papers/research-gaps', { paper_ids: paperIds })).data,
  getRecommendations: async () => (await api.get('/papers/recommendations')).data,
};

export default paperService;
