import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { videosService } from '../../services/videos.service';
import { useAuthQuery } from '../../hooks';
import { VideoFormModal } from './VideoFormModal';
import type { Video } from '../../types';
import { formatDuration, getFileUrl } from '../../lib/utils';

export function Videos() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const { data: videos, isLoading } = useAuthQuery({
    queryKey: ['admin-videos'],
    queryFn: () => videosService.getAllAdmin(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => videosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
    },
  });

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este video?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando videos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Videos</h1>
        <button
          onClick={() => {
            setEditingVideo(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Video
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Video
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duración
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vistas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {videos?.map((video) => (
              <tr key={video.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {video.thumbnailUrl ? (
                      <img
                        src={getFileUrl(video.thumbnailUrl)}
                        alt={video.title}
                        className="w-16 h-10 object-cover rounded mr-3"
                      />
                    ) : (
                      <div className="w-16 h-10 bg-gray-200 rounded mr-3" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {video.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                    {video.category?.name || 'Sin categoría'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDuration(video.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {video.viewCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      video.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {video.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {videos?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay videos registrados</p>
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
    </div>
  );
}
