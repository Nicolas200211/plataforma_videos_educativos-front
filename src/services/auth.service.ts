import { api } from '../lib/axios';
import type { AuthResponse, LoginCredentials, RegisterData } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', registerData);
    return data;
  },

  async getProfile(): Promise<any> {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  async logout(): Promise<void> {
    // Limpiar token del localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};
