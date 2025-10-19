import { useToast as useToastContext } from '../contexts/ToastContext';
import type { ToastType } from '../contexts/ToastContext';

export function useToast() {
  const { addToast } = useToastContext();

  const showToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    addToast({
      type,
      title,
      message: message || '',
      duration,
    });
  };

  const success = (title: string, message?: string, duration?: number) => {
    showToast('success', title, message, duration);
  };

  const error = (title: string, message?: string, duration?: number) => {
    showToast('error', title, message, duration);
  };

  const warning = (title: string, message?: string, duration?: number) => {
    showToast('warning', title, message, duration);
  };

  const info = (title: string, message?: string, duration?: number) => {
    showToast('info', title, message, duration);
  };

  return {
    success,
    error,
    warning,
    info,
    addToast,
  };
}
