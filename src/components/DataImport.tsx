import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { downloadEnquiryCSVTemplate, downloadStudentStatusCSVTemplate } from '../utils/csvTemplate';
import { sanitizeDateValue } from '../utils/dateValidation';
import { checkForDuplicates } from '../utils/duplicateDetection';

type DataType = 'contacts' | 'enquiries' | 'appointments' | 'admissions' | 'student_status' | 'payments';

interface ImportOption {
  id: DataType;
  name: string;
  description: string;
}

export function DataImport() {
  const [selectedType, setSelectedType] = useState<DataType>('contacts');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [skippedRecords, setSkippedRecords] = useState<string[]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({});

  const importOptions: ImportOption[] = [
    { id: 'contacts', name: 'Contacts', description: 'Import contact records' },
    { id: 'enquiries', name: 'Enquiries', description: 'Import enquiry records' },
    { id: 'appointments', name: 'Appointments', description: 'Import appointment records' },
    { id: 'admissions', name: 'Admissions', description: 'Import admission records' },
    { id: 'payments', name: 'Fee Payment Form', description: 'Import payment records' },
    { id: 'student_status', name: 'Student Status', description: 'Import student status records' },
  ];

  const columnMapping: Record<string, string> = {
    'First Name': 'first_name',
    'Last Name': 'last_name',
    'Email Address': 'email',
    'Phone Number': 'phone',
    'Date of Birth (DD-MM-YYYY)': 'date_of_birth',
    'City': 'city',
    'Address': 'address',
    'Gender': 'gender',
    'Caller': 'caller',
    'Current Company/Organization': 'company',
    'How did you hear about us': 'source',
    'Enquiry Type': 'enquiry_type',
    'Subject': 'subject',
    'Message': 'message',
    'Priority': 'priority',
    'Annual Salary': 'annual_salary',
    'Course': 'program',
    'Job Title': 'program',
    'Specialisation': 'specialisation',
    'Previous Institution': 'previous_institution',
    'Years of Experience': 'experience_years',
    'Experience': 'experience_years',
    'Expirence': 'experience_years',
    'Additional Notes': 'notes',
    'Contact Email': 'contact_email',
    'Program': 'program',
    'Status': 'status',
    'Courseware Exam Status': 'courseware_exam_status',
    'Degree Status': 'degree_status',
    'Degree Issued': 'degree_issued',
    'Degree Courier Docket': 'degree_courier_docket',
    'Enrolment No Status': 'enrolment_no_status',
    'Enrolment No Value': 'enrolment_no_value',
    'Exam Status': 'exam_status',
    'LOR Status': 'lor_status',
    'LOR Issued': 'lor_issued',
    'LOR Courier Docket': 'lor_courier_docket',
    'MS Hard Copy Status': 'ms_hard_copy_status',
    'MS Hard Copy Issued': 'ms_hard_copy_issued',
    'MS Hard Copy Courier Docket': 'ms_hard_copy_courier_docket',
    'MS Hard Copy Courier Status': 'ms_hard_copy_courier_status',
    'MS SCAN Status': 'ms_scan_status',
    'MS SCAN Issued': 'ms_scan_issued',
    'MS SCAN Courier Docket': 'ms_scan_courier_docket',
    'Provisional Degree Status': 'provisional_degree_status',
    'Provisional Degree Issued': 'provisional_degree_issued',
    'Provisional Degree Courier Docket': 'provisional_degree_courier_docket',
    'Provisional Degree Courier Status': 'provisional_degree_courier_status',
    'Recommendation Letter Status': 'recommendation_letter_status',
    'Recommendation Letter Issued': 'recommendation_letter_issued',
    'Recommendation Letter Courier Docket': 'recommendation_letter_courier_docket',
    'Result Status': 'result_status',
    'Roll No Status': 'roll_no_status',
    'University PhD Offer Letter Status': 'university_phd_offer_letter_status',
    'University PhD Offer Letter Issued': 'university_phd_offer_letter_issued',
    'University PhD Offer Letter Courier Docket': 'university_phd_offer_letter_courier_docket',
    'University Visit Status': 'university_visit_status',
    'University Visit1 Status': 'university_visit1_status',
    'University Visit2 Status': 'university_visit2_status',
    'University Visit3 Status': 'university_visit3_status',
    'VIVA Status': 'viva_status',
    'WES Status': 'wes_status',
    'WES Issued': 'wes_issued',
    'WES Courier Docket': 'wes_courier_docket',
  };

  const mapColumnName = (header: string): string => {
    return columnMapping[header] || header.toLowerCase().replace(/\s+/g, '_');
  };

  const getTargetColumns = (dataType: DataType): string[] => {
    const columnsByType: Record<DataType, string[]> = {
      contacts: ['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'city', 'address', 'gender', 'company', 'caller', 'source', 'status'],
      enquiries: ['contact_id', 'subject', 'message', 'enquiry_type', 'priority', 'annual_salary', 'program', 'specialisation', 'previous_institution', 'experience_years', 'notes', 'status'],
      appointments: ['contact_id', 'appointment_date', 'appointment_time', 'purpose', 'notes', 'status', 'attendance'],
      admissions: ['contact_id', 'program', 'specialisation', 'admission_status', 'previous_institution', 'qualifications', 'notes', 'status'],
      payments: ['contact_id', 'amount', 'payment_date', 'payment_method', 'transaction_id', 'payment_status', 'notes', 'receipt_url'],
      student_status: ['contact_id', 'program', 'specialisation', 'courseware_exam_status', 'degree_status', 'degree_issued', 'degree_courier_docket', 'enrolment_no_status', 'enrolment_no_value', 'exam_status', 'lor_status', 'lor_issued', 'lor_courier_docket', 'ms_hard_copy_status', 'ms_hard_copy_issued', 'ms_hard_copy_courier_docket', 'ms_hard_copy_courier_status', 'ms_scan_status', 'ms_scan_issued', 'ms_scan_courier_docket', 'provisional_degree_status', 'provisional_degree_issued', 'provisional_degree_courier_docket', 'provisional_degree_courier_status', 'recommendation_letter_status', 'recommendation_letter_issued', 'recommendation_letter_courier_docket', 'result_status', 'roll_no_status', 'university_phd_offer_letter_status', 'university_phd_offer_letter_issued', 'university_phd_offer_letter_courier_docket', 'university_visit_status', 'university_visit1_status', 'university_visit2_status', 'university_visit3_status', 'viva_status', 'wes_status', 'wes_issued', 'wes_courier_docket', 'notes'],
    };
    return columnsByType[dataType] || [];
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;

      for (let char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, ''));

      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          let value: any = values[index];

          if (value === '' || value === 'null' || value === 'undefined') {
            value = null;
          } else if (value === 'true') {
            value = true;
          } else if (value === 'false') {
            value = false;
          } else if (!isNaN(Number(value)) && value !== '') {
            value = Number(value);
          } else if (value.includes(';')) {
            value = value.split(';').map((v: string) => v.trim());
          }

          const mappedHeader = mapColumnName(header);
          row[mappedHeader] = value;
        });
        data.push(row);
      }
    }

    return data;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setSuccess('');
    setSkippedRecords([]);

    try {
      const text = await selectedFile.text();
      let headers: string[] = [];
      let preview: any[] = [];

      if (selectedFile.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          headers = Object.keys(jsonData[0]);
          preview = jsonData.slice(0, 3);
        }
      } else if (selectedFile.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const fullData = parseCSV(text);
          preview = fullData.slice(0, 3);
        }
      }

      setFileHeaders(headers);
      setPreviewData(preview);

      const initialMapping: Record<string, string> = {};
      headers.forEach(header => {
        const mapped = mapColumnName(header);
        initialMapping[header] = mapped;
      });
      setCustomMapping(initialMapping);
      setShowMapping(true);
    } catch (err: any) {
      setError(`Failed to parse file: ${err.message}`);
    }
  };

  const applyCustomMapping = (data: any[]): any[] => {
    return data.map(row => {
      const mapped: any = {};
      Object.keys(row).forEach(sourceKey => {
        const targetKey = customMapping[sourceKey] || sourceKey;
        if (targetKey && targetKey !== 'skip') {
          mapped[targetKey] = row[sourceKey];
        }
      });
      return mapped;
    });
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setSkippedRecords([]);
    setShowMapping(false);

    try {
      const text = await file.text();
      let data: any[];

      if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        data = applyCustomMapping(jsonData);
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) throw new Error('Empty file');

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rawData: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values: string[] = [];
          let currentValue = '';
          let inQuotes = false;

          for (let char of lines[i]) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue.trim().replace(/^"|"$/g, ''));
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue.trim().replace(/^"|"$/g, ''));

          if (values.length === headers.length) {
            const row: any = {};
            headers.forEach((header, index) => {
              let value: any = values[index];
              if (value === '' || value === 'null' || value === 'undefined') {
                value = null;
              } else if (value === 'true') {
                value = true;
              } else if (value === 'false') {
                value = false;
              } else if (!isNaN(Number(value)) && value !== '') {
                value = Number(value);
              } else if (value.includes(';')) {
                value = value.split(';').map((v: string) => v.trim());
              }
              row[header] = value;
            });
            rawData.push(row);
          }
        }

        data = applyCustomMapping(rawData);
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON.');
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No valid data found in file');
      }

      const cleanedData = data.map(row => {
        const cleaned: any = {};
        Object.keys(row).forEach(key => {
          if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
            cleaned[key] = row[key];
          }
        });
        return cleaned;
      });

      if (selectedType === 'enquiries') {
        const contactFields = new Set(['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'city', 'address', 'gender', 'company', 'caller', 'source']);
        const enquiryFields = new Set(['subject', 'message', 'enquiry_type', 'priority', 'annual_salary', 'program', 'specialisation', 'previous_institution', 'experience_years', 'notes']);
        let successCount = 0;
        const skipped: string[] = [];

        for (const row of cleanedData) {
          const contactData: any = {};
          const enquiryData: any = {};

          Object.keys(row).forEach(key => {
            if (contactFields.has(key)) {
              contactData[key] = row[key];
            } else if (enquiryFields.has(key)) {
              enquiryData[key] = row[key];
            }
          });

          if (!contactData.first_name || !contactData.last_name || !contactData.email) {
            continue;
          }

          const duplicates = await checkForDuplicates({
            firstName: contactData.first_name,
            lastName: contactData.last_name,
            email: contactData.email,
            phone: contactData.phone,
          });

          if (duplicates.length > 0) {
            skipped.push(`${contactData.first_name} ${contactData.last_name} (${contactData.email}) - duplicate contact`);
            continue;
          }

          if (contactData.date_of_birth !== undefined) {
            contactData.date_of_birth = sanitizeDateValue(contactData.date_of_birth);
          }

          contactData.status = 'new';

          const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .insert(contactData)
            .select()
            .maybeSingle();

          if (contactError) throw contactError;

          if (contact && enquiryData.subject && enquiryData.message) {
            enquiryData.contact_id = contact.id;
            enquiryData.status = 'new';

            const { error: enquiryError } = await supabase
              .from('enquiries')
              .insert(enquiryData);

            if (enquiryError) throw enquiryError;
          }

          successCount++;
        }

        setSkippedRecords(skipped);
        setSuccess(`Successfully imported ${successCount} enquiry records${skipped.length > 0 ? `. Skipped ${skipped.length} duplicate(s)` : ''}`);
      } else if (selectedType === 'student_status') {
        let successCount = 0;
        const errors: string[] = [];

        for (const row of cleanedData) {
          const contactEmail = row.contact_email;

          if (!contactEmail) {
            errors.push('Missing contact email in one or more rows');
            continue;
          }

          const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .select('id')
            .eq('email', contactEmail)
            .maybeSingle();

          if (contactError || !contact) {
            errors.push(`Contact not found for email: ${contactEmail}`);
            continue;
          }

          const statusData: any = {
            contact_id: contact.id,
            program: row.program,
            specialisation: row.specialisation || null,
            courseware_exam_status: row.courseware_exam_status || null,
            degree_status: row.degree_status || null,
            degree_issued: row.degree_issued === true || row.degree_issued === 'true',
            degree_courier_docket: row.degree_courier_docket || null,
            enrolment_no_status: row.enrolment_no_status || null,
            enrolment_no_value: row.enrolment_no_value || null,
            exam_status: row.exam_status || null,
            lor_status: row.lor_status || null,
            lor_issued: row.lor_issued === true || row.lor_issued === 'true',
            lor_courier_docket: row.lor_courier_docket || null,
            ms_hard_copy_status: row.ms_hard_copy_status || null,
            ms_hard_copy_issued: row.ms_hard_copy_issued === true || row.ms_hard_copy_issued === 'true',
            ms_hard_copy_courier_docket: row.ms_hard_copy_courier_docket || null,
            ms_hard_copy_courier_status: row.ms_hard_copy_courier_status || null,
            ms_scan_status: row.ms_scan_status || null,
            ms_scan_issued: row.ms_scan_issued === true || row.ms_scan_issued === 'true',
            ms_scan_courier_docket: row.ms_scan_courier_docket || null,
            provisional_degree_status: row.provisional_degree_status || null,
            provisional_degree_issued: row.provisional_degree_issued === true || row.provisional_degree_issued === 'true',
            provisional_degree_courier_docket: row.provisional_degree_courier_docket || null,
            provisional_degree_courier_status: row.provisional_degree_courier_status || null,
            recommendation_letter_status: row.recommendation_letter_status || null,
            recommendation_letter_issued: row.recommendation_letter_issued === true || row.recommendation_letter_issued === 'true',
            recommendation_letter_courier_docket: row.recommendation_letter_courier_docket || null,
            result_status: row.result_status || null,
            roll_no_status: row.roll_no_status || null,
            university_phd_offer_letter_status: row.university_phd_offer_letter_status || null,
            university_phd_offer_letter_issued: row.university_phd_offer_letter_issued === true || row.university_phd_offer_letter_issued === 'true',
            university_phd_offer_letter_courier_docket: row.university_phd_offer_letter_courier_docket || null,
            university_visit_status: row.university_visit_status || null,
            university_visit1_status: row.university_visit1_status || null,
            university_visit2_status: row.university_visit2_status || null,
            university_visit3_status: row.university_visit3_status || null,
            viva_status: row.viva_status || null,
            wes_status: row.wes_status || null,
            wes_issued: row.wes_issued === true || row.wes_issued === 'true',
            wes_courier_docket: row.wes_courier_docket || null,
            notes: row.notes || null,
          };

          const { error: insertError } = await supabase
            .from('student_status')
            .insert(statusData);

          if (insertError) {
            errors.push(`Failed to import status for ${contactEmail}: ${insertError.message}`);
            continue;
          }

          successCount++;
        }

        let message = `Successfully imported ${successCount} student status records`;
        if (errors.length > 0) {
          message += `\n\nErrors (${errors.length}):\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) {
            message += `\n... and ${errors.length - 5} more errors`;
          }
        }
        setSuccess(message);
      } else if (selectedType === 'contacts') {
        const validContactFields = new Set(['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'city', 'address', 'gender', 'company', 'caller', 'source', 'status']);

        const filteredData = cleanedData.map(row => {
          const filtered: any = {};
          Object.keys(row).forEach(key => {
            if (validContactFields.has(key)) {
              filtered[key] = row[key];
            }
          });
          if (filtered.date_of_birth !== undefined) {
            filtered.date_of_birth = sanitizeDateValue(filtered.date_of_birth);
          }
          if (!filtered.status) {
            filtered.status = 'new';
          }
          return filtered;
        });

        const { data: insertedData, error: insertError } = await supabase
          .from('contacts')
          .insert(filteredData)
          .select();

        if (insertError) throw insertError;

        setSuccess(`Successfully imported ${insertedData?.length || 0} contact records`);
      } else {
        const sanitizeDatesInRow = (row: any, dataType: DataType) => {
          const dateFields: Record<DataType, string[]> = {
            contacts: ['date_of_birth'],
            enquiries: ['date_of_birth'],
            appointments: ['appointment_date'],
            admissions: [],
            payments: ['payment_date'],
            student_status: [],
          };

          const fieldsToSanitize = dateFields[dataType] || [];
          const sanitized = { ...row };

          fieldsToSanitize.forEach(field => {
            if (sanitized[field] !== undefined) {
              sanitized[field] = sanitizeDateValue(sanitized[field]);
            }
          });

          return sanitized;
        };

        const sanitizedData = cleanedData.map(row => sanitizeDatesInRow(row, selectedType));

        const allColumns = new Set<string>();
        sanitizedData.forEach(row => {
          Object.keys(row).forEach(key => allColumns.add(key));
        });

        const testRow = sanitizedData[0];
        const { error: testError } = await supabase
          .from(selectedType)
          .insert(testRow)
          .select();

        const invalidColumns = new Set<string>();

        if (testError) {
          const columnMatches = testError.message.matchAll(/column "([^"]+)"/g);
          for (const match of columnMatches) {
            if (match[1]) {
              invalidColumns.add(match[1]);
            }
          }

          if (invalidColumns.size > 0) {
            const filteredData = sanitizedData.map(row => {
              const filtered: any = {};
              Object.keys(row).forEach(key => {
                if (!invalidColumns.has(key)) {
                  filtered[key] = row[key];
                }
              });
              return filtered;
            });

            const { data: insertedData, error: insertError } = await supabase
              .from(selectedType)
              .insert(filteredData)
              .select();

            if (insertError) throw insertError;

            let successMessage = `Successfully imported ${insertedData?.length || 0} records`;
            if (invalidColumns.size > 0) {
              successMessage += `\n\nSkipped columns not in database: ${Array.from(invalidColumns).join(', ')}`;
            }

            setSuccess(successMessage);
          } else {
            throw testError;
          }
        } else {
          const { data: insertedData, error: insertError } = await supabase
            .from(selectedType)
            .insert(sanitizedData.slice(1))
            .select();

          if (insertError) throw insertError;

          setSuccess(`Successfully imported ${(insertedData?.length || 0) + 1} records`);
        }
      }

      setFile(null);
      setShowMapping(false);
      setFileHeaders([]);
      setPreviewData([]);
      setCustomMapping({});
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMapping = () => {
    setFile(null);
    setShowMapping(false);
    setFileHeaders([]);
    setPreviewData([]);
    setCustomMapping({});
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Data</h3>
          <p className="text-sm text-gray-600">Upload CSV or JSON files to import data</p>
        </div>
        <button
          onClick={() => {
            if (selectedType === 'student_status') {
              downloadStudentStatusCSVTemplate();
            } else {
              downloadEnquiryCSVTemplate();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Only matching columns will be imported - extra columns are automatically skipped</li>
              <li>ID, created_at, and updated_at fields will be auto-generated</li>
              <li>You'll see which columns were skipped after import completes</li>
              <li>Ensure data format matches the selected table schema for matching columns</li>
            </ul>
          </div>
        </div>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Data Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DataType)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          {importOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} - {option.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select File (CSV or JSON)
        </label>
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition text-center">
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to select file</p>
                  <p className="text-xs text-gray-500 mt-1">CSV or JSON format</p>
                </div>
              )}
            </div>
            <input
              id="file-input"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {showMapping && fileHeaders.length > 0 && (
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Map Your Columns</h4>
              <p className="text-sm text-gray-600 mt-1">
                Match your file columns to the database fields. Select "Skip" to ignore a column.
              </p>
            </div>
            <button
              onClick={handleCancelMapping}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel & Choose Different File
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {fileHeaders.map((header, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-500 mb-1">Your Column</label>
                  <div className="text-sm font-medium text-gray-900">{header}</div>
                  {previewData[0] && (
                    <div className="text-xs text-gray-500 mt-1 truncate" title={previewData[0][header]}>
                      Example: {previewData[0][header] || '(empty)'}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center text-gray-400">→</div>

                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-500 mb-1">Maps To</label>
                  <select
                    value={customMapping[header] || 'skip'}
                    onChange={(e) => {
                      setCustomMapping({
                        ...customMapping,
                        [header]: e.target.value,
                      });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="skip">Skip this column</option>
                    {getTargetColumns(selectedType).map((col) => (
                      <option key={col} value={col}>
                        {col.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {previewData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-300">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Preview (First {previewData.length} rows)</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {fileHeaders.map((header, idx) => (
                        <th key={idx} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b">
                        {fileHeaders.map((header, colIdx) => (
                          <td key={colIdx} className="px-3 py-2 text-gray-600">
                            {String(row[header] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!file || loading || !showMapping}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="w-5 h-5" />
        {loading ? 'Importing...' : 'Import Data'}
      </button>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Processing import...</p>
        </div>
      )}

      {skippedRecords.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800">Skipped Duplicate Records</h4>
              <p className="text-sm text-yellow-700 mt-1">
                The following records were skipped because similar contacts already exist:
              </p>
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-yellow-800 ml-7">
            {skippedRecords.map((record, idx) => (
              <li key={idx} className="list-disc">{record}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
