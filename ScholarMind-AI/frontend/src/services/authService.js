import api from './api';

const authService = {
  login: async (email, password) => (await api.post('/auth/login', { email, password })).data,
  register: async (data) => (await api.post('/auth/register', data)).data,
  googleLogin: async (idToken) => (await api.post('/auth/google', { id_token: idToken })).data,
  getMe: async () => (await api.get('/auth/me')).data,
  updateProfile: async (data) => (await api.put('/auth/me', data)).data,
};

export default authService;
