import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, FileSpreadsheet, CheckCircle } from 'lucide-react';

type DataType = 'contacts' | 'enquiries' | 'appointments' | 'admissions' | 'student_status';

interface ExportOption {
  id: DataType;
  name: string;
  description: string;
}

export function DataExport() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const exportOptions: ExportOption[] = [
    { id: 'contacts', name: 'Total Contacts', description: 'Export all contact records' },
    { id: 'enquiries', name: 'Enquiries', description: 'Export all enquiry records' },
    { id: 'appointments', name: 'Appointments', description: 'Export all appointment records' },
    { id: 'admissions', name: 'Admissions', description: 'Export all admission records' },
    { id: 'student_status', name: 'Student Status', description: 'Export all student status records' },
  ];

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return `"${value.join('; ')}"`;
        if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (dataType: DataType, format: 'csv' | 'json') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: fetchError } = await supabase
        .from(dataType)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setError(`No ${dataType} data found to export`);
        setLoading(false);
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${dataType}_${timestamp}.${format}`;

      if (format === 'csv') {
        const csv = convertToCSV(data);
        downloadFile(csv, filename, 'text/csv');
      } else {
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, filename, 'application/json');
      }

      setSuccess(`Successfully exported ${data.length} ${dataType} records`);
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Data</h3>
        <p className="text-sm text-gray-600">Download your data in CSV or JSON format</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((option) => (
          <div
            key={option.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
          >
            <div className="flex items-start gap-3 mb-4">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">{option.name}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExport(option.id, 'csv')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport(option.id, 'json')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Exporting data...</p>
        </div>
      )}
    </div>
  );
}
