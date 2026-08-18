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
};

export default paperService;
