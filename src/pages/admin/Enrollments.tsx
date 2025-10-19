import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter
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
      active: { color: 'bg-green-100 text-green-800', label: 'Activa', icon: CheckCircle },
      pending_payment: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente', icon: Clock },
      inactive: { color: 'bg-red-100 text-red-800', label: 'Inactiva', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expirada', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
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

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Solicitudes de Suscripción
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona las solicitudes de suscripción de los estudiantes
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
              <span className="text-yellow-800 font-semibold">
                {pendingCount} solicitud{pendingCount !== 1 ? 'es' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Info</h3>
          <div className="text-sm space-y-1">
            <div>isLoading: {isLoading ? '✅ true' : '❌ false'}</div>
            <div>enrollments: {enrollments ? `✅ array con ${enrollments.length} items` : '❌ null/undefined'}</div>
            <div>error: {error ? '❌ ' + String(error) : '✅ sin errores'}</div>
            <div>filteredEnrollments: {filteredEnrollments ? `${filteredEnrollments.length} items` : 'null'}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {(() => {
            console.log('🎨 Renderizando tabla:');
            console.log('  - isLoading:', isLoading);
            console.log('  - filteredEnrollments:', filteredEnrollments);
            console.log('  - condición cumplida:', !isLoading && filteredEnrollments && filteredEnrollments.length > 0);
            return null;
          })()}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Cargando solicitudes...</div>
            </div>
          ) : filteredEnrollments && filteredEnrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.user?.fullName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {enrollment.subscriptionPlan?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(enrollment.amountPaid)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(enrollment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(enrollment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewEnrollment(enrollment)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {enrollment.status === 'pending_payment' && (
                            <>
                              <button
                                onClick={() => handleApprove(enrollment.id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Aprobar"
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(enrollment.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Rechazar"
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="w-5 h-5" />
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
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron solicitudes</p>
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
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cerrar
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectedEnrollment && handleReject(selectedEnrollment.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    disabled={rejectMutation.isPending}
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => selectedEnrollment && handleApprove(selectedEnrollment.id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    disabled={approveMutation.isPending}
                  >
                    Aprobar
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Información del Usuario
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nombre:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedEnrollment.user?.fullName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedEnrollment.user?.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Información de la Suscripción
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plan:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedEnrollment.subscriptionPlan?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monto:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(selectedEnrollment.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    {getStatusBadge(selectedEnrollment.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fecha de solicitud:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(selectedEnrollment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedEnrollment.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expira:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedEnrollment.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Voucher */}
              {selectedEnrollment.paymentVoucherUrl && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Comprobante de Pago
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={`http://localhost:3000/${selectedEnrollment.paymentVoucherUrl}`}
                      alt="Comprobante de pago"
                      className="w-full h-auto rounded-lg"
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
