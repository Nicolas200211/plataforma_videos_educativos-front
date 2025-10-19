import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useMemo } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials, RegisterData } from '../types';

/**
 * Hook personalizado para manejar autenticación
 * Proporciona información sobre el estado de autenticación del usuario
 * y métodos para login, registro y logout
 *
 * @example
 * const { user, isAdmin, isStudent, login, logout } = useAuth();
 */
export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth, logout: logoutStore, user, isAuthenticated } = useAuthStore();

  // Verificar si hay token en localStorage
  // Dependemos de isAuthenticated para que se re-calcule cuando cambie el estado
  const hasToken = useMemo(() => {
    return !!localStorage.getItem('access_token');
  }, [isAuthenticated]);

  // Verificar si el usuario está completamente autenticado
  // (tiene token Y tiene datos de usuario en el store)
  const isFullyAuthenticated = useMemo(() => {
    return hasToken && isAuthenticated && !!user;
  }, [hasToken, isAuthenticated, user]);

  // Verificar roles
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isStudent = useMemo(() => user?.role === 'student', [user]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/videos');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      navigate('/student/videos');
    },
  });

  const logout = () => {
    authService.logout();
    logoutStore();
    queryClient.clear();
    navigate('/login');
  };

  return {
    // Métodos
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,

    // Estado del usuario
    user,
    isAuthenticated,
    hasToken,
    isFullyAuthenticated,

    // Roles
    isAdmin,
    isStudent,

    // Estados de carga
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,

    // Errores
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
