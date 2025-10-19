import { CheckCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string | ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  title = "¡Solicitud Enviada!",
  message,
  confirmText = "Aceptar",
  onConfirm,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          {confirmText}
        </button>
      }
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <div className="text-gray-700">
          {message}
        </div>
      </div>
    </Modal>
  );
}
