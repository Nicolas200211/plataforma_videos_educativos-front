import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Construye la URL completa para acceder a archivos estáticos del backend
 * @param filePath - Path relativo o URL completa
 * @returns URL completa como "http://localhost:3000/uploads/thumbnails/abc-123.jpg"
 */
export function getFileUrl(filePath?: string | null): string | undefined {
  if (!filePath) return undefined;

  // Si ya es una URL completa con dominio diferente, devolverla tal cual
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    // Verificar si apunta al mismo backend
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const baseUrl = BACKEND_URL.replace('/api/v1', '');

    // Si la URL ya apunta al backend correcto, devolverla
    if (filePath.startsWith(baseUrl)) {
      return filePath;
    }

    // Si apunta a otro dominio, devolverla (para compatibilidad con S3/CDN futuro)
    return filePath;
  }

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  const baseUrl = BACKEND_URL.replace('/api/v1', '');

  // Si empieza con /uploads/, construir URL completa
  if (filePath.startsWith('/uploads/')) {
    return `${baseUrl}${filePath}`;
  }

  // Si es un path relativo, construir URL completa
  return `${baseUrl}/uploads/${filePath}`;
}
