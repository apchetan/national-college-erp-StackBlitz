import { AlertTriangle, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = variant === 'danger'
    ? {
        icon: <AlertCircle className="w-12 h-12 text-red-600" />,
        iconBg: 'bg-red-100',
        confirmBtn: 'bg-red-600 hover:bg-red-700 text-white'
      }
    : {
        icon: <AlertTriangle className="w-12 h-12 text-yellow-600" />,
        iconBg: 'bg-yellow-100',
        confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white'
      };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-down">
        <div className="flex flex-col items-center text-center">
          <div className={`${variantStyles.iconBg} rounded-full p-3 mb-4`}>
            {variantStyles.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${variantStyles.confirmBtn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
