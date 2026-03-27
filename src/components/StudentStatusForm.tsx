import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClipboardCheck, AlertCircle, CheckCircle, ArrowLeft, Search } from 'lucide-react';
import { useNavigation } from '../App';
import { Contact, Admission } from '../types/interfaces';

interface CourierEntry {
  id: string;
  created_at: string;
  received_from_student_apply_forms: string[] | null;
  received_from_student_docket_no: string | null;
  received_from_student_date: string | null;
  sent_to_student_apply_forms: string[] | null;
  sent_to_student_docket_no: string | null;
  sent_to_student_date: string | null;
  sent_to_university_apply_forms: string[] | null;
  sent_to_university_docket_no: string | null;
  sent_to_university_date: string | null;
  received_from_university_apply_forms: string[] | null;
  received_from_university_docket_no: string | null;
  received_from_university_date: string | null;
}

interface StatusFieldConfig {
  key: string;
  label: string;
  options: [string, string];
}

const STATUS_FIELDS: StatusFieldConfig[] = [
  { key: 'courseware_exam_status', label: 'Courseware Exam Status', options: ['Done', 'Not Done'] },
  { key: 'degree_status', label: 'Degree', options: ['Received', 'Not Received'] },
  { key: 'enrolment_no_status', label: 'Enrolment No.', options: ['Received', 'Not Received'] },
  { key: 'exam_status', label: 'Exam Status', options: ['Done', 'Not Done'] },
  { key: 'lor_status', label: 'LOR', options: ['Received', 'Not Received'] },
  { key: 'ms_hard_copy_status', label: 'MS Hard Copy', options: ['Received', 'Not Received'] },
  { key: 'ms_hard_copy_courier_status', label: 'MS Hard Copy Courier', options: ['Sent', 'Not Sent'] },
  { key: 'ms_scan_status', label: 'MS SCAN status', options: ['Received', 'Not Received'] },
  { key: 'provisional_degree_status', label: 'Provisional Degree', options: ['Received', 'Not Received'] },
  { key: 'provisional_degree_courier_status', label: 'Provisional Degree Courier', options: ['Sent', 'Not Sent'] },
  { key: 'recommendation_letter_status', label: 'Recommendation Letter', options: ['Received', 'Not Received'] },
  { key: 'result_status', label: 'Result Status', options: ['Declared', 'Not Declared'] },
  { key: 'roll_no_status', label: 'Roll No.', options: ['Received', 'Not Received'] },
  { key: 'university_phd_offer_letter_status', label: 'University PhD Offer Letter', options: ['Received', 'Not Received'] },
  { key: 'university_visit_status', label: 'University Visit', options: ['Visited', 'Not Visited'] },
  { key: 'university_visit1_status', label: 'University Visit1', options: ['Visited', 'Not Visited'] },
  { key: 'university_visit2_status', label: 'University Visit2', options: ['Visited', 'Not Visited'] },
  { key: 'university_visit3_status', label: 'University Visit3', options: ['Visited', 'Not Visited'] },
  { key: 'viva_status', label: 'VIVA', options: ['Visited', 'Not Visited'] },
  { key: 'wes_status', label: 'WES', options: ['Received', 'Not Received'] },
];

const PHD_FIELDS = [
  'university_phd_offer_letter_status',
  'enrolment_no_status',
  'roll_no_status',
  'courseware_exam_status',
  'result_status',
  'ms_scan_status',
  'ms_hard_copy_status',
  'ms_hard_copy_courier_status',
  'provisional_degree_status',
  'degree_status',
  'university_visit1_status',
  'university_visit2_status',
  'university_visit3_status',
  'viva_status',
];

const NON_PHD_FIELDS = [
  'enrolment_no_status',
  'roll_no_status',
  'exam_status',
  'result_status',
  'ms_scan_status',
  'ms_hard_copy_status',
  'ms_hard_copy_courier_status',
  'provisional_degree_status',
  'provisional_degree_courier_status',
  'degree_status',
  'university_visit_status',
  'lor_status',
  'wes_status',
  'recommendation_letter_status',
];

