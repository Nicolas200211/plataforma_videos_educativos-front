import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Crown } from 'lucide-react';
import { subscriptionsService } from '../../services/subscriptions.service';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Modal } from '../../components/Modal';
import { PaymentVoucherModal } from '../../components/PaymentVoucherModal';
import { useToast } from '../../hooks/useToast';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { useAuthQuery } from '../../hooks';
import { useState } from 'react';
import type { SubscriptionPlan } from '../../types';

export function SubscriptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const toast = useToast();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isSubmissionConfirmModalOpen, setIsSubmissionConfirmModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Usando useAuthQuery - automáticamente verifica el token
  const { data: plans, isLoading } = useAuthQuery({
    queryKey: ['active-subscription-plans'],
    queryFn: async () => {
      const data = await subscriptionsService.getActivePlans();
      console.log('Plans con videos:', data);
      return data;
    },
  });

  const { data: myEnrollment } = useAuthQuery({
    queryKey: ['my-enrollment'],
    queryFn: () => subscriptionsService.getMyEnrollment(),
  });

  const subscribeMutation = useMutation({
    mutationFn: ({ planId, voucherFile }: { planId: string; voucherFile: File }) =>
      subscriptionsService.createEnrollment(user!.id, planId, voucherFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollment'] });
      queryClient.invalidateQueries({ queryKey: ['check-access'] });
      setIsVoucherModalOpen(false);
      setIsConfirmModalOpen(false);
      setSelectedPlan(null);

      // Mostrar toast de éxito con animación
      toast.success(
        '¡Solicitud enviada exitosamente!',
        'El administrador revisará tu comprobante de pago y activará tu suscripción pronto.',
        5000
      );

      // Mostrar modal de confirmación de envío
      setIsSubmissionConfirmModalOpen(true);
    },
    onError: (error: any) => {
      let errorMessage = 'Ha ocurrido un error inesperado';
      let errorTitle = 'Error en la Solicitud';

      if (error.response?.status === 409) {
        errorMessage = 'Ya tienes una suscripción activa o una solicitud pendiente de aprobación';
        errorTitle = 'Suscripción Duplicada';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Los datos de la solicitud no son válidos';
        errorTitle = 'Datos Inválidos';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error interno del servidor. Por favor intenta más tarde';
        errorTitle = 'Error del Servidor';
      }

      toast.error(errorTitle, errorMessage, 7000);
    },
  });

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPlan(plan);
    setIsConfirmModalOpen(true);
  };

  const confirmSubscription = () => {
    // Cerrar modal de confirmación y abrir modal de voucher
    setIsConfirmModalOpen(false);
    setIsVoucherModalOpen(true);
  };

  const handleVoucherSubmit = (file: File) => {
    if (selectedPlan) {
      subscribeMutation.mutate({ planId: selectedPlan.id, voucherFile: file });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-600">Cargando planes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <StudentNavbar />

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Elige tu Plan de Suscripción
          </h1>
          <p className="text-xl text-gray-600">
            Accede a contenido educativo de calidad
          </p>
        </div>

        {/* Current Subscription Status */}
        {myEnrollment && myEnrollment.status === 'active' && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <Crown className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Suscripción Activa
                </h3>
                <p className="text-green-700">
                  {myEnrollment.subscriptionPlan?.name} -{' '}
                  Expira el {new Date(myEnrollment.expiresAt!).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-400/20 hover:-translate-y-1 flex flex-col h-full"
            >
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-gray-900">
                      {formatCurrency(plan.price).split('.')[0]}
                    </span>
                    <span className="text-gray-500 ml-2">
                      / {plan.durationMonths} {plan.durationMonths === 1 ? 'mes' : 'meses'}
                    </span>
                  </div>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Lista de Videos Incluidos */}
                {plan.videos && plan.videos.length > 0 && (
                  <div className="mb-6 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Videos Incluidos ({plan.videos.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 bg-gray-50 rounded-lg p-3">
                      {plan.videos.map((video) => (
                        <div key={video.id} className="flex items-start text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0 mt-1.5"></span>
                          <span className="line-clamp-1">{video.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón siempre en la parte inferior */}
                <div className="mt-auto">
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={
                      myEnrollment?.status === 'active' &&
                      myEnrollment.subscriptionPlanId === plan.id
                    }
                    className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 bg-gray-100 text-gray-900 hover:bg-green-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {myEnrollment?.status === 'active' &&
                    myEnrollment.subscriptionPlanId === plan.id
                      ? 'Plan Actual'
                      : myEnrollment?.status === 'active' &&
                        myEnrollment.subscriptionPlan &&
                        plan.price > myEnrollment.subscriptionPlan.price
                      ? 'Mejorar Plan'
                      : 'Suscribirse Ahora'}
                  </button>

                  {/* Indicador de Upgrade */}
                  {myEnrollment?.status === 'active' &&
                    myEnrollment.subscriptionPlan &&
                    plan.price > myEnrollment.subscriptionPlan.price && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2.5">
                        <p className="text-xs text-green-700 text-center font-medium">
                          Solo pagas la diferencia: {formatCurrency(plan.price - myEnrollment.subscriptionPlan.price)}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            ¿Por qué suscribirse?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Contenido Premium
              </h3>
              <p className="text-gray-600">
                Acceso completo a todos los videos educativos de alta calidad
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aprende a tu Ritmo
              </h3>
              <p className="text-gray-600">
                Disponibilidad 24/7 para estudiar cuando quieras
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Actualizaciones Constantes
              </h3>
              <p className="text-gray-600">
                Nuevo contenido agregado regularmente
              </p>
            </div>
          </div>
        </div>

        {/* Modal de Confirmación */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirmar Suscripción"
          footer={
            <>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSubscription}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Continuar
              </button>
            </>
          }
        >
          {selectedPlan && (
            <div className="space-y-4">
              {/* Detectar si es un upgrade */}
              {myEnrollment?.status === 'active' && myEnrollment.subscriptionPlan && selectedPlan.price > myEnrollment.subscriptionPlan.price ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Estás mejorando tu plan de suscripción:
                  </p>

                  {/* Plan Actual */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Plan Actual</p>
                    <p className="font-semibold text-gray-900">{myEnrollment.subscriptionPlan.name}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(myEnrollment.subscriptionPlan.price)}</p>
                  </div>

                  <div className="text-center text-gray-400 text-sm mb-3">↓ Mejorando a ↓</div>

                  {/* Nuevo Plan */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-3">
                    <p className="text-xs text-indigo-500 mb-1">Nuevo Plan</p>
                    <h4 className="text-lg font-semibold text-indigo-900 mb-2">
                      {selectedPlan.name}
                    </h4>
                    <p className="text-indigo-700 mb-3">{selectedPlan.description}</p>

                    <div className="flex items-baseline mb-3">
                      <span className="text-3xl font-bold text-indigo-900">
                        {formatCurrency(selectedPlan.price)}
                      </span>
                      <span className="text-indigo-600 ml-2">
                        / {selectedPlan.durationMonths}{' '}
                        {selectedPlan.durationMonths === 1 ? 'mes' : 'meses'}
                      </span>
                    </div>
                  </div>

                  {/* Diferencia a pagar */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Monto a pagar (solo diferencia):</strong>
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(selectedPlan.price - myEnrollment.subscriptionPlan.price)}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Precio nuevo plan: {formatCurrency(selectedPlan.price)} -
                      Precio plan actual: {formatCurrency(myEnrollment.subscriptionPlan.price)}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">
                    Estás a punto de suscribirte al siguiente plan:
                  </p>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-indigo-900 mb-2">
                      {selectedPlan.name}
                    </h4>
                    <p className="text-indigo-700 mb-3">{selectedPlan.description}</p>

                    <div className="flex items-baseline mb-3">
                      <span className="text-3xl font-bold text-indigo-900">
                        {formatCurrency(selectedPlan.price)}
                      </span>
                      <span className="text-indigo-600 ml-2">
                        / {selectedPlan.durationMonths}{' '}
                        {selectedPlan.durationMonths === 1 ? 'mes' : 'meses'}
                      </span>
                    </div>

                    {selectedPlan.features && selectedPlan.features.length > 0 && (
                      <div className="border-t border-indigo-200 pt-3">
                        <p className="text-sm font-medium text-indigo-900 mb-2">
                          Características incluidas:
                        </p>
                        <ul className="space-y-1">
                          {selectedPlan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-indigo-700">
                              <Check className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Después de confirmar, deberás subir un comprobante de pago.
                  El administrador revisará tu solicitud antes de activar tu suscripción.
                </p>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal de Voucher de Pago */}
        <PaymentVoucherModal
          isOpen={isVoucherModalOpen}
          onClose={() => {
            setIsVoucherModalOpen(false);
            setSelectedPlan(null);
          }}
          onSubmit={handleVoucherSubmit}
          selectedPlan={selectedPlan}
          isSubmitting={subscribeMutation.isPending}
        />

        {/* Modal de Confirmación de Envío */}
        <ConfirmationModal
          isOpen={isSubmissionConfirmModalOpen}
          onClose={() => {
            setIsSubmissionConfirmModalOpen(false);
            navigate('/student/videos');
          }}
          title="¡Solicitud Enviada!"
          message={
            <div className="space-y-3">
              <p>
                Tu solicitud de suscripción ha sido enviada exitosamente.
              </p>
              <p className="font-medium text-green-700">
                El administrador revisará tu comprobante de pago y activará tu suscripción.
              </p>
              <p className="text-sm text-gray-600">
                Serás redirigido a la página de videos en unos momentos...
              </p>
            </div>
          }
          confirmText="Ir a Videos"
          onConfirm={() => navigate('/student/videos')}
        />
        </div>
      </div>
    </div>
  );
}
