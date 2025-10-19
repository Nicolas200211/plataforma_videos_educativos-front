import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Hook personalizado para queries que requieren autenticación
 * Automáticamente agrega la condición `enabled: hasToken`
 *
 * @example
 * const { data, isLoading } = useAuthQuery({
 *   queryKey: ['videos'],
 *   queryFn: () => videosService.getAll(),
 * });
 */
export function useAuthQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'enabled'> & {
    enabled?: boolean;
  }
) {
  // Verificar si hay token en localStorage
  const hasToken = useMemo(() => {
    const token = localStorage.getItem('access_token');
    console.log('🔑 useAuthQuery - hasToken:', !!token);
    return !!token;
  }, []);

  // Combinar la condición de token con cualquier condición `enabled` adicional
  const enabled = options.enabled !== undefined
    ? hasToken && options.enabled
    : hasToken;

  console.log('⚙️ useAuthQuery - enabled:', enabled, '| hasToken:', hasToken);

  return useQuery({
    ...options,
    enabled,
  });
}
