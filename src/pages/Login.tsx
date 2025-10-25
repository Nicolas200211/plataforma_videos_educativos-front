import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (loginError) {
      toast.error(
        'Error al iniciar sesión',
        loginError instanceof Error ? loginError.message : 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.'
      );
    }
  }, [loginError, toast]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-inspira-50 via-white to-inspira-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-soft-lg border border-inspira-100">
        <div className="text-center">
          {/* Logo Inspira */}
          <div className="flex justify-center mb-6">
            <img
              src="/images/Logo/logo-inspira-1.png"
              alt="Inspira"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-charcoal-900">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-charcoal-600">
            Accede a tu plataforma educativa
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-charcoal-800 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-charcoal-200 placeholder-charcoal-400 text-charcoal-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent transition-all duration-200"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-charcoal-800 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-charcoal-200 placeholder-charcoal-400 text-charcoal-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-inspira-primary to-inspira-primary-light hover:from-inspira-primary-dark hover:to-inspira-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inspira-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-green hover:shadow-green-lg"
            >
              {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-charcoal-600">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="font-semibold text-inspira-primary hover:text-inspira-primary-dark transition-colors duration-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>

        {/* Logo de Atipay Company */}
        <div className="pt-6 border-t border-inspira-50">
          <div className="flex justify-center items-center space-x-2 text-xs text-charcoal-500">
            <span>Desarrollado por</span>
            <img
              src="/images/Logo/logo-atipay-2.png"
              alt="Atipay Company"
              className="h-5 w-auto object-contain opacity-70"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
