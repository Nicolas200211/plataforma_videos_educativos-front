import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Crown, Check, CreditCard, Calendar, Users } from 'lucide-react';
import { subscriptionsService } from '../../services/subscriptions.service';
import type { SubscriptionPlan } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useAuthQuery } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function SubscriptionPlans() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  // Usando useAuthQuery - automáticamente verifica el token
  const { data: plans, isLoading } = useAuthQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsService.getAllPlans(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionsService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan eliminado', 'El plan de suscripción ha sido eliminado exitosamente');
      setPlanToDelete(null);
    },
    onError: (error: any) => {
      toast.error('Error al eliminar', error.response?.data?.message || 'No se pudo eliminar el plan');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => subscriptionsService.togglePlanActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Estado actualizado', 'El estado del plan ha sido actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar', error.response?.data?.message || 'No se pudo actualizar el estado del plan');
    },
  });

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
  };

  const confirmDelete = () => {
    if (planToDelete) {
      deleteMutation.mutate(planToDelete.id);
    }
  };

  const handleToggleActive = (id: string) => {
    toggleMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-inspira-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal-600 font-medium">Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900">Planes de Suscripción</h1>
          <p className="text-charcoal-600 mt-1">Gestiona los planes de suscripción de tu plataforma</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white rounded-lg font-semibold hover:shadow-green transition-all duration-200 space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Plan</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Total Planes</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-1">{plans?.length || 0}</p>
            </div>
            <div className="p-3 bg-inspira-50 rounded-xl">
              <CreditCard className="w-6 h-6 text-inspira-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Planes Activos</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-1">
                {plans?.filter(p => p.isActive).length || 0}
              </p>
            </div>
            <div className="p-3 bg-inspira-50 rounded-xl">
              <Check className="w-6 h-6 text-inspira-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Planes Disponibles</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-1">
                {plans?.filter(p => p.isActive).length || 0}
              </p>
            </div>
            <div className="p-3 bg-inspira-50 rounded-xl">
              <Calendar className="w-6 h-6 text-inspira-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan, index) => (
          <div
            key={plan.id}
            className={`bg-white rounded-xl shadow-soft border border-inspira-100 overflow-hidden hover:shadow-green transition-all duration-300 hover:-translate-y-1 ${
              !plan.isActive ? 'opacity-60' : ''
            }`}
          >
            {/* Card Header with gradient for featured plans */}
            {index === 0 && plan.isActive && (
              <div className="bg-gradient-to-r from-inspira-primary to-inspira-primary-light p-3 flex items-center justify-center space-x-2">
                <Crown className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm uppercase tracking-wide">Plan Destacado</span>
              </div>
            )}

            <div className="p-6">
              {/* Title and Status */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-charcoal-900">{plan.name}</h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    plan.isActive
                      ? 'bg-inspira-50 text-inspira-primary'
                      : 'bg-charcoal-100 text-charcoal-600'
                  }`}
                >
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Description */}
              <p className="text-charcoal-600 mb-4 min-h-[48px]">{plan.description}</p>

              {/* Price */}
              <div className="mb-4 pb-4 border-b border-inspira-100">
                <div className="text-4xl font-bold text-inspira-primary mb-1">
                  {formatCurrency(plan.price)}
                </div>
                <div className="text-sm text-charcoal-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  por {plan.durationMonths} {plan.durationMonths === 1 ? 'mes' : 'meses'}
                </div>
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-charcoal-800 mb-3 flex items-center">
                    <Check className="w-4 h-4 mr-1 text-inspira-primary" />
                    Características:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-charcoal-700 flex items-start">
                        <Check className="w-4 h-4 text-inspira-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-inspira-100">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-inspira-primary hover:bg-inspira-50 rounded-lg transition-all duration-200"
                  title="Editar plan"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Editar</span>
                </button>
                <button
                  onClick={() => handleToggleActive(plan.id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-charcoal-700 hover:bg-charcoal-50 rounded-lg transition-all duration-200"
                  title={plan.isActive ? 'Desactivar' : 'Activar'}
                >
                  {plan.isActive ? (
                    <ToggleRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">{plan.isActive ? 'Desactivar' : 'Activar'}</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(plan)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Eliminar plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {plans?.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-4 bg-inspira-50 rounded-full mb-4">
            <CreditCard className="w-12 h-12 text-inspira-primary" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
            No hay planes todavía
          </h3>
          <p className="text-charcoal-600 mb-6">
            Comienza creando tu primer plan de suscripción
          </p>
          <button
            onClick={() => {
              setEditingPlan(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white rounded-lg font-semibold hover:shadow-green transition-all duration-200 space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Primer Plan</span>
          </button>
        </div>
      )}

      {isModalOpen && (
        <PlanModal
          plan={editingPlan}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingPlan(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={confirmDelete}
        type="danger"
        title="Eliminar Plan de Suscripción"
        message={
          planToDelete ? (
            <div className="space-y-2">
              <p>¿Estás seguro de que deseas eliminar el plan <strong>"{planToDelete.name}"</strong>?</p>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer. Los usuarios con suscripciones activas de este plan podrían verse afectados.</p>
            </div>
          ) : ''
        }
        confirmText="Eliminar Plan"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

interface PlanModalProps {
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onSuccess: () => void;
}

function PlanModal({ plan, onClose, onSuccess }: PlanModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan?.price || 0,
    durationMonths: plan?.durationMonths || 1,
    features: plan?.features?.join('\n') || '',
    isActive: plan?.isActive ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const planData = {
        ...data,
        features: data.features.split('\n').filter((f: string) => f.trim()),
      };

      if (plan) {
        return subscriptionsService.updatePlan(plan.id, planData);
      } else {
        return subscriptionsService.createPlan(planData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-inspira-100 p-6 bg-gradient-to-r from-inspira-50 to-white">
          <h2 className="text-2xl font-bold text-charcoal-900">
            {plan ? 'Editar Plan de Suscripción' : 'Nuevo Plan de Suscripción'}
          </h2>
          <p className="text-sm text-charcoal-600 mt-1">
            {plan ? 'Actualiza la información del plan' : 'Crea un nuevo plan de suscripción para tus estudiantes'}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre del Plan */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-2">
              Nombre del Plan
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400 transition-all duration-200"
              placeholder="Ej: Plan Básico, Plan Premium..."
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-2">
              Descripción
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400 transition-all duration-200 resize-none"
              placeholder="Describe brevemente este plan de suscripción..."
            />
          </div>

          {/* Precio y Duración */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-2">
                Precio (S/)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500 font-medium">S/</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-2">
                Duración (meses)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                  className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent transition-all duration-200"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-2">
              Características (una por línea)
            </label>
            <textarea
              rows={6}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400 transition-all duration-200 resize-none font-mono text-sm"
              placeholder="Acceso ilimitado a todos los videos&#10;Soporte prioritario 24/7&#10;Certificados digitales&#10;Contenido exclusivo&#10;Descuentos en nuevos cursos"
            />
            <p className="text-xs text-charcoal-500 mt-2">
              Escribe cada característica en una línea nueva. Aparecerán con un ícono de check verde.
            </p>
          </div>

          {/* Estado Activo */}
          <div className="flex items-center p-4 bg-inspira-50/50 rounded-lg border border-inspira-100">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-inspira-primary border-charcoal-300 rounded focus:ring-2 focus:ring-inspira-primary cursor-pointer"
            />
            <label htmlFor="isActive" className="ml-3 text-sm font-medium text-charcoal-800 cursor-pointer select-none">
              Plan activo y visible para los estudiantes
            </label>
          </div>

          {/* Footer con Botones */}
          <div className="flex gap-3 pt-4 border-t border-inspira-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-charcoal-300 text-charcoal-700 rounded-lg font-semibold hover:bg-charcoal-50 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white rounded-lg font-semibold hover:shadow-green transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Check className="w-5 h-5 mr-2" />
                  {plan ? 'Guardar Cambios' : 'Crear Plan'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
