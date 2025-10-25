import { Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Video,
  CreditCard,
  Users,
  FolderOpen,
  LogOut,
  FileCheck,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera y menú móvil al cambiar de página
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Cerrar menú móvil al cambiar de página
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Videos', href: '/admin/videos', icon: Video },
    { name: 'Planes de Suscripción', href: '/admin/plans', icon: CreditCard },
    { name: 'Solicitudes Pendientes', href: '/admin/enrollments', icon: FileCheck },
    { name: 'Categorías', href: '/admin/categories', icon: FolderOpen },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-charcoal-50">
      {/* Header Superior */}
      <header className={`fixed top-0 ${isMobileMenuOpen ? 'left-72' : 'left-0'} right-0 h-16 bg-white shadow-soft border-b border-inspira-100 z-10 transition-all duration-300 lg:left-72`}>
        <div className="h-full px-6 flex items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              aria-expanded={isMobileMenuOpen}
              title={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              className="lg:hidden p-2 rounded-lg text-charcoal-600 hover:bg-charcoal-100 transition-all duration-200"
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}</span>
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
            <h1 className="text-xl font-bold text-charcoal-900">Panel de Administración</h1>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200"
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-inspira-primary to-inspira-primary-light rounded-full flex items-center justify-center shadow-soft">
                <span className="text-white font-semibold text-sm">
                  {user?.fullName ? getInitials(user.fullName) : 'A'}
                </span>
              </div>

              {/* User Info */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-charcoal-800">
                  {user?.fullName || 'Administrador'}
                </p>
                <p className="text-xs text-inspira-primary font-medium">Administrador</p>
              </div>

              <ChevronDown className={`w-4 h-4 text-charcoal-600 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-soft-lg border border-inspira-100 py-2 z-50 animate-fade-in">
                {/* User Info in Dropdown */}
                <div className="px-4 py-3 border-b border-inspira-50 bg-inspira-50/50">
                  <p className="text-sm font-semibold text-charcoal-900">{user?.fullName || 'Administrador'}</p>
                  <p className="text-xs text-charcoal-600 mt-0.5">{user?.email || 'admin@example.com'}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-inspira-primary text-white rounded">
                    Administrador
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      // Navegar a perfil si existe
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-charcoal-700 transition-all duration-200"
                  >
                    <User className="w-4 h-4 mr-3 text-inspira-400" />
                    Mi Perfil
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      // Navegar a configuración si existe
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-charcoal-700 transition-all duration-200"
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
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 transition-all duration-200 font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50 backdrop-blur-sm transition-all duration-300 ease-in-out z-50 $
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`
      }>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent">
            <div className="flex items-center justify-center h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:from-white/15 hover:to-white/10 transition-all duration-300">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-6 translate-x-6"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>

              <div className="relative z-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/images/Logo/logo-inspira-1.png"
                  alt="Inspira"
                  className="h-18 w-auto object-contain filter brightness-0 invert"
                />
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {/* Section Title */}
              <div className="px-4 mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navegación Principal</h3>
              </div>

              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`sidebar-item-hover group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 sidebar-item-enter $
                      ${isActive
                        ? 'bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white shadow-lg border border-inspira-400/50'
                        : 'text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 border border-transparent hover:border-slate-600/50'
                      }`
                    }
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-inspira-primary-light to-inspira-primary rounded-r-full"></div>
                    )}

                    {/* Icon with enhanced styling */}
                    <div className={`flex items-center justify-center w-6 h-6 mr-4 rounded-lg transition-all duration-300 $
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-700/50 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                      }`
                    }>
                      <item.icon className="w-4 h-4" />
                    </div>

                    {/* Text */}
                    <span className="flex-1 text-left">{item.name}</span>

                    {/* Hover arrow */}
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 $
                      ${isActive
                        ? 'bg-white/50 scale-100'
                        : 'bg-transparent scale-0 group-hover:bg-white/50 group-hover:scale-100'
                      }`
                    }></div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Section */}
          <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-transparent">
            <div className="flex items-center justify-center p-3 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 shadow-lg backdrop-blur-sm hover:from-white/15 hover:to-white/10 transition-all duration-300 group">
              <div className="flex items-center space-x-3 text-xs text-slate-400 group-hover:text-white transition-colors duration-300">
                <span className="font-medium">Desarrollado por</span>
                <img
                  src="/images/Logo/logo-atipay-2.png"
                  alt="Atipay Company"
                  className="h-6 w-auto object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 filter brightness-0 invert group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className={`${isMobileMenuOpen ? 'pl-72' : 'pl-0'} pt-16 transition-all duration-300 lg:pl-72`}>
        <main className="py-8 px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
