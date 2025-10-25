import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Video as VideoIcon, Search, Eye, Play } from 'lucide-react';
import { videosService } from '../../services/videos.service';
import { useAuthQuery } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { VideoFormModal } from './VideoFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { Video } from '../../types';
import { formatDuration, getFileUrl } from '../../lib/utils';

export function Videos() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: videos, isLoading } = useAuthQuery({
    queryKey: ['admin-videos'],
    queryFn: () => videosService.getAllAdmin(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => videosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      toast.success('Video eliminado', 'El video ha sido eliminado exitosamente');
      setVideoToDelete(null);
    },
    onError: (error: any) => {
      toast.error('Error al eliminar', error.response?.data?.message || 'No se pudo eliminar el video');
    },
  });

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (video: Video) => {
    setVideoToDelete(video);
  };

  const confirmDelete = () => {
    if (videoToDelete) {
      deleteMutation.mutate(videoToDelete.id);
    }
  };

  // Filtrar videos por búsqueda
  const filteredVideos = videos?.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-inspira-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal-600 font-medium">Cargando videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900">Videos</h1>
          <p className="text-charcoal-600 mt-1">Gestiona todos los videos de tu plataforma</p>
        </div>
        <button
          onClick={() => {
            setEditingVideo(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white rounded-lg font-semibold hover:shadow-green transition-all duration-200 space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Subir Video</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Total Videos</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-1">{videos?.length || 0}</p>
            </div>
            <div className="p-3 bg-inspira-50 rounded-xl">
              <VideoIcon className="w-6 h-6 text-inspira-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Publicados</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-1">
                {videos?.filter(v => v.isPublished).length || 0}
              </p>
            </div>
            <div className="p-3 bg-inspira-50 rounded-xl">
              <Play className="w-6 h-6 text-inspira-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Total Vistas</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-1">
                {videos?.reduce((sum, v) => sum + (v.viewCount || 0), 0) || 0}
              </p>
            </div>
            <div className="p-3 bg-inspira-50 rounded-xl">
              <Eye className="w-6 h-6 text-inspira-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-soft border border-inspira-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            placeholder="Buscar videos por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inspira-primary focus:border-transparent placeholder-charcoal-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft border border-inspira-100 overflow-hidden">
        <table className="min-w-full divide-y divide-inspira-100">
          <thead className="bg-gradient-to-r from-inspira-50 to-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                Video
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                Duración
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-inspira-primary uppercase tracking-wider">
                Vistas
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
            {filteredVideos?.map((video) => (
              <tr key={video.id} className="hover:bg-inspira-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {video.thumbnailUrl ? (
                      <div className="relative w-20 h-12 rounded-lg overflow-hidden shadow-soft group">
                        <img
                          src={getFileUrl(video.thumbnailUrl)}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-12 bg-charcoal-100 rounded-lg flex items-center justify-center">
                        <VideoIcon className="w-6 h-6 text-charcoal-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-charcoal-900 truncate">
                        {video.title}
                      </div>
                      <div className="text-xs text-charcoal-500 truncate max-w-md">
                        {video.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 text-xs font-semibold bg-inspira-50 text-inspira-primary rounded-full">
                    {video.category?.name || 'Sin categoría'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-700">
                  {formatDuration(video.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-700">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-charcoal-400" />
                    <span>{video.viewCount || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      video.isPublished
                        ? 'bg-inspira-50 text-inspira-primary'
                        : 'bg-charcoal-100 text-charcoal-600'
                    }`}
                  >
                    {video.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="p-2 text-inspira-primary hover:bg-inspira-50 rounded-lg transition-all duration-200"
                      title="Editar video"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(video)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Eliminar video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredVideos?.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-inspira-50 rounded-full mb-4">
              <VideoIcon className="w-12 h-12 text-inspira-primary" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
              {searchTerm ? 'No se encontraron videos' : 'No hay videos todavía'}
            </h3>
            <p className="text-charcoal-600 mb-6">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza subiendo tu primer video educativo'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-inspira-primary to-inspira-primary-light text-white rounded-lg font-semibold hover:shadow-green transition-all duration-200 space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Subir Primer Video</span>
              </button>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <VideoFormModal
          video={editingVideo}
          onClose={() => {
            setIsModalOpen(false);
            setEditingVideo(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingVideo(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!videoToDelete}
        onClose={() => setVideoToDelete(null)}
        onConfirm={confirmDelete}
        type="danger"
        title="Eliminar Video"
        message={
          videoToDelete ? (
            <div className="space-y-2">
              <p>¿Estás seguro de que deseas eliminar el video <strong>"{videoToDelete.title}"</strong>?</p>
              <p className="text-sm text-charcoal-600">Esta acción no se puede deshacer y el video se eliminará permanentemente del sistema.</p>
            </div>
          ) : ''
        }
        confirmText="Eliminar Video"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
