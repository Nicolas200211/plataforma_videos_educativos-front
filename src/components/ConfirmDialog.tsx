import { AlertTriangle, Info, Trash2, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export type ConfirmDialogType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
  isLoading?: boolean;
}

const typeConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    iconColor: 'text-white',
    titleColor: 'text-red-900',
    confirmButton: cn(
      'bg-gradient-to-r from-red-600 to-rose-600',
      'hover:from-red-700 hover:to-rose-700',
      'text-white font-semibold',
      'shadow-lg shadow-red-500/30',
      'focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
    ),
    borderColor: 'border-red-200',
    bgGradient: 'from-red-50 to-rose-50',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    iconColor: 'text-white',
    titleColor: 'text-amber-900',
    confirmButton: cn(
      'bg-gradient-to-r from-amber-600 to-orange-600',
      'hover:from-amber-700 hover:to-orange-700',
      'text-white font-semibold',
      'shadow-lg shadow-amber-500/30',
      'focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
    ),
    borderColor: 'border-amber-200',
    bgGradient: 'from-amber-50 to-orange-50',
  },
  info: {
    icon: Info,
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    iconColor: 'text-white',
    titleColor: 'text-blue-900',
    confirmButton: cn(
      'bg-gradient-to-r from-blue-600 to-indigo-600',
      'hover:from-blue-700 hover:to-indigo-700',
      'text-white font-semibold',
      'shadow-lg shadow-blue-500/30',
      'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    ),
    borderColor: 'border-blue-200',
    bgGradient: 'from-blue-50 to-indigo-50',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    iconColor: 'text-white',
    titleColor: 'text-emerald-900',
    confirmButton: cn(
      'bg-gradient-to-r from-emerald-600 to-green-600',
      'hover:from-emerald-700 hover:to-green-700',
      'text-white font-semibold',
      'shadow-lg shadow-emerald-500/30',
      'focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
    ),
    borderColor: 'border-emerald-200',
    bgGradient: 'from-emerald-50 to-green-50',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className="relative w-full max-w-md"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header con gradiente */}
                <div className={cn('bg-gradient-to-r p-6 pb-8', config.bgGradient)}>
                  <div className="flex items-start justify-between mb-4">
                    {/* Icono animado */}
                    <motion.div
                      initial={{ rotate: -15, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                      className={cn('p-3 rounded-xl shadow-lg', config.iconBg)}
                    >
                      <Icon className={cn('w-7 h-7', config.iconColor)} />
                    </motion.div>

                    {/* Botón cerrar */}
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Título */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn('text-2xl font-bold mb-2', config.titleColor)}
                  >
                    {title}
                  </motion.h3>
                </div>

                {/* Contenido */}
                <div className="p-6 pt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-700 leading-relaxed mb-6"
                  >
                    {typeof message === 'string' ? <p>{message}</p> : message}
                  </motion.div>

                  {/* Botones */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex gap-3"
                  >
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-xl font-medium',
                        'bg-gray-100 text-gray-700',
                        'hover:bg-gray-200',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isLoading}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-xl',
                        'transition-all duration-200',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transform hover:scale-105 active:scale-95',
                        config.confirmButton
                      )}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        confirmText
                      )}
                    </button>
                  </motion.div>
                </div>

                {/* Barra decorativa inferior */}
                <div className={cn('h-1.5 bg-gradient-to-r', config.bgGradient)} />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
