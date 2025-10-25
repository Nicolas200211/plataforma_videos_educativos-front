import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Video, CreditCard, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks';

export function StudentNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white shadow-soft border-b border-inspira-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Inspira */}
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/student/videos')}>
            <img
              src="/images/Logo/logo-inspira-1.png"
              alt="Inspira"
              className="h-12 w-auto object-contain mr-3 transition-all duration-300 group-hover:scale-105"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => navigate('/student/videos')}
              className="px-4 py-2 text-charcoal-700 hover:text-inspira-primary hover:bg-inspira-50 rounded-lg transition-all duration-300 font-medium"
            >
              Videos
            </button>
            <button
              onClick={() => navigate('/student/subscription')}
              className="px-4 py-2 text-charcoal-700 hover:text-inspira-primary hover:bg-inspira-50 rounded-lg transition-all duration-300 flex items-center font-medium"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Suscripción
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-inspira-50 transition-all duration-300 group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-inspira-primary to-inspira-primary-light rounded-full flex items-center justify-center shadow-soft transition-all duration-300 group-hover:shadow-green group-hover:scale-105">
                <span className="text-white font-semibold text-sm">
                  {user?.fullName ? getInitials(user.fullName) : 'U'}
                </span>
              </div>

              {/* User Info */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-charcoal-800 group-hover:text-inspira-primary transition-colors duration-300">
                  {user?.fullName || 'Usuario'}
                </p>
                <p className="text-xs text-inspira-primary font-medium">Estudiante</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-soft-lg border border-inspira-100 py-2 z-50 animate-fade-in">
                {/* User Info in Dropdown */}
                <div className="px-4 py-3 border-b border-inspira-50 bg-inspira-50/50">
                  <p className="text-sm font-semibold text-charcoal-900">{user?.fullName || 'Usuario'}</p>
                  <p className="text-xs text-charcoal-600 mt-0.5">{user?.email || 'email@example.com'}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/student/profile');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-charcoal-700 hover:bg-inspira-50 hover:text-inspira-primary transition-all duration-300"
                  >
                    <User className="w-4 h-4 mr-3 text-inspira-400" />
                    Mi Perfil
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/student/subscription');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-charcoal-700 hover:bg-inspira-50 hover:text-inspira-primary transition-all duration-300"
                  >
                    <CreditCard className="w-4 h-4 mr-3 text-inspira-400" />
                    Mi Suscripción
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      // Aquí puedes agregar configuración más adelante
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-charcoal-700 hover:bg-inspira-50 hover:text-inspira-primary transition-all duration-300"
                  >
                    <Settings className="w-4 h-4 mr-3 text-inspira-400" />
                    Configuración
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-inspira-50 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
