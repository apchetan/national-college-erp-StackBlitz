import { useToast } from '../contexts/ToastContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-l-4 border-green-500',
          bg: 'bg-green-50',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'text-green-800'
        };
      case 'error':
        return {
          border: 'border-l-4 border-red-500',
          bg: 'bg-red-50',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          text: 'text-red-800'
        };
      case 'warning':
        return {
          border: 'border-l-4 border-yellow-500',
          bg: 'bg-yellow-50',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          text: 'text-yellow-800'
        };
      case 'info':
        return {
          border: 'border-l-4 border-blue-500',
          bg: 'bg-blue-50',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-800'
        };
      default:
        return {
          border: 'border-l-4 border-gray-500',
          bg: 'bg-gray-50',
          icon: <Info className="w-5 h-5 text-gray-600" />,
          text: 'text-gray-800'
        };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-md:top-0 max-md:left-0 max-md:right-0 max-md:px-4 max-md:pt-4">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={`${styles.border} ${styles.bg} rounded-lg shadow-lg p-4 max-w-sm w-full animate-slide-in-right flex items-start gap-3`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {styles.icon}
            </div>
            <p className={`flex-1 text-sm font-medium ${styles.text}`}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
