import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, MessageSquare, Calendar, GraduationCap, Activity, TrendingUp, Download, Trash2 } from 'lucide-react';
import type { Database } from '../types/database';
import { downloadEnquiryCSVTemplate } from '../utils/csvTemplate';
import { MasterSearch } from './MasterSearch';
import { formatDate, formatDateTime } from '../utils/formatting';

type Contact = Database['public']['Tables']['contacts']['Row'];
type Enquiry = Database['public']['Tables']['enquiries']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Admission = Database['public']['Tables']['admissions']['Row'];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'enquiries' | 'appointments' | 'admissions'>('overview');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedEnquiries, setSelectedEnquiries] = useState<string[]>([]);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [selectedAdmissions, setSelectedAdmissions] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsRes, enquiriesRes, appointmentsRes, admissionsRes] = await Promise.all([
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').order('appointment_date', { ascending: false }),
        supabase.from('admissions').select('*').order('created_at', { ascending: false }),
      ]);

      if (contactsRes.data) setContacts(contactsRes.data);
      if (enquiriesRes.data) setEnquiries(enquiriesRes.data);
      if (appointmentsRes.data) setAppointments(appointmentsRes.data);
      if (admissionsRes.data) setAdmissions(admissionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Contacts', value: contacts.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Enquiries', value: enquiries.length, icon: MessageSquare, color: 'bg-green-500' },
    { label: 'Appointments', value: appointments.length, icon: Calendar, color: 'bg-amber-500' },
    { label: 'Admissions', value: admissions.length, icon: GraduationCap, color: 'bg-rose-500' },
  ];


  const handleDeleteContact = async (contactId: string, contactName: string) => {
    if (!confirm(`Are you sure you want to delete ${contactName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        alert(`Error deleting contact: ${error.message}`);
        console.error('Error deleting contact:', error);
      } else {
        alert('Contact deleted successfully');
        fetchData();
      }
    } catch (error) {
      alert('An unexpected error occurred while deleting the contact');
      console.error('Error deleting contact:', error);
    }
  };

  const toggleSelectAll = (type: 'contacts' | 'enquiries' | 'appointments' | 'admissions') => {
    switch (type) {
      case 'contacts':
        if (selectedContacts.length === contacts.length) {
          setSelectedContacts([]);
        } else {
          setSelectedContacts(contacts.map(c => c.id));
        }
        break;
      case 'enquiries':
        if (selectedEnquiries.length === enquiries.length) {
          setSelectedEnquiries([]);
        } else {
          setSelectedEnquiries(enquiries.map(e => e.id));
        }
        break;
      case 'appointments':
        if (selectedAppointments.length === appointments.length) {
          setSelectedAppointments([]);
        } else {
          setSelectedAppointments(appointments.map(a => a.id));
        }
        break;
      case 'admissions':
        if (selectedAdmissions.length === admissions.length) {
          setSelectedAdmissions([]);
        } else {
          setSelectedAdmissions(admissions.map(a => a.id));
        }
        break;
    }
  };

  const toggleSelectItem = (id: string, type: 'contacts' | 'enquiries' | 'appointments' | 'admissions') => {
    switch (type) {
      case 'contacts':
        setSelectedContacts(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        break;
      case 'enquiries':
        setSelectedEnquiries(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        break;
      case 'appointments':
        setSelectedAppointments(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        break;
      case 'admissions':
        setSelectedAdmissions(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        break;
    }
  };

  const handleBulkDelete = async (type: 'contacts' | 'enquiries' | 'appointments' | 'admissions') => {
    let selectedIds: string[] = [];
    let tableName = '';
    let itemName = '';

    switch (type) {
      case 'contacts':
        selectedIds = selectedContacts;
        tableName = 'contacts';
        itemName = 'contact';
        break;
      case 'enquiries':
        selectedIds = selectedEnquiries;
        tableName = 'enquiries';
        itemName = 'enquiry';
        break;
      case 'appointments':
        selectedIds = selectedAppointments;
        tableName = 'appointments';
        itemName = 'appointment';
        break;
      case 'admissions':
        selectedIds = selectedAdmissions;
        tableName = 'admissions';
        itemName = 'admission';
        break;
    }

    if (selectedIds.length === 0) {
      alert(`Please select at least one ${itemName} to delete`);
      return;
    }

    const count = selectedIds.length;
    const confirmMessage = count === 1
      ? `Are you sure you want to delete this ${itemName}?`
      : `Are you sure you want to delete ${count} ${itemName}s?`;

    if (!confirm(`${confirmMessage}\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', selectedIds);

      if (error) {
        alert(`Error deleting ${itemName}s: ${error.message}`);
        console.error(`Error deleting ${itemName}s:`, error);
      } else {
        alert(`Successfully deleted ${count} ${itemName}${count === 1 ? '' : 's'}`);
        switch (type) {
          case 'contacts':
            setSelectedContacts([]);
            break;
          case 'enquiries':
            setSelectedEnquiries([]);
            break;
          case 'appointments':
            setSelectedAppointments([]);
            break;
          case 'admissions':
            setSelectedAdmissions([]);
            break;
        }
        fetchData();
      }
    } catch (error) {
      alert(`An unexpected error occurred while deleting ${itemName}s`);
      console.error(`Error deleting ${itemName}s:`, error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-emerald-100 text-emerald-800',
      closed: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-amber-100 text-amber-800',
      resolved: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
      applied: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      enrolled: 'bg-emerald-100 text-emerald-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600">Manage your contacts, enquiries, appointments, and admissions</p>
            </div>
          </div>
          <button
            onClick={downloadEnquiryCSVTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md"
          >
            <Download className="w-5 h-5" />
            Download CSV Template
          </button>
        </div>

        <div className="mb-8">
          <MasterSearch />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'contacts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Contacts
            </button>
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'enquiries'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Enquiries
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'appointments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('admissions')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'admissions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admissions
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {enquiries.slice(0, 5).map((enquiry) => (
                <div key={enquiry.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{enquiry.subject}</p>
                    <p className="text-sm text-gray-600">{formatDateTime(enquiry.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                    {enquiry.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {selectedContacts.length > 0 && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => handleBulkDelete('contacts')}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                      onChange={() => toggleSelectAll('contacts')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleSelectItem(contact.id, 'contacts')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.company || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.source || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(contact.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteContact(contact.id, `${contact.first_name} ${contact.last_name}`)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Delete contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {selectedEnquiries.length > 0 && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedEnquiries.length} enquir{selectedEnquiries.length !== 1 ? 'ies' : 'y'} selected
              </p>
              <button
                onClick={() => handleBulkDelete('enquiries')}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={enquiries.length > 0 && selectedEnquiries.length === enquiries.length}
                      onChange={() => toggleSelectAll('enquiries')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEnquiries.includes(enquiry.id)}
                        onChange={() => toggleSelectItem(enquiry.id, 'enquiries')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{enquiry.subject}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{enquiry.message}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{enquiry.enquiry_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.priority)}`}>
                        {enquiry.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{enquiry.assigned_to || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(enquiry.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {selectedAppointments.length > 0 && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedAppointments.length} appointment{selectedAppointments.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => handleBulkDelete('appointments')}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={appointments.length > 0 && selectedAppointments.length === appointments.length}
                      onChange={() => toggleSelectAll('appointments')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAppointments.includes(appointment.id)}
                        onChange={() => toggleSelectItem(appointment.id, 'appointments')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{appointment.title}</p>
                      {appointment.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{appointment.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appointment.appointment_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(appointment.appointment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {appointment.duration_minutes} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appointment.location || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appointment.assigned_to || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'admissions' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {selectedAdmissions.length > 0 && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedAdmissions.length} admission{selectedAdmissions.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => handleBulkDelete('admissions')}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={admissions.length > 0 && selectedAdmissions.length === admissions.length}
                      onChange={() => toggleSelectAll('admissions')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admissions.map((admission) => (
                  <tr key={admission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAdmissions.includes(admission.id)}
                        onChange={() => toggleSelectItem(admission.id, 'admissions')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{admission.program}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(admission.admission_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(admission.status)}`}>
                        {admission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {admission.qualification && admission.qualification.length > 0
                        ? admission.qualification.join(', ')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admission.experience_years} years</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">${admission.amount_paid} / ${admission.amount}</p>
                        <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${getStatusColor(admission.payment_status)}`}>
                          {admission.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {admission.documents_submitted ? '✓ Yes' : '✗ No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
