import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, FileVideo } from 'lucide-react';
import { videosService } from '../../services/videos.service';
import { useAuthQuery } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { categoriesService } from '../../services/categories.service';
import { subscriptionsService } from '../../services/subscriptions.service';
import type { Video } from '../../types';

interface VideoFormModalProps {
  video: Video | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function VideoFormModal({ video, onClose, onSuccess }: VideoFormModalProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(video?.thumbnailUrl || null);
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    categoryId: video?.categoryId || '',
    duration: video?.duration || 0,
    isPublished: video?.isPublished ?? false,
    subscriptionPlanIds: video?.subscriptionPlans?.map(p => p.id) || [],
  });

  const { data: categories } = useAuthQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  const { data: plans } = useAuthQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsService.getAllPlans(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (video) {
        return videosService.update(video.id, data);
      } else {
        return videosService.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      toast.success(
        video ? 'Video actualizado' : 'Video creado',
        video ? 'El video ha sido actualizado exitosamente' : 'El video ha sido creado exitosamente'
      );
      onSuccess();
    },
    onError: (error: any) => {
      toast.error('Error al guardar', error.response?.data?.message || 'No se pudo guardar el video');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!video && !videoFile) {
      toast.warning('Archivo de video requerido', 'Debes seleccionar un archivo de video antes de continuar');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('categoryId', formData.categoryId);
    formDataObj.append('duration', formData.duration.toString());
    formDataObj.append('isPublished', formData.isPublished.toString());

    // Agregar IDs de planes de suscripción
    formData.subscriptionPlanIds.forEach(id => {
      formDataObj.append('subscriptionPlanIds[]', id);
    });

    if (videoFile) {
      formDataObj.append('video', videoFile);
    }

    if (thumbnailFile) {
      formDataObj.append('thumbnail', thumbnailFile);
    }

    saveMutation.mutate(formDataObj);
  };

  const handlePlanToggle = (planId: string) => {
    setFormData(prev => ({
      ...prev,
      subscriptionPlanIds: prev.subscriptionPlanIds.includes(planId)
        ? prev.subscriptionPlanIds.filter(id => id !== planId)
        : [...prev.subscriptionPlanIds, planId],
    }));
  };

  // Manejar selección de video y calcular duración automáticamente
  const handleVideoFileChange = (file: File | null) => {
    setVideoFile(file);

    if (file) {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';

      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        const durationInSeconds = Math.floor(videoElement.duration);
        setFormData(prev => ({ ...prev, duration: durationInSeconds }));
      };

      videoElement.src = URL.createObjectURL(file);
    }
  };

  // Manejar selección de thumbnail y mostrar preview
  const handleThumbnailChange = (file: File | null) => {
    setThumbnailFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  // Limpiar preview cuando se cierra el modal
  useEffect(() => {
    return () => {
      if (thumbnailPreview && !thumbnailPreview.startsWith('http')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {video ? 'Editar Video' : 'Nuevo Video'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Video *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: Introducción a Cálculo Diferencial"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe el contenido del video..."
            />
          </div>

          {/* Archivo de Video */}
          {!video && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo de Video * (MP4, AVI, MOV)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  id="video-file"
                />
                <label htmlFor="video-file" className="cursor-pointer">
                  <FileVideo className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  {videoFile ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Archivo seleccionado: <span className="font-medium">{videoFile.name}</span>
                      </p>
                      {formData.duration > 0 && (
                        <p className="text-xs text-green-600">
                          ✓ Duración detectada: {Math.floor(formData.duration / 60)}:{(formData.duration % 60).toString().padStart(2, '0')} min
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Haz clic para seleccionar un archivo de video
                    </p>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Miniatura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Miniatura (Imagen) {!video && '(Opcional)'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleThumbnailChange(e.target.files?.[0] || null)}
                className="hidden"
                id="thumbnail-file"
              />

              {thumbnailPreview ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <label
                      htmlFor="thumbnail-file"
                      className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer text-center text-sm font-medium"
                    >
                      Cambiar imagen
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="thumbnail-file" className="cursor-pointer block text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Haz clic para seleccionar una miniatura
                  </p>
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecciona una categoría</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duración */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración {!video && '(automática)'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={!video ? "Se calcula automáticamente" : "Segundos"}
                readOnly={!!videoFile && !video}
              />
              {formData.duration > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  = {Math.floor(formData.duration / 60)} min {formData.duration % 60} seg
                </p>
              )}
            </div>
          </div>

          {/* Planes de Suscripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Planes de Suscripción con Acceso
            </label>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              {plans?.map((plan) => (
                <label
                  key={plan.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.subscriptionPlanIds.includes(plan.id)}
                    onChange={() => handlePlanToggle(plan.id)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{plan.name}</span>
                    <span className="text-sm text-gray-500 ml-2">(${plan.price}/mes)</span>
                  </div>
                </label>
              ))}
              {formData.subscriptionPlanIds.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ Si no seleccionas ningún plan, el video NO estará disponible para ningún estudiante
                </p>
              )}
            </div>
          </div>

          {/* Publicado */}
          <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
              Publicar video (los estudiantes podrán verlo)
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saveMutation.isPending ? 'Guardando...' : video ? 'Actualizar' : 'Crear Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
