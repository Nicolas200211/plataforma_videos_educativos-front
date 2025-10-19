import { Users, Video, DollarSign, TrendingUp } from 'lucide-react';
import { api } from '../../lib/axios';
import { useAuthQuery } from '../../hooks';

export function AdminDashboard() {
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
      color: 'bg-blue-500',
    },
    {
      name: 'Total Videos',
      value: stats?.totalVideos || 0,
      icon: Video,
      color: 'bg-green-500',
    },
    {
      name: 'Planes Disponibles',
      value: stats?.totalPlans || 0,
      icon: TrendingUp,
      color: 'bg-indigo-500',
    },
    {
      name: 'Suscripciones Activas',
      value: stats?.activeEnrollments || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: 'Ingresos Totales',
      value: `S/ ${stats?.totalRevenue?.toFixed(2) || 0}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen</h2>
        <p className="text-gray-600">
          Bienvenido al panel de administración. Desde aquí puedes gestionar todos los aspectos
          de tu plataforma educativa.
        </p>
      </div>
    </div>
  );
}
