const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'
  : '/api';

export default API_BASE_URL;