export function StudentStatusForm() {
  const { setCurrentPage } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Admission[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [searching, setSearching] = useState(false);
  const [courierEntries, setCourierEntries] = useState<CourierEntry[]>([]);

  const [statusData, setStatusData] = useState<Record<string, string | null>>({});
  const [notes, setNotes] = useState('');

  const [rollNoValues, setRollNoValues] = useState<string[]>(Array(8).fill(''));
  const [rollNoCheckboxes, setRollNoCheckboxes] = useState<boolean[]>(Array(8).fill(false));
  const [msScanCheckboxes, setMsScanCheckboxes] = useState<boolean[]>(Array(8).fill(false));
  const [msHardCopyCheckboxes, setMsHardCopyCheckboxes] = useState<boolean[]>(Array(8).fill(false));
  const [msHardCopyCourierCheckboxes, setMsHardCopyCourierCheckboxes] = useState<boolean[]>(Array(8).fill(false));

  const [provisionalDegreeIssued, setProvisionalDegreeIssued] = useState(false);
  const [degreeIssued, setDegreeIssued] = useState(false);
  const [universityPhdOfferLetterIssued, setUniversityPhdOfferLetterIssued] = useState(false);
  const [enrolmentNoValue, setEnrolmentNoValue] = useState('');

  const [provisionalDegreeCourierDocket, setProvisionalDegreeCourierDocket] = useState('');
  const [degreeCourierDocket, setDegreeCourierDocket] = useState('');
  const [universityPhdOfferLetterCourierDocket, setUniversityPhdOfferLetterCourierDocket] = useState('');

  const [lorIssued, setLorIssued] = useState(false);
  const [lorCourierDocket, setLorCourierDocket] = useState('');
  const [recommendationLetterIssued, setRecommendationLetterIssued] = useState(false);
  const [recommendationLetterCourierDocket, setRecommendationLetterCourierDocket] = useState('');
  const [wesIssued, setWesIssued] = useState(false);
  const [wesCourierDocket, setWesCourierDocket] = useState('');
  const [msScanIssued, setMsScanIssued] = useState(false);
  const [msScanCourierDocket, setMsScanCourierDocket] = useState('');
  const [msHardCopyIssued, setMsHardCopyIssued] = useState(false);
  const [msHardCopyCourierDocket, setMsHardCopyCourierDocket] = useState('');

  const searchAdmissions = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const searchPattern = `%${query}%`;

      const { data: contacts, error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`)
        .limit(50);

      if (contactError) throw contactError;

      if (!contacts || contacts.length === 0) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      const contactIds = contacts.map(c => c.id);

      const { data: admissions, error: admissionError } = await supabase
        .from('admissions')
        .select(`
          id,
          contact_id,
          program,
          specialisation,
          contacts (
            id,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            city
          )
        `)
        .in('contact_id', contactIds)
        .limit(20);

      if (admissionError) throw admissionError;
      setSearchResults((admissions as any) || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const fetchCourierEntries = async (contactId: string) => {
    try {
      const { data, error } = await supabase
        .from('courier_status')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setCourierEntries(data || []);
    } catch (err) {
      console.error('Error fetching courier entries:', err);
      setCourierEntries([]);
    }
  };

  const loadExistingStatus = async (admissionId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_status')
        .select('*')
        .eq('admission_id', admissionId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const newStatusData: Record<string, string | null> = {};
        STATUS_FIELDS.forEach(field => {
          newStatusData[field.key] = (data as any)[field.key] || null;
        });
        setStatusData(newStatusData);
        setNotes(data.notes || '');

        setRollNoValues((data.roll_no_values || []).concat(Array(8).fill('')).slice(0, 8));
        setRollNoCheckboxes((data.roll_no_checkboxes || Array(8).fill(false)).slice(0, 8));
        setMsScanCheckboxes((data.ms_scan_checkboxes || Array(8).fill(false)).slice(0, 8));
        setMsHardCopyCheckboxes((data.ms_hard_copy_checkboxes || Array(8).fill(false)).slice(0, 8));
        setMsHardCopyCourierCheckboxes((data.ms_hard_copy_courier_checkboxes || Array(8).fill(false)).slice(0, 8));

        setProvisionalDegreeIssued(data.provisional_degree_issued || false);
        setDegreeIssued(data.degree_issued || false);
        setUniversityPhdOfferLetterIssued(data.university_phd_offer_letter_issued || false);
        setEnrolmentNoValue(data.enrolment_no_value || '');

        setProvisionalDegreeCourierDocket(data.provisional_degree_courier_docket || '');
        setDegreeCourierDocket(data.degree_courier_docket || '');
        setUniversityPhdOfferLetterCourierDocket(data.university_phd_offer_letter_courier_docket || '');

        setLorIssued(data.lor_issued || false);
        setLorCourierDocket(data.lor_courier_docket || '');
        setRecommendationLetterIssued(data.recommendation_letter_issued || false);
        setRecommendationLetterCourierDocket(data.recommendation_letter_courier_docket || '');
        setWesIssued(data.wes_issued || false);
        setWesCourierDocket(data.wes_courier_docket || '');
        setMsScanIssued(data.ms_scan_issued || false);
        setMsScanCourierDocket(data.ms_scan_courier_docket || '');
        setMsHardCopyIssued(data.ms_hard_copy_issued || false);
        setMsHardCopyCourierDocket(data.ms_hard_copy_courier_docket || '');
      }
    } catch (err) {
      console.error('Error loading status:', err);
    }
  };

  const handleSelectAdmission = (admission: Admission) => {
    setSelectedAdmission(admission);
    setSearchResults([]);
    setSearchQuery('');
    loadExistingStatus(admission.id);
    fetchCourierEntries(admission.contact_id);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAdmissions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusChange = (fieldKey: string, value: string) => {
    setStatusData(prev => ({
      ...prev,
      [fieldKey]: prev[fieldKey] === value ? null : value,
    }));
  };

  const getVisibleFields = () => {
    if (!selectedAdmission) return [];

    const isPhD = selectedAdmission.program?.toLowerCase() === 'phd';
    const fieldOrder = isPhD ? PHD_FIELDS : NON_PHD_FIELDS;

    return fieldOrder
      .map(key => STATUS_FIELDS.find(f => f.key === key))
      .filter(Boolean) as StatusFieldConfig[];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data: existingStatus } = await supabase
        .from('student_status')
        .select('id')
        .eq('admission_id', selectedAdmission.id)
        .maybeSingle();

      const statusPayload = {
        admission_id: selectedAdmission.id,
        contact_id: selectedAdmission.contact_id,
        program: selectedAdmission.program,
        specialisation: selectedAdmission.specialisation,
        ...statusData,
        notes: notes || null,
        roll_no_values: rollNoValues,
        roll_no_checkboxes: rollNoCheckboxes,
        ms_scan_checkboxes: msScanCheckboxes,
        ms_hard_copy_checkboxes: msHardCopyCheckboxes,
        ms_hard_copy_courier_checkboxes: msHardCopyCourierCheckboxes,
        provisional_degree_issued: provisionalDegreeIssued,
        degree_issued: degreeIssued,
        university_phd_offer_letter_issued: universityPhdOfferLetterIssued,
        enrolment_no_value: enrolmentNoValue || null,
        provisional_degree_courier_docket: provisionalDegreeCourierDocket || null,
        degree_courier_docket: degreeCourierDocket || null,
        university_phd_offer_letter_courier_docket: universityPhdOfferLetterCourierDocket || null,
        lor_issued: lorIssued,
        lor_courier_docket: lorCourierDocket || null,
        recommendation_letter_issued: recommendationLetterIssued,
        recommendation_letter_courier_docket: recommendationLetterCourierDocket || null,
        wes_issued: wesIssued,
        wes_courier_docket: wesCourierDocket || null,
        ms_scan_issued: msScanIssued,
        ms_scan_courier_docket: msScanCourierDocket || null,
        ms_hard_copy_issued: msHardCopyIssued,
        ms_hard_copy_courier_docket: msHardCopyCourierDocket || null,
      };

      if (existingStatus) {
        const { error: updateError } = await supabase
          .from('student_status')
          .update(statusPayload)
          .eq('id', existingStatus.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('student_status')
          .insert(statusPayload);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setCurrentPage('dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Update Status Form</h2>
            <p className="text-gray-600">Track student progress and status</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Status updated successfully!</p>
              <p className="text-sm text-green-700 mt-1">Student status has been recorded.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-900">{error}</p>
          </div>
        )}

        {!selectedAdmission ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for Student Admission
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {searching && (
              <p className="text-sm text-gray-600">Searching...</p>
            )}

            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg divide-y">
                {searchResults.map((admission) => (
                  <button
                    key={admission.id}
                    onClick={() => handleSelectAdmission(admission)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {admission.contacts.first_name} {admission.contacts.last_name}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <p className="text-sm text-gray-600">{admission.contacts.email}</p>
                          {admission.contacts.phone && (
                            <p className="text-sm text-gray-600">{admission.contacts.phone}</p>
                          )}
                          {admission.contacts.city && (
                            <p className="text-sm text-gray-500">{admission.contacts.city}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {admission.program} {admission.specialisation ? `- ${admission.specialisation}` : ''}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full whitespace-nowrap ml-2">
                        Select
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 rounded-lg border border-blue-100 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedAdmission.program}
                  </h3>
                  {selectedAdmission.specialisation && (
                    <p className="text-base text-gray-700 mt-1">{selectedAdmission.specialisation}</p>
                  )}
                </div>
                {courierEntries.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Created: {new Date(courierEntries[0].created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                )}
              </div>

              {enrolmentNoValue && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Enrolment Number:</p>
                  <p className="text-lg font-mono text-gray-900">{enrolmentNoValue}</p>
                </div>
              )}

              {courierEntries.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Courier Status Report
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {courierEntries.slice(0, 3).map((entry, index) => (
                      <div key={entry.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-blue-600">Entry #{index + 1}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          {entry.received_from_student_apply_forms && entry.received_from_student_apply_forms.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">From Student:</span>
                              <span className="text-gray-600 ml-1">{entry.received_from_student_apply_forms.join(', ')}</span>
                            </div>
                          )}
                          {entry.sent_to_student_apply_forms && entry.sent_to_student_apply_forms.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">To Student:</span>
                              <span className="text-gray-600 ml-1">{entry.sent_to_student_apply_forms.join(', ')}</span>
                            </div>
                          )}
                          {entry.sent_to_university_apply_forms && entry.sent_to_university_apply_forms.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">To University:</span>
                              <span className="text-gray-600 ml-1">{entry.sent_to_university_apply_forms.join(', ')}</span>
                            </div>
                          )}
                          {entry.received_from_university_apply_forms && entry.received_from_university_apply_forms.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">From University:</span>
                              <span className="text-gray-600 ml-1">{entry.received_from_university_apply_forms.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAdmission.contacts.first_name} {selectedAdmission.contacts.last_name}
                </h3>
                <p className="text-sm text-gray-600">{selectedAdmission.contacts.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedAdmission(null);
                  setStatusData({});
                  setNotes('');
                  setCourierEntries([]);
                  setRollNoValues(Array(8).fill(''));
                  setRollNoCheckboxes(Array(8).fill(false));
                  setMsScanCheckboxes(Array(8).fill(false));
                  setMsHardCopyCheckboxes(Array(8).fill(false));
                  setMsHardCopyCourierCheckboxes(Array(8).fill(false));
                  setProvisionalDegreeIssued(false);
                  setDegreeIssued(false);
                  setUniversityPhdOfferLetterIssued(false);
                  setEnrolmentNoValue('');
                  setProvisionalDegreeCourierDocket('');
                  setDegreeCourierDocket('');
                  setUniversityPhdOfferLetterCourierDocket('');
                  setLorIssued(false);
                  setLorCourierDocket('');
                  setRecommendationLetterIssued(false);
                  setRecommendationLetterCourierDocket('');
                  setWesIssued(false);
                  setWesCourierDocket('');
                  setMsScanIssued(false);
                  setMsScanCourierDocket('');
                  setMsHardCopyIssued(false);
                  setMsHardCopyCourierDocket('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Change Student
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">
                Student Status Tracking ({selectedAdmission.program})
              </h3>
              {getVisibleFields().length === 0 ? (
                <p className="text-gray-600 text-center py-4">No status fields available for this program.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getVisibleFields().map((field) => (
                    <div key={field.key} className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-800">
                        {field.label}
                      </label>
                      <div className="flex gap-4">
                        {field.options.map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={statusData[field.key] === option}
                              onChange={() => handleStatusChange(field.key, option)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>

                      {field.key === 'roll_no_status' && statusData[field.key] === 'Received' && (
                        <div className="mt-3 space-y-2 pl-2 border-l-2 border-blue-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Roll Numbers (1-8)</p>
                          <div className="grid grid-cols-1 gap-2">
                            {Array.from({ length: 8 }, (_, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <label className="flex items-center gap-2 min-w-[60px]">
                                  <input
                                    type="checkbox"
                                    checked={rollNoCheckboxes[i]}
                                    onChange={(e) => {
                                      const updated = [...rollNoCheckboxes];
                                      updated[i] = e.target.checked;
                                      setRollNoCheckboxes(updated);
                                    }}
                                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-xs text-gray-600">{i + 1}</span>
                                </label>
                                <input
                                  type="text"
                                  value={rollNoValues[i]}
                                  onChange={(e) => {
                                    const updated = [...rollNoValues];
                                    updated[i] = e.target.value;
                                    setRollNoValues(updated);
                                  }}
                                  placeholder={`Roll No. ${i + 1}`}
                                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {field.key === 'ms_scan_status' && statusData[field.key] === 'Received' && (
                        <>
                          <div className="mt-3 space-y-2 pl-2 border-l-2 border-blue-200">
                            <p className="text-xs font-medium text-gray-700 mb-2">Semesters (1-8)</p>
                            <div className="grid grid-cols-4 gap-2">
                              {Array.from({ length: 8 }, (_, i) => (
                                <label key={i} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={msScanCheckboxes[i]}
                                    onChange={(e) => {
                                      const updated = [...msScanCheckboxes];
                                      updated[i] = e.target.checked;
                                      setMsScanCheckboxes(updated);
                                    }}
                                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-xs text-gray-600">{i + 1}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={msScanIssued}
                                onChange={(e) => setMsScanIssued(e.target.checked)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700 font-medium">Issued</span>
                            </label>
                            {msScanIssued && (
                              <input
                                type="text"
                                value={msScanCourierDocket}
                                onChange={(e) => setMsScanCourierDocket(e.target.value)}
                                placeholder="Courier-Docket No."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                          </div>
                        </>
                      )}

                      {field.key === 'ms_hard_copy_status' && statusData[field.key] === 'Received' && (
                        <>
                          <div className="mt-3 space-y-2 pl-2 border-l-2 border-blue-200">
                            <p className="text-xs font-medium text-gray-700 mb-2">Semesters (1-8)</p>
                            <div className="grid grid-cols-4 gap-2">
                              {Array.from({ length: 8 }, (_, i) => (
                                <label key={i} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={msHardCopyCheckboxes[i]}
                                    onChange={(e) => {
                                      const updated = [...msHardCopyCheckboxes];
                                      updated[i] = e.target.checked;
                                      setMsHardCopyCheckboxes(updated);
                                    }}
                                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-xs text-gray-600">{i + 1}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={msHardCopyIssued}
                                onChange={(e) => setMsHardCopyIssued(e.target.checked)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700 font-medium">Issued</span>
                            </label>
                            {msHardCopyIssued && (
                              <input
                                type="text"
                                value={msHardCopyCourierDocket}
                                onChange={(e) => setMsHardCopyCourierDocket(e.target.value)}
                                placeholder="Courier-Docket No."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                          </div>
                        </>
                      )}

                      {field.key === 'ms_hard_copy_courier_status' && statusData[field.key] === 'Sent' && (
                        <div className="mt-3 space-y-2 pl-2 border-l-2 border-blue-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Semesters (1-8)</p>
                          <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 8 }, (_, i) => (
                              <label key={i} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={msHardCopyCourierCheckboxes[i]}
                                  onChange={(e) => {
                                    const updated = [...msHardCopyCourierCheckboxes];
                                    updated[i] = e.target.checked;
                                    setMsHardCopyCourierCheckboxes(updated);
                                  }}
                                  className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-600">{i + 1}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {field.key === 'provisional_degree_status' && statusData[field.key] === 'Received' && (
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={provisionalDegreeIssued}
                              onChange={(e) => setProvisionalDegreeIssued(e.target.checked)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">Issued</span>
                          </label>
                          {provisionalDegreeIssued && (
                            <input
                              type="text"
                              value={provisionalDegreeCourierDocket}
                              onChange={(e) => setProvisionalDegreeCourierDocket(e.target.value)}
                              placeholder="Courier-Docket No."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      )}

                      {field.key === 'degree_status' && statusData[field.key] === 'Received' && (
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={degreeIssued}
                              onChange={(e) => setDegreeIssued(e.target.checked)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">Issued</span>
                          </label>
                          {degreeIssued && (
                            <input
                              type="text"
                              value={degreeCourierDocket}
                              onChange={(e) => setDegreeCourierDocket(e.target.value)}
                              placeholder="Courier-Docket No."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      )}

                      {field.key === 'university_phd_offer_letter_status' && statusData[field.key] === 'Received' && (
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={universityPhdOfferLetterIssued}
                              onChange={(e) => setUniversityPhdOfferLetterIssued(e.target.checked)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">Issued</span>
                          </label>
                          {universityPhdOfferLetterIssued && (
                            <input
                              type="text"
                              value={universityPhdOfferLetterCourierDocket}
                              onChange={(e) => setUniversityPhdOfferLetterCourierDocket(e.target.value)}
                              placeholder="Courier-Docket No."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      )}

                      {field.key === 'enrolment_no_status' && statusData[field.key] === 'Received' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={enrolmentNoValue}
                            onChange={(e) => setEnrolmentNoValue(e.target.value)}
                            placeholder="Enter Enrolment No."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}

                      {field.key === 'lor_status' && statusData[field.key] === 'Received' && (
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lorIssued}
                              onChange={(e) => setLorIssued(e.target.checked)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">Issued</span>
                          </label>
                          {lorIssued && (
                            <input
                              type="text"
                              value={lorCourierDocket}
                              onChange={(e) => setLorCourierDocket(e.target.value)}
                              placeholder="Courier-Docket No."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      )}

                      {field.key === 'recommendation_letter_status' && statusData[field.key] === 'Received' && (
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={recommendationLetterIssued}
                              onChange={(e) => setRecommendationLetterIssued(e.target.checked)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">Issued</span>
                          </label>
                          {recommendationLetterIssued && (
                            <input
                              type="text"
                              value={recommendationLetterCourierDocket}
                              onChange={(e) => setRecommendationLetterCourierDocket(e.target.value)}
                              placeholder="Courier-Docket No."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      )}

                      {field.key === 'wes_status' && statusData[field.key] === 'Received' && (
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={wesIssued}
                              onChange={(e) => setWesIssued(e.target.checked)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">Issued</span>
                          </label>
                          {wesIssued && (
                            <input
                              type="text"
                              value={wesCourierDocket}
                              onChange={(e) => setWesCourierDocket(e.target.value)}
                              placeholder="Courier-Docket No."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <ClipboardCheck className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Status'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
