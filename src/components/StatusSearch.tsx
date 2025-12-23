import { useState, useEffect } from 'react';
import { Search, Filter, User, Calendar, Phone, Mail, X, FileText, Briefcase, BookOpen, MapPin, DollarSign, Award, GraduationCap, Trash2, AlertTriangle, ClipboardCheck, CheckCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  status: string;
  created_at: string;
  created_by?: string;
  source?: string;
  city?: string;
  date_of_birth?: string;
  notes?: string;
}

interface Enquiry {
  id: string;
  contact_id: string;
  subject: string;
  message: string;
  enquiry_type: string;
  priority: string;
  status: string;
  created_at: string;
  created_by?: string;
  annual_salary?: number;
  job_title?: string;
  date_of_application?: string;
  current_location?: string;
  preferred_locations?: string[];
  total_experience?: string;
  current_company_name?: string;
  current_company_designation?: string;
  department?: string;
  role?: string;
  industry?: string;
  key_skills?: string[];
  notice_period?: string;
  resume_headline?: string;
  summary?: string;
  ug_degree?: string;
  ug_specialization?: string;
  ug_institute?: string;
  ug_graduation_year?: number;
  pg_degree?: string;
  pg_specialization?: string;
  pg_institute?: string;
  pg_graduation_year?: number;
  doctorate_degree?: string;
  doctorate_specialization?: string;
  doctorate_institute?: string;
  doctorate_graduation_year?: number;
  gender?: string;
  marital_status?: string;
  hometown?: string;
  pin_code?: string;
  work_permit_usa?: boolean;
  permanent_address?: string;
  phd_regular_while_working?: string;
  receive_call_related?: string;
  phd_area_of_interest?: string;
  looking_for?: string;
  attend_phd_webinar?: string;
}

interface Appointment {
  id: string;
  contact_id: string;
  appointment_date: string;
  title: string;
  description?: string;
  appointment_type?: string;
  status: string;
  location?: string;
  duration_minutes?: number;
  created_at: string;
  created_by?: string;
}

