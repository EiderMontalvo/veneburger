import axios from 'axios';

// Crear instancia de axios con la URL base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api', // Ajusta esta URL a tu backend
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para añadir token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores comunes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Manejar errores de autenticación
    if (response && response.status === 401) {
      localStorage.removeItem('authToken');
      // Redirigir solo si no estamos ya en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Transformar respuesta de error
    const errorData = {
      message: response?.data?.mensaje || 'Ha ocurrido un error',
      status: response?.status || 500,
      data: response?.data || {},
    };
    
    return Promise.reject(errorData);
  }
);

export default api;