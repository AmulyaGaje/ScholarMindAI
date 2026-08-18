import api from './api';
export default { getStats: async () => (await api.get('/stats')).data };
