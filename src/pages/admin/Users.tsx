import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Shield, User as UserIcon, Users as UsersIcon, Calendar, Mail } from 'lucide-react';
import { usersService } from '../../services/users.service';
import { useAuthQuery } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { User } from '../../types';

export function Users() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: users, isLoading } = useAuthQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuario eliminado', 'El usuario ha sido eliminado exitosamente');
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast.error('Error al eliminar', error.response?.data?.message || 'No se pudo eliminar el usuario');
    },
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  const adminCount = users?.filter(u => u.role === 'admin').length || 0;
  const studentCount = users?.filter(u => u.role === 'student').length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-inspira-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal-600 font-medium">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900">Usuarios</h1>
          <p className="text-charcoal-600 mt-1">Gestiona los usuarios y sus roles en la plataforma</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-1">{users?.length || 0}</p>
            </div>
            <div className="p-3 bg-inspira-50 rounded-xl">
              <UsersIcon className="w-6 h-6 text-inspira-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-purple-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Administradores</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{adminCount}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Estudiantes</p>
              <p className="text-3xl font-bold text-inspira-primary mt-1">{studentCount}</p>
            </div>
            <div className="p-3 bg-inspira-50 rounded-xl">
              <UserIcon className="w-6 h-6 text-inspira-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft border border-inspira-100 overflow-hidden">
        {users && users.length > 0 ? (
          <table className="min-w-full divide-y divide-inspira-100">
            <thead className="bg-gradient-to-r from-inspira-50 to-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-inspira-primary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-inspira-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-soft ${
                        user.role === 'admin'
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                          : 'bg-gradient-to-br from-inspira-primary to-inspira-primary-light'
                      }`}>
                        {user.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-white" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-charcoal-900">{user.fullName || user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-charcoal-700">
                      <Mail className="w-4 h-4 mr-2 text-charcoal-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-inspira-50 text-inspira-primary'
                      }`}
                    >
                      {user.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Administrador
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-3 h-3 mr-1" />
                          Estudiante
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-charcoal-700">
                      <Calendar className="w-4 h-4 mr-1.5 text-charcoal-400" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-PE') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-inspira-primary hover:bg-inspira-50 rounded-lg transition-all duration-200"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Eliminar usuario"
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
              <UsersIcon className="w-12 h-12 text-inspira-primary" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
              No hay usuarios registrados
            </h3>
            <p className="text-charcoal-600">
              Los usuarios aparecerán aquí cuando se registren en la plataforma
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <UserModal
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        type="danger"
        title="Eliminar Usuario"
        message={
          userToDelete ? (
            <div className="space-y-2">
              <p>¿Estás seguro de que deseas eliminar al usuario <strong>"{userToDelete.fullName || userToDelete.email}"</strong>?</p>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer y se eliminarán todos los datos asociados al usuario, incluyendo sus suscripciones.</p>
            </div>
          ) : ''
        }
        confirmText="Eliminar Usuario"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

function UserModal({ user, onClose, onSuccess }: UserModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'student',
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (user) {
        return usersService.update(user.id, data);
      }
      throw new Error('La creación de usuarios se realiza mediante el registro');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
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
          <h2 className="text-2xl font-bold text-charcoal-900">Editar Usuario</h2>
          <p className="text-sm text-charcoal-600 mt-1">
            Actualiza la información y permisos del usuario
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-2">
              Nombre Completo
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400 transition-all duration-200"
                placeholder="Ej: Juan Pérez González"
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400 transition-all duration-200"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-2">Rol del Usuario</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'student' })}
                className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent appearance-none bg-white transition-all duration-200"
              >
                <option value="student">Estudiante</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <p className="mt-2 text-xs text-charcoal-500 flex items-center">
              <Shield className="w-3 h-3 mr-1 text-inspira-primary" />
              Cambiar el rol afectará los permisos y accesos del usuario
            </p>
          </div>

          {/* Nota sobre contraseña */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  <strong className="font-semibold">Nota importante:</strong> No se puede cambiar la contraseña desde aquí. El usuario debe usar la opción de recuperación de contraseña si necesita cambiarla.
                </p>
              </div>
            </div>
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
                  <Shield className="w-5 h-5 mr-2" />
                  Guardar Cambios
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
