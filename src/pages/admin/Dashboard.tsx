import { Users, Video, Coins, TrendingUp, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '../../lib/axios';
import { useAuthQuery } from '../../hooks';
import { useNavigate } from 'react-router';

export function AdminDashboard() {
  const navigate = useNavigate();
  // Usando useAuthQuery - automáticamente verifica el token
  const { data: stats, isLoading } = useAuthQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Aquí deberías implementar endpoints específicos en el backend
      const [usersRes, videosRes, enrollmentsRes, plansRes] = await Promise.all([
        api.get('/users'),
        api.get('/videos'),
        api.get('/enrollments'),
        api.get('/subscription-plans'),
      ]);

      return {
        totalUsers: usersRes.data.length,
        totalVideos: videosRes.data.length,
        totalPlans: plansRes.data.length,
        activeEnrollments: enrollmentsRes.data.filter((e: any) => e.status === 'active').length,
        pendingEnrollments: enrollmentsRes.data.filter((e: any) => e.status === 'pending_payment').length,
        totalRevenue: enrollmentsRes.data
          .filter((e: any) => e.paymentStatus === 'completed')
          .reduce((sum: number, e: any) => sum + parseFloat(e.amountPaid || 0), 0),
      };
    },
  });

  const statCards = [
    {
      name: 'Total Usuarios',
      value: stats?.totalUsers || 0,
      icon: Users,
      bgGradient: 'from-inspira-primary to-inspira-primary-light',
      iconBg: 'bg-inspira-50',
      iconColor: 'text-inspira-primary',
      trend: '+12%',
      trendUp: true,
    },
    {
      name: 'Total Videos',
      value: stats?.totalVideos || 0,
      icon: Video,
      bgGradient: 'from-inspira-600 to-inspira-500',
      iconBg: 'bg-inspira-50',
      iconColor: 'text-inspira-600',
      trend: '+8%',
      trendUp: true,
    },
    {
      name: 'Planes Disponibles',
      value: stats?.totalPlans || 0,
      icon: CreditCard,
      bgGradient: 'from-inspira-primary-light to-inspira-400',
      iconBg: 'bg-inspira-50',
      iconColor: 'text-inspira-primary-light',
      trend: '0%',
      trendUp: false,
    },
    {
      name: 'Suscripciones Activas',
      value: stats?.activeEnrollments || 0,
      icon: Activity,
      bgGradient: 'from-inspira-700 to-inspira-600',
      iconBg: 'bg-inspira-50',
      iconColor: 'text-inspira-700',
      trend: '+24%',
      trendUp: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-inspira-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal-600 font-medium">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900">Dashboard</h1>
          <p className="text-charcoal-600 mt-1">Resumen general de tu plataforma educativa</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-inspira-50 rounded-lg border border-inspira-200">
          <Activity className="w-5 h-5 text-inspira-primary" />
          <span className="text-sm font-semibold text-inspira-primary">Sistema Activo</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.name}
            className="group bg-white rounded-xl shadow-soft border border-inspira-100 p-6 hover:shadow-green transition-all duration-300 hover:-translate-y-1 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center space-x-1 text-xs font-semibold ${stat.trendUp ? 'text-inspira-primary' : 'text-charcoal-400'}`}>
                {stat.trendUp ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{stat.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-600 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-charcoal-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-inspira-primary to-inspira-primary-dark rounded-2xl shadow-green-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-inspira-100 text-sm font-medium mb-2">Ingresos Totales</p>
            <p className="text-5xl font-bold mb-1">S/ {stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
            <p className="text-inspira-200 text-sm">De suscripciones completadas</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm">
              <Coins className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Enrollments */}
        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-charcoal-900">Solicitudes Pendientes</h3>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
              {stats?.pendingEnrollments || 0}
            </span>
          </div>
          <p className="text-charcoal-600 text-sm mb-4">
            Tienes solicitudes de suscripción esperando aprobación
          </p>
          <button 
            onClick={() => navigate('/admin/enrollments')}
            className="w-full bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white py-2.5 rounded-lg font-semibold hover:shadow-green transition-all duration-200"
          >
            Ver Solicitudes
          </button>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-inspira-50 to-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-charcoal-900 mb-2">¡Bienvenido!</h3>
              <p className="text-charcoal-600 text-sm">
                Gestiona todos los aspectos de tu plataforma educativa desde un solo lugar
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-inspira-primary font-medium mt-4">
            <TrendingUp className="w-4 h-4" />
            <span>Plataforma funcionando correctamente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
