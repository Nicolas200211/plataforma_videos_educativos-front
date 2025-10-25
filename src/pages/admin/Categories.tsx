import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, EyeOff, FolderOpen, Tag, Check, X } from 'lucide-react';
import { categoriesService } from '../../services/categories.service';
import { useAuthQuery } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { Category } from '../../types';

export function Categories() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { data: categories, isLoading } = useAuthQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesService.getAllAdmin(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Categoría eliminada', 'La categoría ha sido eliminada exitosamente');
      setCategoryToDelete(null);
    },
    onError: (error: any) => {
      toast.error('Error al eliminar', error.response?.data?.message || 'No se pudo eliminar la categoría');
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  const activeCount = categories?.filter(c => c.isActive).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-inspira-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal-600 font-medium">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900">Categorías</h1>
          <p className="text-charcoal-600 mt-1">Organiza tus videos por categorías temáticas</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white rounded-lg font-semibold hover:shadow-green transition-all duration-200 space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Total Categorías</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-1">{categories?.length || 0}</p>
            </div>
            <div className="p-3 bg-inspira-50 rounded-xl">
              <FolderOpen className="w-6 h-6 text-inspira-primary" />
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
              <Check className="w-6 h-6 text-inspira-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Inactivas</p>
              <p className="text-3xl font-bold text-charcoal-600 mt-1">{(categories?.length || 0) - activeCount}</p>
            </div>
            <div className="p-3 bg-charcoal-50 rounded-xl">
              <X className="w-6 h-6 text-charcoal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft border border-inspira-100 overflow-hidden">
        {categories && categories.length > 0 ? (
          <table className="min-w-full divide-y divide-inspira-100">
            <thead className="bg-gradient-to-r from-inspira-50 to-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 bg-white">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-inspira-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-inspira-50 rounded-lg mr-3">
                        <FolderOpen className="w-5 h-5 text-inspira-primary" />
                      </div>
                      <div className="text-sm font-semibold text-charcoal-900">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-3 py-1 text-xs font-mono bg-charcoal-50 text-charcoal-700 rounded-md">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-charcoal-600 max-w-md truncate">
                      {category.description || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        category.isActive
                          ? 'bg-inspira-50 text-inspira-primary'
                          : 'bg-charcoal-100 text-charcoal-600'
                      }`}
                    >
                      {category.isActive ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Activa
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Inactiva
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-inspira-primary hover:bg-inspira-50 rounded-lg transition-all duration-200"
                        title="Editar categoría"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-inspira-50 rounded-full mb-4">
              <FolderOpen className="w-12 h-12 text-inspira-primary" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
              No hay categorías todavía
            </h3>
            <p className="text-charcoal-600 mb-6">
              Comienza creando tu primera categoría para organizar los videos
            </p>
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white rounded-lg font-semibold hover:shadow-green transition-all duration-200 space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primera Categoría</span>
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        type="danger"
        title="Eliminar Categoría"
        message={
          categoryToDelete ? (
            <div className="space-y-2">
              <p>¿Estás seguro de que deseas eliminar la categoría <strong>"{categoryToDelete.name}"</strong>?</p>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer. Los videos asociados a esta categoría quedarán sin categoría.</p>
            </div>
          ) : ''
        }
        confirmText="Eliminar Categoría"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CategoryModal({ category, onClose, onSuccess }: CategoryModalProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    slug: category?.slug || '',
    isActive: category?.isActive ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (category) {
        // Para actualizar, enviar todos los campos
        return categoriesService.update(category.id, data);
      } else {
        // Para crear, solo enviar name y description
        const { name, description } = data;
        return categoriesService.create({ name, description });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(
        category ? 'Categoría actualizada' : 'Categoría creada',
        category ? 'La categoría ha sido actualizada exitosamente' : 'La categoría ha sido creada exitosamente'
      );
      onSuccess();
    },
    onError: (error: any) => {
      toast.error('Error al guardar', error.response?.data?.message || 'No se pudo guardar la categoría');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-inspira-100 p-6 bg-gradient-to-r from-inspira-50 to-white">
          <h2 className="text-2xl font-bold text-charcoal-900">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <p className="text-sm text-charcoal-600 mt-1">
            {category ? 'Actualiza la información de la categoría' : 'Crea una nueva categoría para organizar tus videos'}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-2">
              Nombre de la Categoría
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400 transition-all duration-200"
                placeholder="Ej: Programación Web, Matemáticas..."
              />
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-2">
              Slug (URL amigable)
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400 transition-all duration-200 font-mono text-sm"
              placeholder="programacion-web"
            />
            <p className="mt-2 text-xs text-charcoal-500 flex items-center">
              <Check className="w-3 h-3 mr-1 text-inspira-primary" />
              Se genera automáticamente del nombre, pero puedes editarlo
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-2">
              Descripción
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400 transition-all duration-200 resize-none"
              placeholder="Describe brevemente el tipo de contenido que incluirá esta categoría..."
            />
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
              Categoría activa y visible en la plataforma
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
                  {category ? 'Guardar Cambios' : 'Crear Categoría'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
