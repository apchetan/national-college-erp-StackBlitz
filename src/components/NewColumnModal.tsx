import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NewColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  onColumnCreated: (columnName: string, displayName: string) => void;
}

const DATA_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean (Yes/No)' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi-Select' },
];

export default function NewColumnModal({ isOpen, onClose, tableName, onColumnCreated }: NewColumnModalProps) {
  const [columnName, setColumnName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dataType, setDataType] = useState('text');
  const [isNullable, setIsNullable] = useState(true);
  const [defaultValue, setDefaultValue] = useState('');
  const [isUnique, setIsUnique] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sanitizedColumnName = columnName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/^_+|_+$/g, '');

      if (!sanitizedColumnName) {
        setError('Column name is required');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-schema-manager`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tableName,
            columnName: sanitizedColumnName,
            displayName: displayName || columnName,
            dataType,
            isNullable,
            defaultValue: defaultValue || null,
            validationRules: {},
            isUnique,
            isGlobal,
            dropdownOptions: dropdownOptions
              ? dropdownOptions.split('\n').map(opt => opt.trim()).filter(Boolean)
              : null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create column');
      }

      onColumnCreated(result.columnName, displayName || columnName);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create column');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setColumnName('');
    setDisplayName('');
    setDataType('text');
    setIsNullable(true);
    setDefaultValue('');
    setIsUnique(false);
    setIsGlobal(false);
    setDropdownOptions('');
    setError('');
    onClose();
  };

  const showDropdownOptions = dataType === 'dropdown' || dataType === 'multiselect';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Column</h2>
            <p className="text-sm text-gray-600 mt-1">Add a custom column to {tableName}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Column Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., custom_field_1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Only letters, numbers, and underscores. Will be auto-formatted.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Custom Field 1"
              />
              <p className="text-xs text-gray-500 mt-1">
                User-friendly name shown in forms
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type <span className="text-red-500">*</span>
            </label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {DATA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {showDropdownOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dropdown Options <span className="text-red-500">*</span>
              </label>
              <textarea
                value={dropdownOptions}
                onChange={(e) => setDropdownOptions(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Enter one option per line&#10;e.g.,&#10;Option 1&#10;Option 2&#10;Option 3"
                required={showDropdownOptions}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter one option per line
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Value
            </label>
            <input
              type="text"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Optional default value"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isNullable}
                onChange={(e) => setIsNullable(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Allow empty values (Nullable)</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isUnique}
                onChange={(e) => setIsUnique(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Unique values only</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => setIsGlobal(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Make available in all forms (Global)
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Column
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
