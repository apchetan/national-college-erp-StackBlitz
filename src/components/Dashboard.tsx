import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, MessageSquare, Calendar, GraduationCap, Activity, TrendingUp, Download, Trash2, Zap, FileText, Wallet } from 'lucide-react';
import { downloadEnquiryCSVTemplate } from '../utils/csvTemplate';
import { MasterSearch } from './MasterSearch';
import { formatDate, formatDateTime } from '../utils/formatting';
import { Contact, Enquiry, Appointment, Admission } from '../types/interfaces';
import { useToast } from '../contexts/ToastContext';
import { ConfirmModal } from './ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { RefreshButton } from './RefreshButton';

interface ActivityItem {
  id: string;
  type: 'contact' | 'enquiry' | 'appointment' | 'admission';
  title: string;
  subtitle?: string;
  created_at: string;
  color: string;
  icon: typeof Users;
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
};

export function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'enquiries' | 'appointments' | 'admissions'>('overview');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedEnquiries, setSelectedEnquiries] = useState<string[]>([]);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [selectedAdmissions, setSelectedAdmissions] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const getWeeklyCount = (items: Array<{ created_at: string }>) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return items.filter(item => new Date(item.created_at) > weekAgo).length;
  };

  const stats = [
    {
      label: 'Total Contacts',
      value: contacts.length,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      weeklyCount: getWeeklyCount(contacts)
    },
    {
      label: 'Enquiries',
      value: enquiries.length,
      icon: MessageSquare,
      gradient: 'from-green-500 to-green-600',
      weeklyCount: getWeeklyCount(enquiries)
    },
    {
      label: 'Appointments',
      value: appointments.length,
      icon: Calendar,
      gradient: 'from-amber-500 to-amber-600',
      weeklyCount: getWeeklyCount(appointments)
    },
    {
      label: 'Admissions',
      value: admissions.length,
      icon: GraduationCap,
      gradient: 'from-rose-500 to-rose-600',
      weeklyCount: getWeeklyCount(admissions)
    },
  ];

  const mergeActivityFeed = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    contacts.forEach(contact => {
      activities.push({
        id: contact.id,
        type: 'contact',
        title: `New contact: ${contact.first_name} ${contact.last_name}`,
        subtitle: contact.email,
        created_at: contact.created_at,
        color: 'bg-blue-500',
        icon: Users,
      });
    });

    enquiries.forEach(enquiry => {
      activities.push({
        id: enquiry.id,
        type: 'enquiry',
        title: `Enquiry: ${enquiry.subject}`,
        subtitle: enquiry.message?.substring(0, 60) + (enquiry.message?.length > 60 ? '...' : ''),
        created_at: enquiry.created_at,
        color: 'bg-green-500',
        icon: MessageSquare,
      });
    });

    appointments.forEach(appointment => {
      activities.push({
        id: appointment.id,
        type: 'appointment',
        title: `Appointment: ${appointment.title}`,
        subtitle: `${formatDateTime(appointment.appointment_date)}`,
        created_at: appointment.created_at,
        color: 'bg-amber-500',
        icon: Calendar,
      });
    });

    admissions.forEach(admission => {
      activities.push({
        id: admission.id,
        type: 'admission',
        title: `Admission: ${admission.program}`,
        subtitle: admission.specialisation || undefined,
        created_at: admission.created_at,
        color: 'bg-rose-500',
        icon: GraduationCap,
      });
    });

    return activities.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 15);
  };

  const getTodayDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };


  const handleDeleteContact = async (contactId: string, contactName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Contact',
      message: `Are you sure you want to delete ${contactName}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        try {
          const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', contactId);

          if (error) {
            addToast(`Error deleting contact: ${error.message}`, 'error');
            console.error('Error deleting contact:', error);
          } else {
            addToast('Contact deleted successfully', 'success');
            fetchData();
          }
        } catch (error) {
          addToast('An unexpected error occurred while deleting the contact', 'error');
          console.error('Error deleting contact:', error);
        }
      }
    });
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
      addToast(`Please select at least one ${itemName} to delete`, 'warning');
      return;
    }

    const count = selectedIds.length;
    const confirmMessage = count === 1
      ? `Are you sure you want to delete this ${itemName}?`
      : `Are you sure you want to delete ${count} ${itemName}s?`;

    setConfirmModal({
      isOpen: true,
      title: `Delete ${itemName}${count === 1 ? '' : 's'}`,
      message: `${confirmMessage}\n\nThis action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        setDeleting(true);
        try {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .in('id', selectedIds);

          if (error) {
            addToast(`Error deleting: ${error.message}`, 'error');
            console.error(`Error deleting ${itemName}s:`, error);
          } else {
            addToast(`Successfully deleted ${count} ${itemName}${count === 1 ? '' : 's'}`, 'success');
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
          addToast(`An unexpected error occurred while deleting ${itemName}s`, 'error');
          console.error(`Error deleting ${itemName}s:`, error);
        } finally {
          setDeleting(false);
        }
      }
    });
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back, {profile?.full_name || 'User'}!
              </h1>
              <p className="text-gray-500">Here's what's happening at National College today</p>
              <p className="text-sm text-gray-400 mt-1">{getTodayDate()}</p>
            </div>
            <RefreshButton onRefresh={handleRefresh} isRefreshing={refreshing} />
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <LoadingSpinner variant="skeleton" count={4} />
            ) : (
              stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <stat.icon className="w-8 h-8" />
                    </div>
                    {stat.weeklyCount > 0 && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        +{stat.weeklyCount} this week
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-90 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/enquiry')}
                className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md"
              >
                <FileText className="w-8 h-8" />
                <span className="font-bold">New Enquiry</span>
              </button>
              <button
                onClick={() => navigate('/appointment')}
                className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition shadow-md"
              >
                <Calendar className="w-8 h-8" />
                <span className="font-bold">Book Appointment</span>
              </button>
              <button
                onClick={() => navigate('/admission')}
                className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition shadow-md"
              >
                <GraduationCap className="w-8 h-8" />
                <span className="font-bold">New Admission</span>
              </button>
              <button
                onClick={() => navigate('/fee-payment')}
                className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition shadow-md"
              >
                <Wallet className="w-8 h-8" />
                <span className="font-bold">Record Payment</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="space-y-1">
              {mergeActivityFeed().map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                  onClick={() => setActiveTab(activity.type === 'contact' ? 'contacts' : activity.type === 'enquiry' ? 'enquiries' : activity.type === 'appointment' ? 'appointments' : 'admissions')}
                >
                  <div className="relative">
                    <div className={`${activity.color} p-2 rounded-full`}>
                      <activity.icon className="w-4 h-4 text-white" />
                    </div>
                    {index !== mergeActivityFeed().length - 1 && (
                      <div className="absolute left-1/2 top-8 w-0.5 h-8 bg-gray-200 -ml-px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    {activity.subtitle && (
                      <p className="text-sm text-gray-600 mt-1 truncate">{activity.subtitle}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formatRelativeTime(activity.created_at)}
                  </span>
                </div>
              ))}
            </div>
            {mergeActivityFeed().length === 0 && (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            )}
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        variant="danger"
      />
    </div>
  );
}
