import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Contact, Enquiry, Appointment, Admission, StudentStatus, Payment, Profile, ContactReport } from '../types/interfaces';
import { useToast } from '../contexts/ToastContext';

export function useStatusData() {
  const { addToast } = useToast();
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
  const [refreshing, setRefreshing] = useState(false);
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

  async function fetchData(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
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
      setRefreshing(false);
    }
  }

  const handleRefresh = () => {
    fetchData(true);
  };

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
      addToast('Failed to delete entries. Please try again.', 'error');
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

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showFilters,
    setShowFilters,
    loading,
    refreshing,
    handleRefresh,
    selectedEnquiries,
    selectedAppointments,
    selectedAdmissions,
    selectedStudentStatuses,
    deleteConfirm,
    setDeleteConfirm,
    deleting,
    getCreatorName,
    toggleSelection,
    selectAllForContact,
    confirmDelete,
    handleDelete,
    generateReports
  };
}