interface Admission {
  id: string;
  contact_id: string;
  program: string;
  specialisation?: string;
  status: string;
  qualification?: string;
  experience_years?: number;
  previous_institution?: string;
  documents_submitted?: boolean;
  payment_status?: string;
  amount?: number;
  amount_paid?: number;
  notes?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

interface StudentStatus {
  id: string;
  admission_id: string;
  contact_id: string;
  program: string;
  specialisation?: string;
  courseware_exam_status?: string;
  degree_status?: string;
  enrolment_no_status?: string;
  exam_status?: string;
  lor_status?: string;
  ms_hard_copy_status?: string;
  ms_hard_copy_courier_status?: string;
  ms_scan_status?: string;
  provisional_degree_status?: string;
  provisional_degree_courier_status?: string;
  recommendation_letter_status?: string;
  result_status?: string;
  roll_no_status?: string;
  university_phd_offer_letter_status?: string;
  university_visit_status?: string;
  university_visit1_status?: string;
  university_visit2_status?: string;
  university_visit3_status?: string;
  viva_status?: string;
  wes_status?: string;
  roll_no_values?: string[];
  roll_no_checkboxes?: boolean[];
  ms_scan_checkboxes?: boolean[];
  ms_hard_copy_checkboxes?: boolean[];
  ms_hard_copy_courier_checkboxes?: boolean[];
  provisional_degree_issued?: boolean;
  degree_issued?: boolean;
  university_phd_offer_letter_issued?: boolean;
  enrolment_no_value?: string;
  provisional_degree_courier_docket?: string;
  degree_courier_docket?: string;
  university_phd_offer_letter_courier_docket?: string;
  lor_issued?: boolean;
  lor_courier_docket?: string;
  recommendation_letter_issued?: boolean;
  recommendation_letter_courier_docket?: string;
  wes_issued?: boolean;
  wes_courier_docket?: string;
  ms_scan_issued?: boolean;
  ms_scan_courier_docket?: string;
  ms_hard_copy_issued?: boolean;
  ms_hard_copy_courier_docket?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

interface Payment {
  id: string;
  admission_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  transaction_number?: string;
  receipt_file_url?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface ContactReport {
  contact: Contact;
  enquiries: Enquiry[];
  appointments: Appointment[];
  admissions: Admission[];
  studentStatuses: StudentStatus[];
  payments: Payment[];
}

export function StatusSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [studentStatuses, setStudentStatuses] = useState<StudentStatus[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedEnquiries, setSelectedEnquiries] = useState<Set<string>>(new Set());
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set());
  const [selectedAdmissions, setSelectedAdmissions] = useState<Set<string>>(new Set());
  const [selectedStudentStatuses, setSelectedStudentStatuses] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; ids: string[] } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [contactsResult, enquiriesResult, appointmentsResult, admissionsResult, studentStatusResult, paymentsResult, profilesResult] = await Promise.all([
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').order('created_at', { ascending: false }),
        supabase.from('admissions').select('*').order('created_at', { ascending: false }),
        supabase.from('student_status').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('payment_date', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email, role')
      ]);

      if (contactsResult.error) {
        console.error('Error fetching contacts:', contactsResult.error);
      } else if (contactsResult.data) {
        setContacts(contactsResult.data);
      }

      if (enquiriesResult.error) {
        console.error('Error fetching enquiries:', enquiriesResult.error);
      } else if (enquiriesResult.data) {
        setEnquiries(enquiriesResult.data);
      }

      if (appointmentsResult.error) {
        console.error('Error fetching appointments:', appointmentsResult.error);
      } else if (appointmentsResult.data) {
        setAppointments(appointmentsResult.data);
      }

      if (admissionsResult.error) {
        console.error('Error fetching admissions:', admissionsResult.error);
      } else if (admissionsResult.data) {
        setAdmissions(admissionsResult.data);
      }

      if (studentStatusResult.error) {
        console.error('Error fetching student statuses:', studentStatusResult.error);
      } else if (studentStatusResult.data) {
        setStudentStatuses(studentStatusResult.data);
      }

      if (paymentsResult.error) {
        console.error('Error fetching payments:', paymentsResult.error);
      } else if (paymentsResult.data) {
        setPayments(paymentsResult.data);
      }

      if (profilesResult.error) {
        console.error('Error fetching profiles:', profilesResult.error);
      } else if (profilesResult.data) {
        setProfiles(profilesResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getCreatorName = (createdBy?: string): string => {
    if (!createdBy) return 'Unknown';
    const profile = profiles.find(p => p.id === createdBy);
    return profile ? profile.full_name : 'Unknown';
  };

  const toggleSelection = (type: 'enquiry' | 'appointment' | 'admission' | 'studentStatus', id: string) => {
    if (type === 'enquiry') {
      const newSet = new Set(selectedEnquiries);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedEnquiries(newSet);
    } else if (type === 'appointment') {
      const newSet = new Set(selectedAppointments);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedAppointments(newSet);
    } else if (type === 'admission') {
      const newSet = new Set(selectedAdmissions);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedAdmissions(newSet);
    } else if (type === 'studentStatus') {
      const newSet = new Set(selectedStudentStatuses);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedStudentStatuses(newSet);
    }
  };

  const selectAllForContact = (report: ContactReport, type: 'enquiry' | 'appointment' | 'admission' | 'studentStatus') => {
    if (type === 'enquiry') {
      const newSet = new Set(selectedEnquiries);
      report.enquiries.forEach(e => newSet.add(e.id));
      setSelectedEnquiries(newSet);
    } else if (type === 'appointment') {
      const newSet = new Set(selectedAppointments);
      report.appointments.forEach(a => newSet.add(a.id));
      setSelectedAppointments(newSet);
    } else if (type === 'admission') {
      const newSet = new Set(selectedAdmissions);
      report.admissions.forEach(a => newSet.add(a.id));
      setSelectedAdmissions(newSet);
    } else if (type === 'studentStatus') {
      const newSet = new Set(selectedStudentStatuses);
      report.studentStatuses.forEach(s => newSet.add(s.id));
      setSelectedStudentStatuses(newSet);
    }
  };

  const confirmDelete = (type: string, ids: string[]) => {
    setDeleteConfirm({ type, ids });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const { type, ids } = deleteConfirm;
      let table = '';

      if (type === 'enquiry' || type === 'enquiries') {
        table = 'enquiries';
      } else if (type === 'appointment' || type === 'appointments') {
        table = 'appointments';
      } else if (type === 'admission' || type === 'admissions') {
        table = 'admissions';
      } else if (type === 'studentStatus' || type === 'student_status') {
        table = 'student_status';
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids);

      if (error) throw error;

      if (type === 'enquiry' || type === 'enquiries') {
        setEnquiries(prev => prev.filter(e => !ids.includes(e.id)));
        setSelectedEnquiries(new Set());
      } else if (type === 'appointment' || type === 'appointments') {
        setAppointments(prev => prev.filter(a => !ids.includes(a.id)));
        setSelectedAppointments(new Set());
      } else if (type === 'admission' || type === 'admissions') {
        setAdmissions(prev => prev.filter(a => !ids.includes(a.id)));
        setSelectedAdmissions(new Set());
      } else if (type === 'studentStatus' || type === 'student_status') {
        setStudentStatuses(prev => prev.filter(s => !ids.includes(s.id)));
        setSelectedStudentStatuses(new Set());
      }

      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting entries:', error);
      alert('Failed to delete entries. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const generateReports = (): ContactReport[] => {
    return contacts.map(contact => {
      const contactAdmissions = admissions.filter(a => a.contact_id === contact.id);
      const admissionIds = contactAdmissions.map(a => a.id);
      return {
        contact,
        enquiries: enquiries.filter(e => e.contact_id === contact.id),
        appointments: appointments.filter(a => a.contact_id === contact.id),
        admissions: contactAdmissions,
        studentStatuses: studentStatuses.filter(s => s.contact_id === contact.id),
        payments: payments.filter(p => admissionIds.includes(p.admission_id))
      };
    }).filter(report => {
      const contact = report.contact;
      const matchesSearch = searchTerm === '' ||
        contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm) ||
        report.enquiries.some(e =>
          e.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.enquiry_type?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        report.admissions.some(a =>
          a.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.specialisation?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus = statusFilter === 'all' ||
        contact.status === statusFilter ||
        report.enquiries.some(e => e.status === statusFilter) ||
        report.appointments.some(a => a.status === statusFilter) ||
        report.admissions.some(a => a.status === statusFilter);

      const hasData = report.enquiries.length > 0 || report.appointments.length > 0 || report.admissions.length > 0 || report.studentStatuses.length > 0;

      return matchesSearch && matchesStatus && hasData;
    });
  };

  const reports = generateReports();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comprehensive Status Report</h2>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, subject, job title..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <X className="w-4 h-4" /> : null}
            </button>

            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Found: {reports.length} contacts with data
        </div>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.contact.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Personal Information Section - Shown Once */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 rounded-full p-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {report.contact.first_name} {report.contact.last_name}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadgeColor(report.contact.status)}`}>
                        {report.contact.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Registered: {new Date(report.contact.created_at).toLocaleDateString()}
                    </div>
                    {report.contact.created_by && (
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        Created by: {getCreatorName(report.contact.created_by)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {report.contact.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Email:</span> {report.contact.email}
                    </div>
                  )}
                  {report.contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Phone:</span> {report.contact.phone}
                    </div>
                  )}
                  {report.contact.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">DOB:</span> {new Date(report.contact.date_of_birth).toLocaleDateString()}
                    </div>
                  )}
                  {report.contact.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">City:</span> {report.contact.city}
                    </div>
                  )}
                  {report.contact.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Company:</span> {report.contact.company}
                    </div>
                  )}
                  {report.contact.source && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Source:</span> {report.contact.source}
                    </div>
                  )}
                </div>

                {report.contact.notes && (
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Notes:</span>
                    <p className="text-sm text-gray-600 mt-1">{report.contact.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Enquiries Section */}
                {report.enquiries.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Enquiry Forms ({report.enquiries.length})
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllForContact(report, 'enquiry')}
                          className="text-sm px-3 py-1 text-green-700 bg-green-50 hover:bg-green-100 rounded transition"
                        >
                          Select All
                        </button>
                        {report.enquiries.filter(e => selectedEnquiries.has(e.id)).length > 0 && (
                          <button
                            onClick={() => confirmDelete('enquiries', report.enquiries.filter(e => selectedEnquiries.has(e.id)).map(e => e.id))}
                            className="text-sm px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Selected ({report.enquiries.filter(e => selectedEnquiries.has(e.id)).length})
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg bg-gray-50">
                      {report.enquiries.map((enquiry, idx) => (
                        <div key={enquiry.id} className={`p-4 ${idx > 0 ? 'border-t border-gray-300' : ''}`}>
                          <div className="flex gap-3">
                            <input
                              type="checkbox"
                              checked={selectedEnquiries.has(enquiry.id)}
                              onChange={() => toggleSelection('enquiry', enquiry.id)}
                              className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500 flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(enquiry.status)}`}>
                                  {enquiry.status}
                                </span>
                                <div className="text-right">
                                  <div className="text-xs text-gray-500">
                                    {new Date(enquiry.created_at).toLocaleDateString()} {new Date(enquiry.created_at).toLocaleTimeString()}
                                  </div>
                                  <div className="text-xs text-green-600 font-medium">
                                    {getCreatorName(enquiry.created_by)}
                                  </div>
                                </div>
                              </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Basic Details */}
                            {enquiry.subject && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Subject:</span>
                                <p className="text-gray-600 mt-1">{enquiry.subject}</p>
                              </div>
                            )}
                            {enquiry.enquiry_type && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Type:</span>
                                <p className="text-gray-600 mt-1 capitalize">{enquiry.enquiry_type}</p>
                              </div>
                            )}
                            {enquiry.priority && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Priority:</span>
                                <p className="text-gray-600 mt-1 capitalize">{enquiry.priority}</p>
                              </div>
                            )}
                            {enquiry.date_of_application && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Application Date:</span>
                                <p className="text-gray-600 mt-1">{new Date(enquiry.date_of_application).toLocaleDateString()}</p>
                              </div>
                            )}

                            {/* Professional Details */}
                            {enquiry.job_title && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Job Title:</span>
                                <p className="text-gray-600 mt-1">{enquiry.job_title}</p>
                              </div>
                            )}
                            {enquiry.current_company_name && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Current Company:</span>
                                <p className="text-gray-600 mt-1">{enquiry.current_company_name}</p>
                              </div>
                            )}
                            {enquiry.current_company_designation && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Designation:</span>
                                <p className="text-gray-600 mt-1">{enquiry.current_company_designation}</p>
                              </div>
                            )}
                            {enquiry.department && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Department:</span>
                                <p className="text-gray-600 mt-1">{enquiry.department}</p>
                              </div>
                            )}
                            {enquiry.role && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Role:</span>
                                <p className="text-gray-600 mt-1">{enquiry.role}</p>
                              </div>
                            )}
                            {enquiry.industry && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Industry:</span>
                                <p className="text-gray-600 mt-1">{enquiry.industry}</p>
                              </div>
                            )}
                            {enquiry.total_experience && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Experience:</span>
                                <p className="text-gray-600 mt-1">{enquiry.total_experience}</p>
                              </div>
                            )}
                            {enquiry.annual_salary && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Annual Salary:</span>
                                <p className="text-gray-600 mt-1 flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ₹{enquiry.annual_salary.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {enquiry.notice_period && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Notice Period:</span>
                                <p className="text-gray-600 mt-1">{enquiry.notice_period}</p>
                              </div>
                            )}

                            {/* Location Details */}
                            {enquiry.current_location && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Current Location:</span>
                                <p className="text-gray-600 mt-1">{enquiry.current_location}</p>
                              </div>
                            )}
                            {enquiry.hometown && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Hometown:</span>
                                <p className="text-gray-600 mt-1">{enquiry.hometown}</p>
                              </div>
                            )}
                            {enquiry.pin_code && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Pin Code:</span>
                                <p className="text-gray-600 mt-1">{enquiry.pin_code}</p>
                              </div>
                            )}

                            {/* Personal Details */}
                            {enquiry.gender && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Gender:</span>
                                <p className="text-gray-600 mt-1 capitalize">{enquiry.gender}</p>
                              </div>
                            )}
                            {enquiry.marital_status && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Marital Status:</span>
                                <p className="text-gray-600 mt-1 capitalize">{enquiry.marital_status}</p>
                              </div>
                            )}
                            {enquiry.work_permit_usa !== null && enquiry.work_permit_usa !== undefined && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">US Work Permit:</span>
                                <p className="text-gray-600 mt-1">{enquiry.work_permit_usa ? 'Yes' : 'No'}</p>
                              </div>
                            )}
                          </div>

                          {/* Education Details */}
                          {(enquiry.ug_degree || enquiry.pg_degree || enquiry.doctorate_degree) && (
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-600" />
                                Education
                              </h5>
                              <div className="space-y-3">
                                {enquiry.ug_degree && (
                                  <div className="text-sm bg-white p-3 rounded">
                                    <span className="font-semibold text-gray-700">UG:</span>
                                    <p className="text-gray-600 mt-1">
                                      {enquiry.ug_degree}
                                      {enquiry.ug_specialization && ` - ${enquiry.ug_specialization}`}
                                      {enquiry.ug_institute && ` | ${enquiry.ug_institute}`}
                                      {enquiry.ug_graduation_year && ` (${enquiry.ug_graduation_year})`}
                                    </p>
                                  </div>
                                )}
                                {enquiry.pg_degree && (
                                  <div className="text-sm bg-white p-3 rounded">
                                    <span className="font-semibold text-gray-700">PG:</span>
                                    <p className="text-gray-600 mt-1">
                                      {enquiry.pg_degree}
                                      {enquiry.pg_specialization && ` - ${enquiry.pg_specialization}`}
                                      {enquiry.pg_institute && ` | ${enquiry.pg_institute}`}
                                      {enquiry.pg_graduation_year && ` (${enquiry.pg_graduation_year})`}
                                    </p>
                                  </div>
                                )}
                                {enquiry.doctorate_degree && (
                                  <div className="text-sm bg-white p-3 rounded">
                                    <span className="font-semibold text-gray-700">Doctorate:</span>
                                    <p className="text-gray-600 mt-1">
                                      {enquiry.doctorate_degree}
                                      {enquiry.doctorate_specialization && ` - ${enquiry.doctorate_specialization}`}
                                      {enquiry.doctorate_institute && ` | ${enquiry.doctorate_institute}`}
                                      {enquiry.doctorate_graduation_year && ` (${enquiry.doctorate_graduation_year})`}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Arrays and Lists */}
                          {enquiry.key_skills && enquiry.key_skills.length > 0 && (
                            <div className="mt-4 text-sm">
                              <span className="font-semibold text-gray-700">Key Skills:</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {enquiry.key_skills.map((skill, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {enquiry.preferred_locations && enquiry.preferred_locations.length > 0 && (
                            <div className="mt-4 text-sm">
                              <span className="font-semibold text-gray-700">Preferred Locations:</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {enquiry.preferred_locations.map((location, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                    {location}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Long Text Fields */}
                          {enquiry.resume_headline && (
                            <div className="mt-4 text-sm">
                              <span className="font-semibold text-gray-700">Resume Headline:</span>
                              <p className="text-gray-600 mt-1 bg-white p-3 rounded">{enquiry.resume_headline}</p>
                            </div>
                          )}
                          {enquiry.summary && (
                            <div className="mt-4 text-sm">
                              <span className="font-semibold text-gray-700">Summary:</span>
                              <p className="text-gray-600 mt-1 bg-white p-3 rounded">{enquiry.summary}</p>
                            </div>
                          )}
                          {enquiry.message && (
                            <div className="mt-4 text-sm">
                              <span className="font-semibold text-gray-700">Message:</span>
                              <p className="text-gray-600 mt-1 bg-white p-3 rounded">{enquiry.message}</p>
                            </div>
                          )}
                          {enquiry.permanent_address && (
                            <div className="mt-4 text-sm">
                              <span className="font-semibold text-gray-700">Permanent Address:</span>
                              <p className="text-gray-600 mt-1 bg-white p-3 rounded">{enquiry.permanent_address}</p>
                            </div>
                          )}

                          {/* PhD Related Fields */}
                          {(enquiry.phd_regular_while_working || enquiry.phd_area_of_interest || enquiry.looking_for || enquiry.attend_phd_webinar) && (
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-purple-600" />
                                PhD Information
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {enquiry.phd_regular_while_working && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">PhD Regular While Working:</span>
                                    <p className="text-gray-600 mt-1">{enquiry.phd_regular_while_working}</p>
                                  </div>
                                )}
                                {enquiry.phd_area_of_interest && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">Area of Interest:</span>
                                    <p className="text-gray-600 mt-1">{enquiry.phd_area_of_interest}</p>
                                  </div>
                                )}
                                {enquiry.looking_for && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">Looking For:</span>
                                    <p className="text-gray-600 mt-1">{enquiry.looking_for}</p>
                                  </div>
                                )}
                                {enquiry.attend_phd_webinar && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">Attend PhD Webinar:</span>
                                    <p className="text-gray-600 mt-1">{enquiry.attend_phd_webinar}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appointments Section */}
                {report.appointments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Appointments ({report.appointments.length})
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllForContact(report, 'appointment')}
                          className="text-sm px-3 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition"
                        >
                          Select All
                        </button>
                        {report.appointments.filter(a => selectedAppointments.has(a.id)).length > 0 && (
                          <button
                            onClick={() => confirmDelete('appointments', report.appointments.filter(a => selectedAppointments.has(a.id)).map(a => a.id))}
                            className="text-sm px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Selected ({report.appointments.filter(a => selectedAppointments.has(a.id)).length})
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg bg-blue-50">
                      {report.appointments.map((appointment, idx) => (
                        <div key={appointment.id} className={`p-4 ${idx > 0 ? 'border-t border-gray-300' : ''}`}>
                          <div className="flex gap-3">
                            <input
                              type="checkbox"
                              checked={selectedAppointments.has(appointment.id)}
                              onChange={() => toggleSelection('appointment', appointment.id)}
                              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                            />
                            <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                Created: {new Date(appointment.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                {getCreatorName(appointment.created_by)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Title:</span>
                              <p className="text-gray-600 mt-1">{appointment.title}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Date & Time:</span>
                              <p className="text-gray-600 mt-1">
                                {new Date(appointment.appointment_date).toLocaleDateString()} at {new Date(appointment.appointment_date).toLocaleTimeString()}
                              </p>
                            </div>
                            {appointment.appointment_type && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Type:</span>
                                <p className="text-gray-600 mt-1 capitalize">{appointment.appointment_type}</p>
                              </div>
                            )}
                            {appointment.duration_minutes && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Duration:</span>
                                <p className="text-gray-600 mt-1">{appointment.duration_minutes} minutes</p>
                              </div>
                            )}
                            {appointment.location && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Location:</span>
                                <p className="text-gray-600 mt-1">{appointment.location}</p>
                              </div>
                            )}
                          </div>

                          {appointment.description && (
                            <div className="mt-4 text-sm">
                              <span className="font-semibold text-gray-700">Description:</span>
                              <p className="text-gray-600 mt-1 bg-white p-3 rounded">{appointment.description}</p>
                            </div>
                          )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admissions & University Status Section */}
                {report.admissions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                        Fee Status ({report.admissions.length})
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllForContact(report, 'admission')}
                          className="text-sm px-3 py-1 text-orange-700 bg-orange-50 hover:bg-orange-100 rounded transition"
                        >
                          Select All
                        </button>
                        {report.admissions.filter(a => selectedAdmissions.has(a.id)).length > 0 && (
                          <button
                            onClick={() => confirmDelete('admissions', report.admissions.filter(a => selectedAdmissions.has(a.id)).map(a => a.id))}
                            className="text-sm px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Selected ({report.admissions.filter(a => selectedAdmissions.has(a.id)).length})
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg bg-orange-50">
                      {report.admissions.map((admission, idx) => {
                        const relatedStatus = report.studentStatuses.find(s => s.admission_id === admission.id);
                        return (
                        <div key={admission.id} className={`p-4 ${idx > 0 ? 'border-t border-gray-300' : ''}`}>
                          <div className="flex gap-3">
                            <input
                              type="checkbox"
                              checked={selectedAdmissions.has(admission.id)}
                              onChange={() => toggleSelection('admission', admission.id)}
                              className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500 flex-shrink-0"
                            />
                            <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(admission.status)}`}>
                              {admission.status}
                            </span>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                Created: {new Date(admission.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-orange-600 font-medium">
                                {getCreatorName(admission.created_by)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-sm">
                                  <span className="font-semibold text-gray-700">Program:</span>
                                  <p className="text-gray-600 mt-1 font-medium">{admission.program}</p>
                                </div>
                                {admission.amount && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">Total Amount:</span>
                                    <p className="text-gray-600 mt-1">₹{admission.amount.toLocaleString()}</p>
                                  </div>
                                )}
                                {admission.previous_institution && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">Previous Institution:</span>
                                    <p className="text-gray-600 mt-1">{admission.previous_institution}</p>
                                  </div>
                                )}
                                {admission.specialisation && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">Specialisation:</span>
                                    <p className="text-gray-600 mt-1">{admission.specialisation}</p>
                                  </div>
                                )}
                                {admission.amount_paid && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">Amount Paid:</span>
                                    <p className="text-gray-600 mt-1">₹{admission.amount_paid.toLocaleString()}</p>
                                  </div>
                                )}
                                {admission.payment_status && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">Payment Status:</span>
                                    <p className="text-gray-600 mt-1 capitalize">{admission.payment_status}</p>
                                  </div>
                                )}
                                {admission.amount && admission.amount_paid !== null && admission.amount_paid !== undefined && (
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">Balance Fee:</span>
                                    <p className="text-gray-600 mt-1 font-bold text-orange-700">₹{(admission.amount - admission.amount_paid).toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="lg:col-span-1">
                              <div className="bg-white rounded-lg p-3 border border-orange-200 h-full">
                                <h5 className="font-semibold text-gray-900 mb-3 text-sm">Payment History</h5>
                                {(() => {
                                  const admissionPayments = report.payments.filter(p => p.admission_id === admission.id);
                                  if (admissionPayments.length === 0) {
                                    return <p className="text-xs text-gray-500">No payments recorded</p>;
                                  }
                                  return (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {admissionPayments.map((payment) => (
                                        <div key={payment.id} className="text-xs bg-orange-50 p-2 rounded border border-orange-100">
                                          <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-orange-900">₹{payment.amount.toLocaleString()}</span>
                                            <span className="text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</span>
                                          </div>
                                          <div className="text-gray-600 capitalize">{payment.payment_mode}</div>
                                          {payment.transaction_number && (
                                            <div className="text-gray-500 truncate">Txn: {payment.transaction_number}</div>
                                          )}
                                          {payment.created_by && (
                                            <div className="text-orange-600 font-medium mt-1">
                                              {getCreatorName(payment.created_by)}
                                            </div>
                                          )}
                                          {payment.notes && (
                                            <div className="text-gray-600 mt-1 text-xs">{payment.notes}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          {admission.qualification && (
                            <div className="mt-4 text-sm">
                              <span className="font-semibold text-gray-700">Qualification:</span>
                              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                {admission.qualification}
                              </span>
                            </div>
                          )}

                          {admission.notes && (
                            <div className="mt-4 text-sm">
                              <span className="font-semibold text-gray-700">Admission Notes:</span>
                              <p className="text-gray-600 mt-1 bg-white p-3 rounded">{admission.notes}</p>
                            </div>
                          )}
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                )}

                {/* Student Status Section */}
                {report.studentStatuses.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                        Student Status ({report.studentStatuses.length})
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllForContact(report, 'studentStatus')}
                          className="text-sm px-3 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition"
                        >
                          Select All
                        </button>
                        {report.studentStatuses.filter(s => selectedStudentStatuses.has(s.id)).length > 0 && (
                          <button
                            onClick={() => confirmDelete('student_status', report.studentStatuses.filter(s => selectedStudentStatuses.has(s.id)).map(s => s.id))}
                            className="text-sm px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Selected ({report.studentStatuses.filter(s => selectedStudentStatuses.has(s.id)).length})
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg bg-indigo-50">
                      {report.studentStatuses.map((status, idx) => (
                        <div key={status.id} className={`p-4 ${idx > 0 ? 'border-t border-gray-300' : ''}`}>
                          <div className="flex gap-3">
                            <input
                              type="checkbox"
                              checked={selectedStudentStatuses.has(status.id)}
                              onChange={() => toggleSelection('studentStatus', status.id)}
                              className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h5 className="font-bold text-gray-900">{status.program}</h5>
                                  {status.specialisation && (
                                    <p className="text-sm text-gray-600 mt-1">{status.specialisation}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-500">
                                    Created: {new Date(status.created_at).toLocaleDateString()}
                                  </div>
                                  {status.created_by && (
                                    <div className="text-xs text-indigo-600 font-medium mt-1">
                                      {getCreatorName(status.created_by)}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Enrolment Number Value */}
                              {status.enrolment_no_value && (
                                <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                                  <span className="font-semibold text-gray-700">Enrolment Number:</span>
                                  <p className="text-gray-900 mt-1 font-mono">{status.enrolment_no_value}</p>
                                </div>
                              )}

                              {/* Roll Number Values */}
                              {status.roll_no_values && status.roll_no_values.some(v => v) && (
                                <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                                  <span className="font-semibold text-gray-700 block mb-2">Roll Numbers:</span>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {status.roll_no_values.map((value, idx) => value && (
                                      <div key={idx} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Sem {idx + 1}:</span>
                                        <span className="text-sm font-mono text-gray-900">{value}</span>
                                        {status.roll_no_checkboxes?.[idx] && (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Issued Documents Section */}
                              {(status.provisional_degree_issued || status.degree_issued || status.university_phd_offer_letter_issued ||
                                status.lor_issued || status.recommendation_letter_issued || status.wes_issued ||
                                status.ms_scan_issued || status.ms_hard_copy_issued) && (
                                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                                  <span className="font-semibold text-gray-900 block mb-3">Issued Documents:</span>
                                  <div className="space-y-2">
                                    {status.provisional_degree_issued && (
                                      <div className="flex items-center justify-between bg-white p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-gray-700">Provisional Degree Issued</span>
                                        </div>
                                        {status.provisional_degree_courier_docket && (
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            Docket: {status.provisional_degree_courier_docket}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {status.degree_issued && (
                                      <div className="flex items-center justify-between bg-white p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-gray-700">Degree Issued</span>
                                        </div>
                                        {status.degree_courier_docket && (
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            Docket: {status.degree_courier_docket}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {status.university_phd_offer_letter_issued && (
                                      <div className="flex items-center justify-between bg-white p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-gray-700">University PhD Offer Letter Issued</span>
                                        </div>
                                        {status.university_phd_offer_letter_courier_docket && (
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            Docket: {status.university_phd_offer_letter_courier_docket}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {status.lor_issued && (
                                      <div className="flex items-center justify-between bg-white p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-gray-700">LOR Issued</span>
                                        </div>
                                        {status.lor_courier_docket && (
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            Docket: {status.lor_courier_docket}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {status.recommendation_letter_issued && (
                                      <div className="flex items-center justify-between bg-white p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-gray-700">Recommendation Letter Issued</span>
                                        </div>
                                        {status.recommendation_letter_courier_docket && (
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            Docket: {status.recommendation_letter_courier_docket}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {status.wes_issued && (
                                      <div className="flex items-center justify-between bg-white p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-gray-700">WES Issued</span>
                                        </div>
                                        {status.wes_courier_docket && (
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            Docket: {status.wes_courier_docket}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {status.ms_scan_issued && (
                                      <div className="flex items-center justify-between bg-white p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-gray-700">MS SCAN Issued</span>
                                        </div>
                                        {status.ms_scan_courier_docket && (
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            Docket: {status.ms_scan_courier_docket}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {status.ms_hard_copy_issued && (
                                      <div className="flex items-center justify-between bg-white p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-gray-700">MS Hard Copy Issued</span>
                                        </div>
                                        {status.ms_hard_copy_courier_docket && (
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            Docket: {status.ms_hard_copy_courier_docket}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Semester-wise Document Tracking */}
                              {(status.ms_scan_checkboxes?.some(v => v) || status.ms_hard_copy_checkboxes?.some(v => v) ||
                                status.ms_hard_copy_courier_checkboxes?.some(v => v)) && (
                                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                                  <span className="font-semibold text-gray-900 block mb-3">Semester-wise Document Status:</span>
                                  <div className="space-y-3">
                                    {status.ms_scan_checkboxes?.some(v => v) && (
                                      <div className="bg-white p-2 rounded">
                                        <span className="text-sm font-medium text-gray-700 block mb-2">MS SCAN:</span>
                                        <div className="flex flex-wrap gap-2">
                                          {status.ms_scan_checkboxes.map((checked, idx) => checked && (
                                            <span key={idx} className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                              <CheckCircle className="w-3 h-3" />
                                              Semester {idx + 1}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {status.ms_hard_copy_checkboxes?.some(v => v) && (
                                      <div className="bg-white p-2 rounded">
                                        <span className="text-sm font-medium text-gray-700 block mb-2">MS Hard Copy:</span>
                                        <div className="flex flex-wrap gap-2">
                                          {status.ms_hard_copy_checkboxes.map((checked, idx) => checked && (
                                            <span key={idx} className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                              <CheckCircle className="w-3 h-3" />
                                              Semester {idx + 1}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {status.ms_hard_copy_courier_checkboxes?.some(v => v) && (
                                      <div className="bg-white p-2 rounded">
                                        <span className="text-sm font-medium text-gray-700 block mb-2">MS Hard Copy Courier:</span>
                                        <div className="flex flex-wrap gap-2">
                                          {status.ms_hard_copy_courier_checkboxes.map((checked, idx) => checked && (
                                            <span key={idx} className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                              <CheckCircle className="w-3 h-3" />
                                              Semester {idx + 1}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {status.notes && (
                                <div className="mt-4 text-sm">
                                  <span className="font-semibold text-gray-700">Notes:</span>
                                  <p className="text-gray-600 mt-1 bg-white p-3 rounded">{status.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {deleteConfirm && (
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
                onClick={() => setDeleteConfirm(null)}
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
      )}
    </div>
  );
}
