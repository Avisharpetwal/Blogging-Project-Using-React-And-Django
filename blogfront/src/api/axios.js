import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});
// Refresh token helper
const refreshToken = async () => {
  const tokens = JSON.parse(localStorage.getItem('tokens'));
  if (!tokens || !tokens.refresh) return null;

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
      refresh: tokens.refresh,
    });
    const newTokens = { access: response.data.access, refresh: tokens.refresh };
    localStorage.setItem('tokens', JSON.stringify(newTokens));
    return newTokens;
  } catch {
    localStorage.removeItem('tokens');
    window.location.href = '/login';
    return null;
  }
};

// Attach access token
API.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('tokens'));
  if (tokens && tokens.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

// Handle 401 errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newTokens = await refreshToken();
      if (newTokens) {
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        return API(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
