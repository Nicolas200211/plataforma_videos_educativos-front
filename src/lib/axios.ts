import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (config.method === 'post' || config.method === 'patch' || config.method === 'delete') {
      console.log('🔵 REQUEST:', config.method.toUpperCase(), config.url);
      console.log('🔑 Token leído:', token ? `${token.substring(0, 20)}...` : 'NULL');
    }

    if (token) {
      // Asegurarse de que headers exista y sea un objeto
      if (!config.headers) {
        config.headers = {};
      }
      // Establecer el header de autorización
      config.headers['Authorization'] = `Bearer ${token}`;

      if (config.method === 'post' || config.method === 'patch' || config.method === 'delete') {
        console.log('✅ Authorization header SET:', `Bearer ${token.substring(0, 20)}...`);
      }
    } else {
      console.log('❌ NO HAY TOKEN en localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No redirigir a login si el error 401 viene de estos endpoints:
    // - check-access: retorna 401 cuando no hay suscripción activa
    // - enrollments/my-enrollment: retorna 401 cuando no hay enrollment o no está autenticado
    const isCheckAccessEndpoint = error.config?.url?.includes('check-access');
    const isMyEnrollmentEndpoint = error.config?.url?.includes('enrollments/my-enrollment');

    if (error.response?.status === 401) {
      console.log('❌ ERROR 401 en:', error.config?.url);
      console.log('   Mensaje:', error.response?.data?.message);
      console.log('   isCheckAccess?', isCheckAccessEndpoint);
      console.log('   isMyEnrollment?', isMyEnrollmentEndpoint);

      if (!isCheckAccessEndpoint && !isMyEnrollmentEndpoint) {
        console.log('🔄 NORMALMENTE REDIRIGIRÍA A LOGIN...');
        // TEMPORALMENTE BLOQUEADO CON ALERT PARA DEBUG
        alert(`ERROR 401 en: ${error.config?.url}\n\nAbre la consola (F12) y revisa los logs AHORA antes de cerrar este alert.\n\nMensaje: ${error.response?.data?.message}`);
        // localStorage.removeItem('access_token');
        // localStorage.removeItem('user');
        // window.location.href = '/login';
      } else {
        console.log('✋ No se redirige (endpoint en whitelist)');
      }
    }
    return Promise.reject(error);
  }
);
