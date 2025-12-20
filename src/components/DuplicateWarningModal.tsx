import { AlertTriangle, X, User, Mail, Phone } from 'lucide-react';
import { PotentialDuplicate } from '../utils/duplicateDetection';

interface DuplicateWarningModalProps {
  duplicates: PotentialDuplicate[];
  onUseExisting: (contact: PotentialDuplicate) => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

export function DuplicateWarningModal({
  duplicates,
  onUseExisting,
  onCreateNew,
  onCancel,
}: DuplicateWarningModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Potential Duplicate Contacts Found</h2>
              <p className="text-sm text-gray-600">Similar contacts already exist in the system</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              We found {duplicates.length} existing contact{duplicates.length > 1 ? 's' : ''} that might be the same person.
              You can use an existing contact or create a new one anyway.
            </p>
          </div>

          <div className="space-y-3">
            {duplicates.map((duplicate) => (
              <div
                key={duplicate.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        {duplicate.first_name} {duplicate.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{duplicate.email}</span>
                    </div>
                    {duplicate.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{duplicate.phone}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {duplicate.matchReason.map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => onUseExisting(duplicate)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                  >
                    Use This Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Create New Contact Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
