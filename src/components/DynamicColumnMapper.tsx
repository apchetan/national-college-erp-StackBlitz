import { useState, useEffect, ChangeEvent } from 'react';
import { Upload, Download, Save, Play, AlertCircle, CheckCircle, Plus, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { parseFile, ParsedFile, downloadCSV } from '../utils/fileParser';
import NewColumnModal from './NewColumnModal';

const TARGET_TABLES = [
  { value: 'contacts', label: 'Contacts' },
  { value: 'enquiries', label: 'Enquiries' },
  { value: 'appointments', label: 'Appointments' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'payments', label: 'Fee Payments' },
  { value: 'support_forms', label: 'Support Forms' },
  { value: 'student_status', label: 'Student Status' },
];

interface ColumnMapping {
  uploadedColumn: string;
  mapsTo: string;
  transformation: {
    trim?: boolean;
    uppercase?: boolean;
    lowercase?: boolean;
    dateFormat?: boolean;
    ignore?: boolean;
    replace?: Record<string, string>;
  };
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: any[];
}

export default function DynamicColumnMapper() {
  const [targetTable, setTargetTable] = useState('contacts');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFile | null>(null);
  const [availableColumns, setAvailableColumns] = useState<any[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showNewColumnModal, setShowNewColumnModal] = useState(false);
  const [newColumnFor, setNewColumnFor] = useState('');

  useEffect(() => {
    loadAvailableColumns();
    loadTemplates();
  }, [targetTable]);

  useEffect(() => {
    if (parsedData) {
      initializeColumnMappings();
    }
  }, [parsedData, availableColumns]);

  const loadAvailableColumns = async () => {
    try {
      const { data, error } = await supabase.rpc('get_available_columns', {
        p_table_name: targetTable,
      });

      if (error) throw error;
      setAvailableColumns(data || []);
    } catch (err: any) {
      console.error('Failed to load columns:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('mapping_templates')
        .select('*')
        .eq('target_table', targetTable)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');
    setLoading(true);
    setImportResult(null);

    try {
      const parsed = await parseFile(selectedFile);
      setFile(selectedFile);
      setParsedData(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const initializeColumnMappings = () => {
    if (!parsedData) return;

    const mappings: ColumnMapping[] = parsedData.headers.map((header) => {
      const matchingColumn = availableColumns.find(
        (col) =>
          col.column_name.toLowerCase() === header.toLowerCase() ||
          col.display_name?.toLowerCase() === header.toLowerCase()
      );

      return {
        uploadedColumn: header,
        mapsTo: matchingColumn?.column_name || '',
        transformation: { trim: true },
      };
    });

    setColumnMappings(mappings);
  };

  const handleMappingChange = (index: number, field: keyof ColumnMapping, value: any) => {
    const updated = [...columnMappings];
    if (field === 'transformation') {
      updated[index].transformation = { ...updated[index].transformation, ...value };
    } else {
      updated[index][field] = value;
    }
    setColumnMappings(updated);
  };

  const handleCreateNewColumn = (uploadedColumn: string) => {
    setNewColumnFor(uploadedColumn);
    setShowNewColumnModal(true);
  };

  const handleColumnCreated = async (columnName: string, displayName: string) => {
    await loadAvailableColumns();

    const index = columnMappings.findIndex((m) => m.uploadedColumn === newColumnFor);
    if (index !== -1) {
      handleMappingChange(index, 'mapsTo', columnName);
    }

    setNewColumnFor('');
  };

  const handleApplyTemplate = () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    const templateMapping = template.mapping_config;
    const updated = columnMappings.map((mapping) => ({
      ...mapping,
      mapsTo: templateMapping[mapping.uploadedColumn] || mapping.mapsTo,
      transformation: template.transformation_rules[mapping.uploadedColumn] || mapping.transformation,
    }));

    setColumnMappings(updated);
  };

  const handleImport = async () => {
    if (!parsedData || !file) {
      setError('Please upload a file first');
      return;
    }

    const unmappedColumns = columnMappings.filter((m) => !m.mapsTo && !m.transformation.ignore);
    if (unmappedColumns.length > 0) {
      setError(`Please map all columns or mark them as ignored: ${unmappedColumns.map((m) => m.uploadedColumn).join(', ')}`);
      return;
    }

    setError('');
    setImporting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in');
      }

      const columnMapping: Record<string, string> = {};
      const transformationRules: Record<string, any> = {};

      columnMappings.forEach((mapping) => {
        if (!mapping.transformation.ignore && mapping.mapsTo) {
          columnMapping[mapping.uploadedColumn] = mapping.mapsTo;
          transformationRules[mapping.uploadedColumn] = mapping.transformation;
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bulk-import-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetTable,
            fileName: file.name,
            columnMapping,
            transformationRules,
            data: parsedData.data,
            saveAsTemplate,
            templateName: saveAsTemplate ? templateName : undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setImportResult(result);

      if (result.successfulRows > 0) {
        if (saveAsTemplate && templateName) {
          await loadTemplates();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const downloadErrorReport = () => {
    if (!importResult?.errors || importResult.errors.length === 0) return;

    const errorData = importResult.errors.map((err) => ({
      Row: err.row || 'N/A',
      Errors: Array.isArray(err.errors) ? err.errors.join('; ') : err.error || 'Unknown error',
      Data: JSON.stringify(err.data || {}),
    }));

    downloadCSV(errorData, `import-errors-${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Dynamic Data Import</h2>
        <p className="text-blue-100">
          Upload CSV files and map columns dynamically. Create custom columns on-the-fly.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {importResult && (
        <div
          className={`border rounded-lg p-4 flex items-start gap-3 ${
            importResult.failedRows === 0
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <CheckCircle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              importResult.failedRows === 0 ? 'text-green-600' : 'text-yellow-600'
            }`}
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              Import {importResult.failedRows === 0 ? 'Completed' : 'Partially Completed'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Successfully imported {importResult.successfulRows} of {importResult.totalRows} rows
              {importResult.failedRows > 0 && ` (${importResult.failedRows} failed)`}
            </p>
            {importResult.errors.length > 0 && (
              <button
                onClick={downloadErrorReport}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Error Report
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Table <span className="text-red-500">*</span>
          </label>
          <select
            value={targetTable}
            onChange={(e) => {
              setTargetTable(e.target.value);
              setParsedData(null);
              setFile(null);
              setImportResult(null);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {TARGET_TABLES.map((table) => (
              <option key={table.value} value={table.value}>
                {table.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File <span className="text-red-500">*</span>
          </label>
          <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <Upload className="w-5 h-5 mr-2 text-gray-400" />
            <span className="text-sm text-gray-600">
              {file ? file.name : 'Choose CSV file'}
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {templates.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Load Mapping Template (Optional)
          </label>
          <div className="flex gap-3">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.template_name}
                </option>
              ))}
            </select>
            <button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {parsedData && (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Column Mapping</h3>
              <p className="text-sm text-gray-600 mt-1">
                Map uploaded columns to database fields or create new columns
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Uploaded Column
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Maps To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Transformations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {columnMappings.map((mapping, index) => (
                    <tr key={mapping.uploadedColumn} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{mapping.uploadedColumn}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          Sample: {parsedData.data[0]?.[mapping.uploadedColumn] || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <select
                            value={mapping.mapsTo}
                            onChange={(e) => handleMappingChange(index, 'mapsTo', e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            disabled={mapping.transformation.ignore}
                          >
                            <option value="">-- Select Column --</option>
                            {availableColumns.map((col) => (
                              <option key={col.column_name} value={col.column_name}>
                                {col.display_name || col.column_name}
                                {col.is_custom && ' (Custom)'}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleCreateNewColumn(mapping.uploadedColumn)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title="Create New Column"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={mapping.transformation.trim || false}
                              onChange={(e) =>
                                handleMappingChange(index, 'transformation', {
                                  trim: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            Trim
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={mapping.transformation.uppercase || false}
                              onChange={(e) =>
                                handleMappingChange(index, 'transformation', {
                                  uppercase: e.target.checked,
                                  lowercase: false,
                                })
                              }
                              className="rounded"
                            />
                            Uppercase
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={mapping.transformation.lowercase || false}
                              onChange={(e) =>
                                handleMappingChange(index, 'transformation', {
                                  lowercase: e.target.checked,
                                  uppercase: false,
                                })
                              }
                              className="rounded"
                            />
                            Lowercase
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={mapping.transformation.dateFormat || false}
                              onChange={(e) =>
                                handleMappingChange(index, 'transformation', {
                                  dateFormat: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            Date Format
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={mapping.transformation.ignore || false}
                              onChange={(e) =>
                                handleMappingChange(index, 'transformation', {
                                  ignore: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            Ignore
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Save this mapping as a template</span>
            </label>

            {saveAsTemplate && (
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={importing || loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {importing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Import Data ({parsedData.data.length} rows)
                </>
              )}
            </button>
          </div>
        </>
      )}

      <NewColumnModal
        isOpen={showNewColumnModal}
        onClose={() => {
          setShowNewColumnModal(false);
          setNewColumnFor('');
        }}
        tableName={targetTable}
        onColumnCreated={handleColumnCreated}
      />
    </div>
  );
}
