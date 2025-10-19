import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import type { SubscriptionPlan } from '../types';
import { formatCurrency } from '../lib/utils';

interface PaymentVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (voucherFile: File) => void;
  selectedPlan: SubscriptionPlan | null;
  isSubmitting: boolean;
}

export function PaymentVoucherModal({
  isOpen,
  onClose,
  onSubmit,
  selectedPlan,
  isSubmitting,
}: PaymentVoucherModalProps) {
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPG, PNG, WEBP)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('El archivo no debe superar los 5MB');
      return;
    }

    setError(null);
    setVoucherFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setVoucherFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!voucherFile) {
      setError('Debes seleccionar un comprobante de pago');
      return;
    }
    onSubmit(voucherFile);
  };

  const handleClose = () => {
    handleRemoveFile();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Subir Comprobante de Pago"
      size="lg"
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !voucherFile}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Comprobante'}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Plan Information */}
        {selectedPlan && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Plan Seleccionado
            </h4>
            <div className="flex items-baseline justify-between">
              <span className="text-blue-700">{selectedPlan.name}</span>
              <span className="text-xl font-bold text-blue-900">
                {formatCurrency(selectedPlan.price)}
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Instrucciones:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Realiza el pago del plan seleccionado</li>
                <li>Toma una foto clara del comprobante de pago (voucher/baucher)</li>
                <li>Sube la imagen aquí</li>
                <li>Espera la confirmación del administrador</li>
              </ol>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comprobante de Pago *
          </label>

          {!voucherFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Haz clic para seleccionar una imagen
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG o WEBP (máximo 5MB)
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <ImageIcon className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {voucherFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(voucherFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded px-3 py-2">
                    <p className="text-xs text-green-700">
                      ✓ Archivo válido y listo para enviar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        {/* Account Information (Optional - for payment details) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Información de Pago
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Banco:</strong> BCP / Interbank / BBVA</p>
            <p><strong>Número de cuenta:</strong> XXXX-XXXX-XXXX-XXXX</p>
            <p><strong>Titular:</strong> Plataforma Educativa</p>
            <p className="text-xs text-gray-500 mt-2">
              * Información de ejemplo - Configura tus datos bancarios
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
