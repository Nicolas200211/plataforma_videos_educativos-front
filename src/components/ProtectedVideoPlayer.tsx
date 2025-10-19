import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ProtectedVideoPlayerProps {
  videoUrl: string;
  title: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export function ProtectedVideoPlayer({
  videoUrl,
  title,
  onTimeUpdate,
}: ProtectedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Deshabilitar menú contextual (clic derecho)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Deshabilitar captura de pantalla con teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Print Screen, Win+Shift+S, etc.
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault();
        setWarningMessage('Captura de pantalla no permitida');
        setIsBlurred(true);
        setTimeout(() => {
          setIsBlurred(false);
          setWarningMessage('');
        }, 3000);
        return false;
      }
    };

    // Detectar cuando la pestaña pierde el foco (posible grabación)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoElement.pause();
        setWarningMessage('Video pausado: pestaña inactiva');
      } else {
        setWarningMessage('');
      }
    };

    // Detectar herramientas de desarrollo
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        setIsBlurred(true);
        setWarningMessage('Cierra las herramientas de desarrollo para continuar');
        videoElement.pause();
      } else {
        setIsBlurred(false);
      }
    };

    // Prevenir arrastrar el video
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Protección contra Picture-in-Picture
    videoElement.disablePictureInPicture = true;

    // Event listeners
    videoElement.addEventListener('contextmenu', handleContextMenu);
    videoElement.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Chequear dev tools periódicamente
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Marcar como protected para navegadores que soporten esto
    if ('requestVideoFrameCallback' in videoElement) {
      const watermark = () => {
        // Aquí podrías añadir una marca de agua dinámica si lo deseas
        if (videoElement && !videoElement.paused) {
          (videoElement as any).requestVideoFrameCallback(watermark);
        }
      };
      (videoElement as any).requestVideoFrameCallback(watermark);
    }

    // Handle time update
    const handleTimeUpdate = () => {
      if (onTimeUpdate && videoElement) {
        onTimeUpdate(videoElement.currentTime);
      }
    };
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    // Cleanup
    return () => {
      videoElement.removeEventListener('contextmenu', handleContextMenu);
      videoElement.removeEventListener('dragstart', handleDragStart);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(devToolsInterval);
    };
  }, [onTimeUpdate]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Capa de protección cuando está borroso */}
      {isBlurred && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-xl">
          <div className="text-center text-white p-8">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold mb-2">Contenido Protegido</h3>
            <p className="text-gray-300">{warningMessage}</p>
          </div>
        </div>
      )}

      {/* Mensaje de advertencia flotante */}
      {warningMessage && !isBlurred && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg font-medium">
          {warningMessage}
        </div>
      )}

      {/* Overlay invisible para prevenir interacciones no deseadas */}
      <div className="absolute inset-0 z-10 pointer-events-none select-none">
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded">
          Contenido Protegido
        </div>
      </div>

      {/* Video Player */}
      <video
        ref={videoRef}
        className="w-full aspect-video"
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        playsInline
        onContextMenu={(e) => e.preventDefault()}
        style={{
          filter: isBlurred ? 'blur(20px)' : 'none',
          transition: 'filter 0.3s ease',
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Tu navegador no soporta la reproducción de video.
      </video>

      {/* Marca de agua sutil */}
      <div className="absolute bottom-20 right-4 text-white text-opacity-30 text-xs pointer-events-none select-none">
        {title}
      </div>
    </div>
  );
}
