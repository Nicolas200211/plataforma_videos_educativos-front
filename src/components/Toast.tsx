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
      'bg-gradient-to-b from-emerald-50 to-white',
      'dark:from-emerald-950/20 dark:to-zinc-950',
      'border border-emerald-200/30 dark:border-emerald-800/30',
      'shadow-[0_1px_6px_0_rgba(16,185,129,0.1)]'
    ),
    iconBg: cn(
      'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500',
      'dark:from-emerald-600 dark:via-green-600 dark:to-teal-600'
    ),
    title: 'text-emerald-900 dark:text-emerald-100',
    message: 'text-emerald-600 dark:text-emerald-300',
    badge: cn(
      'bg-gradient-to-r from-emerald-500/10 to-teal-500/10',
      'dark:from-emerald-500/20 dark:to-teal-500/20',
      'text-emerald-700 dark:text-emerald-200',
      'ring-1 ring-emerald-500/20 dark:ring-emerald-400/20'
    ),
    glow: {
      top: 'bg-emerald-400 dark:bg-emerald-600/30',
      middle: 'bg-green-400 dark:bg-green-600/30',
      bottom: 'bg-teal-400 dark:bg-teal-600/30',
    }
  },
  error: {
    container: cn(
      'bg-gradient-to-b from-red-50 to-white',
      'dark:from-red-950/20 dark:to-zinc-950',
      'border border-red-200/30 dark:border-red-800/30',
      'shadow-[0_1px_6px_0_rgba(239,68,68,0.1)]'
    ),
    iconBg: cn(
      'bg-gradient-to-br from-red-500 via-rose-500 to-pink-500',
      'dark:from-red-600 dark:via-rose-600 dark:to-pink-600'
    ),
    title: 'text-red-900 dark:text-red-100',
    message: 'text-red-600 dark:text-red-300',
    badge: cn(
      'bg-gradient-to-r from-red-500/10 to-pink-500/10',
      'dark:from-red-500/20 dark:to-pink-500/20',
      'text-red-700 dark:text-red-200',
      'ring-1 ring-red-500/20 dark:ring-red-400/20'
    ),
    glow: {
      top: 'bg-red-400 dark:bg-red-600/30',
      middle: 'bg-rose-400 dark:bg-rose-600/30',
      bottom: 'bg-pink-400 dark:bg-pink-600/30',
    }
  },
  warning: {
    container: cn(
      'bg-gradient-to-b from-amber-50 to-white',
      'dark:from-amber-950/20 dark:to-zinc-950',
      'border border-amber-200/30 dark:border-amber-800/30',
      'shadow-[0_1px_6px_0_rgba(245,158,11,0.1)]'
    ),
    iconBg: cn(
      'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500',
      'dark:from-amber-600 dark:via-yellow-600 dark:to-orange-600'
    ),
    title: 'text-amber-900 dark:text-amber-100',
    message: 'text-amber-600 dark:text-amber-300',
    badge: cn(
      'bg-gradient-to-r from-amber-500/10 to-orange-500/10',
      'dark:from-amber-500/20 dark:to-orange-500/20',
      'text-amber-700 dark:text-amber-200',
      'ring-1 ring-amber-500/20 dark:ring-amber-400/20'
    ),
    glow: {
      top: 'bg-amber-400 dark:bg-amber-600/30',
      middle: 'bg-yellow-400 dark:bg-yellow-600/30',
      bottom: 'bg-orange-400 dark:bg-orange-600/30',
    }
  },
  info: {
    container: cn(
      'bg-gradient-to-b from-blue-50 to-white',
      'dark:from-blue-950/20 dark:to-zinc-950',
      'border border-blue-200/30 dark:border-blue-800/30',
      'shadow-[0_1px_6px_0_rgba(59,130,246,0.1)]'
    ),
    iconBg: cn(
      'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500',
      'dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600'
    ),
    title: 'text-blue-900 dark:text-blue-100',
    message: 'text-blue-600 dark:text-blue-300',
    badge: cn(
      'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
      'dark:from-blue-500/20 dark:to-purple-500/20',
      'text-blue-700 dark:text-blue-200',
      'ring-1 ring-blue-500/20 dark:ring-blue-400/20'
    ),
    glow: {
      top: 'bg-blue-400 dark:bg-blue-600/30',
      middle: 'bg-indigo-400 dark:bg-indigo-600/30',
      bottom: 'bg-purple-400 dark:bg-purple-600/30',
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
