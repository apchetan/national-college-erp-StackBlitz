import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Truck, ArrowLeft, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { ContactSearch } from './ContactSearch';
import { sanitizeDateValue } from '../utils/dateValidation';
import { useNavigation } from '../App';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  city: string | null;
  company: string | null;
  source: string;
}

interface CourierEntry {
  id: string;
  created_at: string;
  updated_at: string;
  received_from_student_date: string | null;
  sent_to_student_date: string | null;
  received_by_student_date: string | null;
  received_from_university_date: string | null;
  sent_to_university_date: string | null;
  received_by_university_date: string | null;
}

export function CourierStatus() {
  const { setCurrentPage } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [previousEntries, setPreviousEntries] = useState<CourierEntry[]>([]);
  const [showPreviousEntries, setShowPreviousEntries] = useState(false);

  const [formData, setFormData] = useState({
    receivedFromStudentDocketNo: '',
    receivedFromStudentDate: '',
    sentToStudentDocketNo: '',
    sentToStudentDate: '',
    receivedByStudentDocketNo: '',
    receivedByStudentDate: '',
    receivedFromUniversityDocketNo: '',
    receivedFromUniversityDate: '',
    sentToUniversityDocketNo: '',
    sentToUniversityDate: '',
    receivedByUniversityDocketNo: '',
    receivedByUniversityDate: '',
  });

  useEffect(() => {
    if (selectedContact) {
      fetchPreviousEntries(selectedContact.id);
    } else {
      setPreviousEntries([]);
    }
  }, [selectedContact]);

  const fetchPreviousEntries = async (contactId: string) => {
    try {
      const { data, error } = await supabase
        .from('courier_status')
        .select('id, created_at, updated_at, received_from_student_date, sent_to_student_date, received_by_student_date, received_from_university_date, sent_to_university_date, received_by_university_date')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPreviousEntries(data || []);
    } catch (err) {
      console.error('Error fetching previous courier entries:', err);
      setPreviousEntries([]);
    }
  };

  const validateForm = (): string | null => {
    if (!selectedContact) {
      return 'Please select a student/contact';
    }

    const docketFields = [
      { value: formData.receivedFromStudentDocketNo, name: 'Received from Student Docket No' },
      { value: formData.sentToStudentDocketNo, name: 'Sent to Student Docket No' },
      { value: formData.receivedByStudentDocketNo, name: 'Received by Student Docket No' },
      { value: formData.receivedFromUniversityDocketNo, name: 'Received from University Docket No' },
      { value: formData.sentToUniversityDocketNo, name: 'Sent to University Docket No' },
      { value: formData.receivedByUniversityDocketNo, name: 'Received by University Docket No' },
    ];

    for (const field of docketFields) {
      if (field.value && field.value.length < 4) {
        return `${field.name} must be at least 4 characters`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const courierData = {
        contact_id: selectedContact!.id,
        received_from_student_docket_no: formData.receivedFromStudentDocketNo || null,
        received_from_student_date: sanitizeDateValue(formData.receivedFromStudentDate),
        sent_to_student_docket_no: formData.sentToStudentDocketNo || null,
        sent_to_student_date: sanitizeDateValue(formData.sentToStudentDate),
        received_by_student_docket_no: formData.receivedByStudentDocketNo || null,
        received_by_student_date: sanitizeDateValue(formData.receivedByStudentDate),
        received_from_university_docket_no: formData.receivedFromUniversityDocketNo || null,
        received_from_university_date: sanitizeDateValue(formData.receivedFromUniversityDate),
        sent_to_university_docket_no: formData.sentToUniversityDocketNo || null,
        sent_to_university_date: sanitizeDateValue(formData.sentToUniversityDate),
        received_by_university_docket_no: formData.receivedByUniversityDocketNo || null,
        received_by_university_date: sanitizeDateValue(formData.receivedByUniversityDate),
      };

      const { error: courierError } = await supabase
        .from('courier_status')
        .insert([courierData]);

      if (courierError) throw courierError;

      setSuccess(true);
      setFormData({
        receivedFromStudentDocketNo: '',
        receivedFromStudentDate: '',
        sentToStudentDocketNo: '',
        sentToStudentDate: '',
        receivedByStudentDocketNo: '',
        receivedByStudentDate: '',
        receivedFromUniversityDocketNo: '',
        receivedFromUniversityDate: '',
        sentToUniversityDocketNo: '',
        sentToUniversityDate: '',
        receivedByUniversityDocketNo: '',
        receivedByUniversityDate: '',
      });

      if (selectedContact) {
        fetchPreviousEntries(selectedContact.id);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalEntries = previousEntries.length;
  const earliestEntry = totalEntries > 0 ? previousEntries[totalEntries - 1]?.created_at : null;
  const latestEntry = totalEntries > 0 ? previousEntries[0]?.created_at : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Courier Status</h1>
                <p className="text-sm text-gray-600">Track courier and document delivery status</p>
              </div>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">Courier status saved successfully!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Personal Information
            </h2>

            <ContactSearch
              onSelectContact={setSelectedContact}
              selectedContact={selectedContact}
            />

            {selectedContact && totalEntries > 1 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowPreviousEntries(!showPreviousEntries)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-orange-900">Multiple entries</span>
                      <p className="text-sm text-orange-700 mt-1">
                        Count: {totalEntries} | Earlier: {formatDate(earliestEntry)} | Latest: {formatDate(latestEntry)}
                      </p>
                    </div>
                    <span className="text-orange-600">{showPreviousEntries ? '▼' : '▶'}</span>
                  </div>
                </button>

                {showPreviousEntries && (
                  <div className="mt-3 pt-3 border-t border-orange-300">
                    <h4 className="font-semibold text-orange-900 mb-2">Previous Entries ({totalEntries})</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {previousEntries.map((entry) => (
                        <div key={entry.id} className="bg-white p-3 rounded border border-orange-200">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-semibold text-gray-700">Entry Date:</span>
                              <p className="text-gray-600">{formatDate(entry.created_at)}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Updated:</span>
                              <p className="text-gray-600">{formatDate(entry.updated_at)}</p>
                            </div>
                            {entry.received_from_student_date && (
                              <div>
                                <span className="font-semibold text-gray-700">Received from Student:</span>
                                <p className="text-gray-600">{formatDate(entry.received_from_student_date)}</p>
                              </div>
                            )}
                            {entry.sent_to_student_date && (
                              <div>
                                <span className="font-semibold text-gray-700">Sent to Student:</span>
                                <p className="text-gray-600">{formatDate(entry.sent_to_student_date)}</p>
                              </div>
                            )}
                            {entry.sent_to_university_date && (
                              <div>
                                <span className="font-semibold text-gray-700">Sent to University:</span>
                                <p className="text-gray-600">{formatDate(entry.sent_to_university_date)}</p>
                              </div>
                            )}
                            {entry.received_by_university_date && (
                              <div>
                                <span className="font-semibold text-gray-700">Received by University:</span>
                                <p className="text-gray-600">{formatDate(entry.received_by_university_date)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">A) Received from Student</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Docket No.
                </label>
                <input
                  type="text"
                  value={formData.receivedFromStudentDocketNo}
                  onChange={(e) => setFormData({ ...formData, receivedFromStudentDocketNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter docket number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.receivedFromStudentDate}
                  onChange={(e) => setFormData({ ...formData, receivedFromStudentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">B) Sent to Student</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Docket No.
                </label>
                <input
                  type="text"
                  value={formData.sentToStudentDocketNo}
                  onChange={(e) => setFormData({ ...formData, sentToStudentDocketNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter docket number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.sentToStudentDate}
                  onChange={(e) => setFormData({ ...formData, sentToStudentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">C) Received by Student</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Docket No.
                </label>
                <input
                  type="text"
                  value={formData.receivedByStudentDocketNo}
                  onChange={(e) => setFormData({ ...formData, receivedByStudentDocketNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter docket number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.receivedByStudentDate}
                  onChange={(e) => setFormData({ ...formData, receivedByStudentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">D) Received from University</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Docket No.
                </label>
                <input
                  type="text"
                  value={formData.receivedFromUniversityDocketNo}
                  onChange={(e) => setFormData({ ...formData, receivedFromUniversityDocketNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter docket number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.receivedFromUniversityDate}
                  onChange={(e) => setFormData({ ...formData, receivedFromUniversityDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">E) Sent to University</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Docket No.
                </label>
                <input
                  type="text"
                  value={formData.sentToUniversityDocketNo}
                  onChange={(e) => setFormData({ ...formData, sentToUniversityDocketNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter docket number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.sentToUniversityDate}
                  onChange={(e) => setFormData({ ...formData, sentToUniversityDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">F) Received by University</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Docket No.
                </label>
                <input
                  type="text"
                  value={formData.receivedByUniversityDocketNo}
                  onChange={(e) => setFormData({ ...formData, receivedByUniversityDocketNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter docket number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.receivedByUniversityDate}
                  onChange={(e) => setFormData({ ...formData, receivedByUniversityDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Courier Status'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
