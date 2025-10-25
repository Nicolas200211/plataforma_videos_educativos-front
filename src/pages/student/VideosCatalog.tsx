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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-green-50/30">
      {/* Navbar */}
      <StudentNavbar />

      {/* Hero Header with modern design */}
      <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent mb-8 pb-2 leading-tight">
              Catálogo de Videos
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto leading-relaxed pt-4">
              Explora nuestro contenido educativo de alta calidad y potencia tu aprendizaje
            </p>
            <div className="flex items-center justify-center space-x-2 text-green-200">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                {allVideos.length} videos disponibles
              </span>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" className="w-full h-16 fill-current text-slate-50">
            <path d="M0,64 C360,96 720,32 1440,64 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Enhanced Info Banner */}
        <div className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">🎬 Explora Nuestro Contenido</h3>
                <p className="text-gray-700 leading-relaxed">
                  Descubre una amplia variedad de videos educativos diseñados para potenciar tu aprendizaje.
                  Los videos con <Lock className="w-4 h-4 inline mx-1 text-red-500" /> requieren un plan de suscripción específico.
                </p>
              </div>
              {!hasAccess && (
                <div className="flex items-center space-x-4 pt-2">
                  <button
                    onClick={() => navigate('/student/subscription')}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    🚀 Ver Planes de Suscripción
                  </button>
                  <span className="text-sm text-gray-500 italic">Desbloquea todo el contenido premium</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Category Filter */}
        {categories.length > 0 && (
          <div className="mb-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">📂 Filtrar por Categoría</h2>
                  <p className="text-sm text-gray-600">Encuentra el contenido que más te interesa</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>{filteredVideos.length} videos</span>
                <span>•</span>
                <span>{categories.length} categorías</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${selectedCategory === null
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg border-2 border-green-500/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300 hover:text-green-600'
                }`}
              >
                🌟 Todas ({allVideos.length})
              </button>
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as string)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${selectedCategory === category
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg border-2 border-green-500/30'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300 hover:text-green-600'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  📚 {category} ({allVideos.filter(v => v.category?.name === category).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Videos Grid Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎥 Videos Disponibles</h2>
              <p className="text-gray-600">{filteredVideos.length} videos {selectedCategory ? `en ${selectedCategory}` : 'en total'}</p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-300 font-medium border border-green-200 hover:border-green-300"
              >
                🗑️ Limpiar filtro
              </button>
            )}
          </div>

          {filteredVideos.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-green-50/50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay videos disponibles</h3>
              <p className="text-gray-500">Intenta con otros filtros o categorías</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video)}
                  className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-200/60 ${video.isLocked
                    ? 'cursor-not-allowed opacity-95'
                    : 'cursor-pointer hover:border-gray-300'
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    {video.thumbnailUrl ? (
                      <img
                        src={getFileUrl(video.thumbnailUrl)}
                        alt={video.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-8 h-8 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-300 ${video.isLocked
                      ? 'from-red-900/50 via-transparent to-transparent'
                      : 'from-black/40 via-transparent to-transparent group-hover:from-black/60'
                    }`} />

                    {/* Play Button Overlay */}
                    {!video.isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20 transform group-hover:scale-110 transition-all duration-300">
                          <Play className="w-7 h-7 text-gray-800 fill-gray-800 ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Lock Badge */}
                    {video.isLocked && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-red-500/95 rounded-full backdrop-blur-sm border border-red-400/30 flex items-center gap-1.5 shadow-lg">
                        <Lock className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-semibold text-white">Bloqueado</span>
                      </div>
                    )}

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 rounded-md backdrop-blur-sm border border-white/10 shadow-sm">
                      <span className="text-xs font-medium text-white">{formatDuration(video.duration)}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex flex-col h-60">
                    {/* Title and Category Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className={`text-base font-semibold line-clamp-2 flex-1 transition-colors duration-300 ${video.isLocked
                        ? 'text-gray-500'
                        : 'text-gray-900 group-hover:text-gray-700'
                      }`}>
                        {video.title}
                      </h3>
                      {video.category && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${video.isLocked
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 group-hover:bg-gray-200'
                        }`}>
                          {video.category.name}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {video.description}
                    </p>

                    {/* Locked Content Info */}
                    {video.isLocked && video.requiredPlans && video.requiredPlans.length > 0 && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">Plan Requerido</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {video.requiredPlans.map((p: any, index: number) => (
                            <span key={index} className="px-2 py-1 text-xs font-medium bg-amber-500 text-white rounded-md">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spacer to push footer down */}
                    <div className="flex-1"></div>

                    {/* Footer - Always at bottom */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-medium">{video.viewCount}</span>
                      </div>
                      <div className="text-xs text-gray-400 font-medium">
                        {video.createdAt ? new Date(video.createdAt).toLocaleDateString('es-PE', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Sin fecha'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
