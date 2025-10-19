import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Play, Eye, Lock } from 'lucide-react';
import { videosService } from '../../services/videos.service';
import { subscriptionsService } from '../../services/subscriptions.service';
import { formatDuration, getFileUrl } from '../../lib/utils';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { useAuthQuery } from '../../hooks';

export function VideosCatalog() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Usando useAuthQuery - automáticamente verifica el token
  // Obtener TODOS los videos del catálogo con información de acceso
  const { data: videos, isLoading: videosLoading } = useAuthQuery({
    queryKey: ['catalog'],
    queryFn: () => videosService.getCatalog(),
  });

  const { data: hasAccess, isLoading: accessLoading } = useAuthQuery({
    queryKey: ['check-access'],
    queryFn: () => subscriptionsService.checkAccess(),
  });

  const allVideos = videos || [];
  const categories = Array.from(
    new Set(allVideos.map((v) => v.category?.name).filter(Boolean))
  );

  const filteredVideos = selectedCategory
    ? allVideos.filter((v) => v.category?.name === selectedCategory)
    : allVideos;

  const handleVideoClick = (video: any) => {
    // Si el video está bloqueado, no permitir reproducción
    if (video.isLocked || !video.hasAccess) {
      return; // No hacer nada - el usuario verá el candado
    }
    navigate(`/student/video/${video.id}`);
  };

  if (videosLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando catálogo...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <StudentNavbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-2">Catálogo de Videos</h1>
          <p className="text-indigo-100">
            Explora nuestro contenido educativo de alta calidad
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                Catálogo de Videos
              </h3>
              <p className="text-blue-700 mb-2">
                Los videos con <Lock className="w-4 h-4 inline mx-1" /> requieren un plan de suscripción específico.
              </p>
              {!hasAccess && (
                <button
                  onClick={() => navigate('/student/subscription')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Ver Planes de Suscripción
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as string)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay videos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 ${
                  video.isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                }`}
                style={{
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}
              >

                {/* Imagen del video con glassmorphism overlay */}
                <div className="relative overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img
                      src={getFileUrl(video.thumbnailUrl)}
                      alt={video.title}
                      className="w-full h-48 sm:h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-48 sm:h-56 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                      <Play className="w-16 h-16 text-white opacity-40" />
                    </div>
                  )}

                  {/* Glassmorphism overlay en hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Play button futurista - solo en hover y si tiene acceso */}
                  {!video.isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Badge de candado - glassmorphism */}
                  {video.isLocked && (
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-md border border-red-300/50 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-bold text-white">Bloqueado</span>
                    </div>
                  )}

                  {/* Duration badge - glassmorphism */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10">
                    <span className="text-xs font-semibold text-white">{formatDuration(video.duration)}</span>
                  </div>
                </div>

                {/* Content con glassmorphism */}
                <div className="p-4 bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
                  {/* Título */}
                  <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors duration-300">
                    {video.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {video.description}
                  </p>

                  {/* Planes requeridos con glassmorphism */}
                  {video.isLocked && video.requiredPlans && video.requiredPlans.length > 0 && (
                    <div className="mb-3 p-2.5 rounded-lg bg-amber-500/20 backdrop-blur-sm border border-amber-400/30">
                      <p className="text-xs text-amber-200 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 flex-shrink-0" />
                        <span className="font-semibold">{video.requiredPlans.map(p => p.name).join(', ')}</span>
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="font-medium">{video.viewCount}</span>
                    </div>
                    {video.category && (
                      <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                        {video.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
