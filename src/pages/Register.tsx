import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isRegistering, registerError, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    register({ email, password, fullName });
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
            Crear tu Cuenta
          </h2>
          <p className="mt-2 text-sm text-charcoal-600">
            Únete a nuestra plataforma educativa
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {registerError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-slide-down">
              {(registerError as any)?.response?.data?.message
                ? Array.isArray((registerError as any).response.data.message)
                  ? (registerError as any).response.data.message.join(', ')
                  : (registerError as any).response.data.message
                : registerError instanceof Error
                  ? registerError.message
                  : 'Error al registrarse'}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-charcoal-800 mb-2">
                Nombre Completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-charcoal-200 placeholder-charcoal-400 text-charcoal-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent transition-all duration-200"
                placeholder="Juan Pérez"
              />
            </div>

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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-charcoal-200 placeholder-charcoal-400 text-charcoal-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs text-charcoal-500">
                Mínimo 6 caracteres, debe incluir mayúscula, minúscula y número
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-charcoal-800 mb-2">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-charcoal-200 placeholder-charcoal-400 text-charcoal-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isRegistering}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-inspira-primary to-inspira-primary-light hover:from-inspira-primary-dark hover:to-inspira-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inspira-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-green hover:shadow-green-lg"
            >
              {isRegistering ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-charcoal-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-semibold text-inspira-primary hover:text-inspira-primary-dark transition-colors duration-200"
              >
                Inicia sesión aquí
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
