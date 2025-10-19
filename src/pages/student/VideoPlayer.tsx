import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { videosService } from '../../services/videos.service';
import { subscriptionsService } from '../../services/subscriptions.service';
import { ProtectedVideoPlayer } from '../../components/ProtectedVideoPlayer';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { useAuthQuery } from '../../hooks';

export function VideoPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Usando useAuthQuery - automáticamente verifica el token
  const { data: video, isLoading: videoLoading } = useAuthQuery({
    queryKey: ['video', id],
    queryFn: () => videosService.getById(id!),
    enabled: !!id, // Condición adicional: solo si hay ID
  });

  const { data: hasAccess, isLoading: accessLoading } = useAuthQuery({
    queryKey: ['check-access'],
    queryFn: () => subscriptionsService.checkAccess(),
  });

  // Obtener URL firmada del video
  useEffect(() => {
    if (id && hasAccess) {
      videosService.getVideoUrl(id)
        .then(response => {
          // Construir URL completa con el backend
          // VITE_API_URL puede ser 'http://localhost:3000/api/v1' o solo 'http://localhost:3000'
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
          const baseUrl = apiUrl.replace(/\/api\/v1$/, ''); // Eliminar /api/v1 del final si existe
          const fullUrl = `${baseUrl}${response.url}`;
          console.log('Video URL construida:', fullUrl);
          setVideoUrl(fullUrl);
        })
        .catch(err => console.error('Error al obtener URL del video:', err));
    }
  }, [id, hasAccess]);

  if (videoLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Cargando video...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Video no encontrado</h2>
          <button
            onClick={() => navigate('/student/videos')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Suscripción Requerida
          </h2>
          <p className="text-gray-600 mb-6">
            Necesitas una suscripción activa para ver este video
          </p>
          <button
            onClick={() => navigate('/student/subscription')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Ver Planes de Suscripción
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <StudentNavbar />

      <div className="bg-gray-900">
        {/* Navigation */}
        <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/student/videos')}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al catálogo
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {videoUrl ? (
            <ProtectedVideoPlayer
              videoUrl={videoUrl}
              title={video.title}
              onTimeUpdate={(time) => {
                // Aquí puedes guardar el progreso del usuario si quieres
                console.log('Video progress:', time);
              }}
            />
          ) : (
            <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-white">Cargando video...</div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-4">{video.title}</h1>

          <div className="flex items-center gap-4 mb-6 text-gray-400">
            <span>{video.viewCount} vistas</span>
            {video.category && (
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm">
                {video.category.name}
              </span>
            )}
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-white mb-2">Descripción</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
