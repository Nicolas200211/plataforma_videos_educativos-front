import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { subscriptionsService } from '../../services/subscriptions.service';
import type { SubscriptionPlan } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useAuthQuery } from '../../hooks';

export function SubscriptionPlans() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Usando useAuthQuery - automáticamente verifica el token
  const { data: plans, isLoading } = useAuthQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsService.getAllPlans(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionsService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => subscriptionsService.togglePlanActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este plan?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string) => {
    toggleMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando planes...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Planes de Suscripción</h1>
        <button
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
              !plan.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    plan.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{plan.description}</p>

              <div className="mb-4">
                <div className="text-4xl font-bold text-indigo-600 mb-1">
                  {formatCurrency(plan.price)}
                </div>
                <div className="text-sm text-gray-500">
                  por {plan.durationMonths} {plan.durationMonths === 1 ? 'mes' : 'meses'}
                </div>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Características:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(plan.id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {plan.isActive ? (
                    <ToggleRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 mr-1" />
                  )}
                  {plan.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {plan ? 'Editar Plan' : 'Nuevo Plan'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Plan
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (USD)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (meses)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Características (una por línea)
              </label>
              <textarea
                rows={5}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Acceso a todos los videos&#10;Soporte prioritario&#10;Certificados"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Plan activo
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
