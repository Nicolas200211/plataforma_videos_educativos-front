import { X, CheckCircle, AlertCircle, AlertTriangle, Info, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import type { Toast as ToastType } from '../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const typeStyles = {
  success: {
    container: cn(
      'bg-white',
      'border-2 border-inspira-primary',
      'shadow-xl shadow-inspira-primary/20'
    ),
    iconBg: cn(
      'bg-gradient-to-br from-inspira-primary to-inspira-primary-light',
      'shadow-lg shadow-inspira-primary/50'
    ),
    title: 'text-charcoal-900 font-bold',
    message: 'text-charcoal-700',
    badge: cn(
      'bg-inspira-primary',
      'text-white font-semibold',
      'shadow-md'
    ),
    glow: {
      top: 'bg-inspira-400/30',
      middle: 'bg-inspira-primary-light/30',
      bottom: 'bg-inspira-400/30',
    }
  },
  error: {
    container: cn(
      'bg-white',
      'border-2 border-red-500',
      'shadow-xl shadow-red-500/20'
    ),
    iconBg: cn(
      'bg-gradient-to-br from-red-500 to-rose-600',
      'shadow-lg shadow-red-500/50'
    ),
    title: 'text-gray-900 font-bold',
    message: 'text-gray-700',
    badge: cn(
      'bg-red-500',
      'text-white font-semibold',
      'shadow-md'
    ),
    glow: {
      top: 'bg-red-400/30',
      middle: 'bg-rose-400/30',
      bottom: 'bg-red-400/30',
    }
  },
  warning: {
    container: cn(
      'bg-white',
      'border-2 border-amber-500',
      'shadow-xl shadow-amber-500/20'
    ),
    iconBg: cn(
      'bg-gradient-to-br from-amber-500 to-orange-600',
      'shadow-lg shadow-amber-500/50'
    ),
    title: 'text-gray-900 font-bold',
    message: 'text-gray-700',
    badge: cn(
      'bg-amber-500',
      'text-white font-semibold',
      'shadow-md'
    ),
    glow: {
      top: 'bg-amber-400/30',
      middle: 'bg-orange-400/30',
      bottom: 'bg-amber-400/30',
    }
  },
  info: {
    container: cn(
      'bg-white',
      'border-2 border-blue-500',
      'shadow-xl shadow-blue-500/20'
    ),
    iconBg: cn(
      'bg-gradient-to-br from-blue-500 to-indigo-600',
      'shadow-lg shadow-blue-500/50'
    ),
    title: 'text-gray-900 font-bold',
    message: 'text-gray-700',
    badge: cn(
      'bg-blue-500',
      'text-white font-semibold',
      'shadow-md'
    ),
    glow: {
      top: 'bg-blue-400/30',
      middle: 'bg-indigo-400/30',
      bottom: 'bg-blue-400/30',
    }
  },
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const badgeLabels = {
  success: 'Éxito',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Info',
};

export function Toast({ toast, onRemove }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const Icon = icons[toast.type];
  const styles = typeStyles[toast.type];

  return (
    <AnimatePresence>
      {!isLeaving && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className="w-full max-w-sm"
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-xl p-4",
              styles.container
            )}
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ rotate: -15, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <div className={cn("p-2.5 rounded-xl", styles.iconBg)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </motion.div>

              <div className="flex-1 space-y-1">
                <motion.h3
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={cn("font-semibold text-sm", styles.title)}
                >
                  {toast.title}
                </motion.h3>
                {toast.message && (
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn("text-sm", styles.message)}
                  >
                    {toast.message}
                  </motion.p>
                )}
              </div>

              <button
                onClick={handleClose}
                className={cn(
                  "flex-shrink-0 p-1 rounded-md transition-colors",
                  "hover:bg-black/5 dark:hover:bg-white/5",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                )}
              >
                <X className="w-4 h-4 opacity-60 hover:opacity-100" />
              </button>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className={cn("absolute -left-2 -top-2 h-16 w-16 rounded-full blur-2xl opacity-20", styles.glow.top)} />
              <div className={cn("absolute top-2 right-8 h-12 w-12 rounded-full blur-2xl opacity-20", styles.glow.middle)} />
              <div className={cn("absolute -right-2 -bottom-2 h-16 w-16 rounded-full blur-2xl opacity-20", styles.glow.bottom)} />
            </div>

            {/* Badge */}
            <div className="absolute top-4 right-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.3,
                }}
                className={cn(
                  "text-[11px] font-medium px-2.5 py-0.5 rounded-full",
                  styles.badge
                )}
              >
                {badgeLabels[toast.type]}
              </motion.div>
            </div>

            {/* Shimmer effect */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
