import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});


instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      
      if (status === 401 || status === 403) {
       
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('habitNotifications');
        
       
        window.location.href = '/login';
      }
      
     
      console.error('API Error:', {
        status,
        data: error.response.data,
        url: error.config.url
      });
    }
    
    return Promise.reject(error);
  }
);

export default instance; 