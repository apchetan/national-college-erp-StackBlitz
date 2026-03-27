import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  deleteConfirm: { type: string; ids: string[] } | null;
  deleting: boolean;
  handleDelete: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  deleteConfirm,
  deleting,
  handleDelete,
  onCancel
}: DeleteConfirmDialogProps) {
  if (!deleteConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete {deleteConfirm.ids.length} {deleteConfirm.type}? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
