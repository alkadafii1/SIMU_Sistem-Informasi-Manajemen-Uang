import axios from 'axios';

// Deteksi environment
const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment ? 'http://localhost:3001/api' : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: otomatis tambahkan token ke header jika ada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response untuk debugging
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.config?.url}`, error.message);
    
    // Handle 401 Unauthorized - token expired atau invalid
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, redirecting to login...');
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// AI Services
export const getAIHealthStatus = async () => {
  try {
    const response = await api.get('/ai/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    return { success: false, ai_api_status: 'offline' };
  }
};

export const predictFinancialHealth = async (userId, monthlyIncome) => {
  try {
    const response = await api.post('/ai/predict', { userId, monthlyIncome });
    return response.data;
  } catch (error) {
    console.error('AI Predict error:', error);
    throw error;
  }
};

// Savings Services
export const getSavingsBalance = async () => {
  try {
    const response = await api.get('/savings/balance');
    return response.data;
  } catch (error) {
    console.error('Get savings balance error:', error);
    throw error;
  }
};

export default api;