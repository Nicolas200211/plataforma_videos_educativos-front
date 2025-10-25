import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  FileCheck,
  Coins,
  Calendar,
  Users
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useToast } from '../../hooks/useToast';
import { subscriptionsService } from '../../services/subscriptions.service';
import { useAuthQuery } from '../../hooks';
import { formatCurrency } from '../../lib/utils';
import type { Enrollment } from '../../types';

export function Enrollments() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isApproveConfirmModalOpen, setIsApproveConfirmModalOpen] = useState(false);
  const [isRejectConfirmModalOpen, setIsRejectConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'approve' | 'reject'; enrollmentId: string } | null>(null);

  console.log('🔵 Enrollments component rendered');

  const { data: enrollments, isLoading, error } = useAuthQuery({
    queryKey: ['enrollments'],
    queryFn: () => {
      console.log('🚀 Ejecutando queryFn para enrollments');
      return subscriptionsService.getAllEnrollments();
    },
  });

  useEffect(() => {
    console.log('📊 Estado de la query:');
    console.log('  - isLoading:', isLoading);
    console.log('  - enrollments:', enrollments);
    console.log('  - error:', error);
    console.log('  - cantidad:', enrollments?.length || 0);
    if (enrollments && enrollments.length > 0) {
      console.log('🔍 Primer enrollment:', JSON.stringify(enrollments[0], null, 2));
      console.log('  - tiene user?', !!enrollments[0].user);
      console.log('  - tiene subscriptionPlan?', !!enrollments[0].subscriptionPlan);
    }
  }, [isLoading, enrollments, error]);

  const approveMutation = useMutation({
    mutationFn: (enrollmentId: string) =>
      subscriptionsService.approveEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setIsViewModalOpen(false);
      toast.success('Suscripción aprobada', 'La suscripción ha sido aprobada exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al aprobar', error.response?.data?.message || 'Error al aprobar la suscripción');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (enrollmentId: string) =>
      subscriptionsService.rejectEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setIsViewModalOpen(false);
      toast.success('Solicitud rechazada', 'La solicitud ha sido rechazada');
    },
    onError: (error: any) => {
      toast.error('Error al rechazar', error.response?.data?.message || 'Error al rechazar la solicitud');
    },
  });

  const handleViewEnrollment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsViewModalOpen(true);
  };

  const handleApprove = (enrollmentId: string) => {
    setPendingAction({ type: 'approve', enrollmentId });
    setIsApproveConfirmModalOpen(true);
  };

  const handleReject = (enrollmentId: string) => {
    setPendingAction({ type: 'reject', enrollmentId });
    setIsRejectConfirmModalOpen(true);
  };

  const confirmApprove = () => {
    if (pendingAction?.type === 'approve') {
      approveMutation.mutate(pendingAction.enrollmentId);
      setIsApproveConfirmModalOpen(false);
      setPendingAction(null);
    }
  };

  const confirmReject = () => {
    if (pendingAction?.type === 'reject') {
      rejectMutation.mutate(pendingAction.enrollmentId);
      setIsRejectConfirmModalOpen(false);
      setPendingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-inspira-50 text-inspira-primary', label: 'Activa', icon: CheckCircle },
      pending_payment: { color: 'bg-amber-100 text-amber-700', label: 'Pendiente', icon: Clock },
      inactive: { color: 'bg-red-100 text-red-700', label: 'Inactiva', icon: XCircle },
      expired: { color: 'bg-charcoal-100 text-charcoal-600', label: 'Expirada', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {config.label}
      </span>
    );
  };

  const filteredEnrollments = enrollments?.filter((enrollment) => {
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      enrollment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    console.log('🔎 Filtros aplicados:');
    console.log('  - statusFilter:', statusFilter);
    console.log('  - searchTerm:', searchTerm);
    console.log('  - enrollments totales:', enrollments?.length || 0);
    console.log('  - filteredEnrollments:', filteredEnrollments?.length || 0);
  }, [statusFilter, searchTerm, enrollments, filteredEnrollments]);

  const pendingCount = enrollments?.filter(e => e.status === 'pending_payment').length || 0;
  const activeCount = enrollments?.filter(e => e.status === 'active').length || 0;
  const totalRevenue = enrollments?.reduce((sum, e) => sum + (e.amountPaid || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-inspira-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal-600 font-medium">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-900">
              Solicitudes de Suscripción
            </h1>
            <p className="text-charcoal-600 mt-1">
              Gestiona y aprueba las solicitudes de suscripción de los estudiantes
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center space-x-2 bg-amber-100 border-2 border-amber-300 rounded-lg px-5 py-2.5 animate-pulse">
              <Clock className="w-5 h-5 text-amber-700" />
              <span className="text-amber-800 font-bold">
                {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Total Solicitudes</p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">{enrollments?.length || 0}</p>
              </div>
              <div className="p-3 bg-inspira-50 rounded-xl">
                <FileCheck className="w-6 h-6 text-inspira-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-amber-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Pendientes</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">{pendingCount}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Activas</p>
                <p className="text-3xl font-bold text-inspira-primary mt-1">{activeCount}</p>
              </div>
              <div className="p-3 bg-inspira-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-inspira-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-charcoal-900 mt-1">S/ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-inspira-50 rounded-xl">
                <Coins className="w-6 h-6 text-inspira-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pending_payment">Pendientes</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
                <option value="expired">Expiradas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 overflow-hidden">
          {filteredEnrollments && filteredEnrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-inspira-100">
                <thead className="bg-gradient-to-r from-inspira-50 to-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 bg-white">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-inspira-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-inspira-primary to-inspira-primary-light rounded-full flex items-center justify-center text-white font-semibold shadow-soft mr-3">
                            {enrollment.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-charcoal-900">
                              {enrollment.user?.fullName || 'N/A'}
                            </div>
                            <div className="text-xs text-charcoal-500">
                              {enrollment.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold bg-inspira-50 text-inspira-primary rounded-full">
                          {enrollment.subscriptionPlan?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-charcoal-900">
                          {formatCurrency(enrollment.amountPaid)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(enrollment.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-charcoal-700">
                          <Calendar className="w-4 h-4 mr-1.5 text-charcoal-400" />
                          {new Date(enrollment.createdAt).toLocaleDateString('es-PE')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewEnrollment(enrollment)}
                            className="p-2 text-charcoal-600 hover:bg-charcoal-50 rounded-lg transition-all duration-200"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {enrollment.status === 'pending_payment' && (
                            <>
                              <button
                                onClick={() => handleApprove(enrollment.id)}
                                className="p-2 text-inspira-primary hover:bg-inspira-50 rounded-lg transition-all duration-200"
                                title="Aprobar"
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(enrollment.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Rechazar"
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-block p-4 bg-inspira-50 rounded-full mb-4">
                <FileCheck className="w-12 h-12 text-inspira-primary" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                No se encontraron solicitudes
              </h3>
              <p className="text-charcoal-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Intenta con otros filtros de búsqueda'
                  : 'Las solicitudes de suscripción aparecerán aquí'}
              </p>
            </div>
          )}
        </div>

        {/* View/Approve Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Detalles de la Solicitud"
          size="lg"
          footer={
            selectedEnrollment?.status === 'pending_payment' ? (
              <>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2.5 text-charcoal-700 bg-charcoal-100 rounded-lg hover:bg-charcoal-200 transition-colors font-semibold"
                >
                  Cerrar
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => selectedEnrollment && handleReject(selectedEnrollment.id)}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center"
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => selectedEnrollment && handleApprove(selectedEnrollment.id)}
                    className="px-6 py-2.5 bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white rounded-lg hover:shadow-green transition-all font-semibold flex items-center"
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white rounded-lg hover:shadow-green transition-all font-semibold"
              >
                Cerrar
              </button>
            )
          }
        >
          {selectedEnrollment && (
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-sm font-bold text-charcoal-800 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-inspira-primary" />
                  Información del Usuario
                </h3>
                <div className="bg-inspira-50/50 border border-inspira-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-charcoal-600">Nombre:</span>
                    <span className="text-sm font-bold text-charcoal-900">
                      {selectedEnrollment.user?.fullName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-charcoal-600">Email:</span>
                    <span className="text-sm font-semibold text-charcoal-900">
                      {selectedEnrollment.user?.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div>
                <h3 className="text-sm font-bold text-charcoal-800 mb-3 flex items-center">
                  <FileCheck className="w-4 h-4 mr-2 text-inspira-primary" />
                  Información de la Suscripción
                </h3>
                <div className="bg-gradient-to-br from-inspira-50 to-white border border-inspira-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-charcoal-600">Plan:</span>
                    <span className="px-3 py-1 text-sm font-bold bg-white text-inspira-primary rounded-full shadow-soft">
                      {selectedEnrollment.subscriptionPlan?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-charcoal-600">Monto:</span>
                    <span className="text-lg font-bold text-inspira-primary flex items-center">
                      <Coins className="w-4 h-4 mr-1" />
                      {formatCurrency(selectedEnrollment.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-charcoal-600">Estado:</span>
                    {getStatusBadge(selectedEnrollment.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-charcoal-600">Fecha de solicitud:</span>
                    <span className="text-sm font-semibold text-charcoal-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5 text-charcoal-400" />
                      {new Date(selectedEnrollment.createdAt).toLocaleString('es-PE')}
                    </span>
                  </div>
                  {selectedEnrollment.expiresAt && (
                    <div className="flex justify-between items-center pt-2 border-t border-inspira-100">
                      <span className="text-sm font-medium text-charcoal-600">Expira:</span>
                      <span className="text-sm font-bold text-charcoal-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-charcoal-400" />
                        {new Date(selectedEnrollment.expiresAt).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Voucher */}
              {selectedEnrollment.paymentVoucherUrl && (
                <div>
                  <h3 className="text-sm font-bold text-charcoal-800 mb-3 flex items-center">
                    <FileCheck className="w-4 h-4 mr-2 text-inspira-primary" />
                    Comprobante de Pago
                  </h3>
                  <div className="border-2 border-inspira-100 rounded-xl p-2 bg-white">
                    <img
                      src={`http://localhost:3000/${selectedEnrollment.paymentVoucherUrl}`}
                      alt="Comprobante de pago"
                      className="w-full h-auto rounded-lg shadow-soft"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Modal de Confirmación de Aprobación */}
        <ConfirmationModal
          isOpen={isApproveConfirmModalOpen}
          onClose={() => {
            setIsApproveConfirmModalOpen(false);
            setPendingAction(null);
          }}
          title="¿Estás seguro de aprobar esta suscripción?"
          message={
            <div className="space-y-3">
              <p>
                Esta acción activará la suscripción del estudiante y le dará acceso completo a la plataforma.
              </p>
              <p className="font-medium text-green-700">
                El estudiante podrá acceder inmediatamente a todo el contenido.
              </p>
            </div>
          }
          confirmText="Sí, Aprobar"
          onConfirm={confirmApprove}
        />

        {/* Modal de Confirmación de Rechazo */}
        <ConfirmationModal
          isOpen={isRejectConfirmModalOpen}
          onClose={() => {
            setIsRejectConfirmModalOpen(false);
            setPendingAction(null);
          }}
          title="¿Estás seguro de rechazar esta solicitud?"
          message={
            <div className="space-y-3">
              <p>
                Esta acción rechazará la solicitud de suscripción del estudiante.
              </p>
              <p className="font-medium text-red-700">
                El estudiante no podrá acceder al contenido hasta que presente una nueva solicitud.
              </p>
            </div>
          }
          confirmText="Sí, Rechazar"
          onConfirm={confirmReject}
        />
        </div>
    );
  }
