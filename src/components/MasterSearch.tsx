import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Search, X, Users, MessageSquare, Calendar, GraduationCap, FileText } from 'lucide-react';
import { getStatusColor, formatDate } from '../utils/formatting';

interface ContactResult {
  type: 'contact';
  id: string;
  title: string;
  subtitle: string;
  details: string;
  status: string;
  created_at: string;
}

interface EnquiryResult {
  type: 'enquiry';
  id: string;
  title: string;
  subtitle: string;
  details: string;
  status: string;
  created_at: string;
}

interface AppointmentResult {
  type: 'appointment';
  id: string;
  title: string;
  subtitle: string;
  details: string;
  status: string;
  created_at: string;
}

interface AdmissionResult {
  type: 'admission';
  id: string;
  title: string;
  subtitle: string;
  details: string;
  status: string;
  created_at: string;
}

type SearchResult = ContactResult | EnquiryResult | AppointmentResult | AdmissionResult;

export function MasterSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchAllRecords = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const results: SearchResult[] = [];

        const [contactsRes, enquiriesRes, appointmentsRes, admissionsRes] = await Promise.all([
          supabase
            .from('contacts')
            .select('*')
            .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
            .limit(10),
          supabase
            .from('enquiries')
            .select('*, contacts(first_name, last_name, email)')
            .or(`subject.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`)
            .limit(10),
          supabase
            .from('appointments')
            .select('*, contacts(first_name, last_name, email)')
            .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
            .limit(10),
          supabase
            .from('admissions')
            .select('*, contacts(first_name, last_name, email)')
            .or(`program.ilike.%${searchTerm}%,specialisation.ilike.%${searchTerm}%,previous_institution.ilike.%${searchTerm}%`)
            .limit(10),
        ]);

        if (contactsRes.data) {
          contactsRes.data.forEach((contact) => {
            results.push({
              type: 'contact',
              id: contact.id,
              title: `${contact.first_name} ${contact.last_name}`,
              subtitle: contact.email,
              details: [contact.phone, contact.company].filter(Boolean).join(' • '),
              status: contact.status,
              created_at: contact.created_at,
            });
          });
        }

        if (enquiriesRes.data) {
          enquiriesRes.data.forEach((enquiry: any) => {
            const contact = enquiry.contacts;
            results.push({
              type: 'enquiry',
              id: enquiry.id,
              title: enquiry.subject,
              subtitle: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown Contact',
              details: enquiry.message ? enquiry.message.substring(0, 100) + '...' : '',
              status: enquiry.status,
              created_at: enquiry.created_at,
            });
          });
        }

        if (appointmentsRes.data) {
          appointmentsRes.data.forEach((appointment: any) => {
            const contact = appointment.contacts;
            const date = new Date(appointment.appointment_date);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const appointmentDate = `${day}-${month}-${year} ${hours}:${minutes}`;
            results.push({
              type: 'appointment',
              id: appointment.id,
              title: appointment.title,
              subtitle: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown Contact',
              details: `${appointmentDate} • ${appointment.appointment_type}`,
              status: appointment.status,
              created_at: appointment.created_at,
            });
          });
        }

        if (admissionsRes.data) {
          admissionsRes.data.forEach((admission: any) => {
            const contact = admission.contacts;
            results.push({
              type: 'admission',
              id: admission.id,
              title: admission.program + (admission.specialisation ? ` - ${admission.specialisation}` : ''),
              subtitle: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown Contact',
              details: admission.previous_institution || '',
              status: admission.status,
              created_at: admission.created_at,
            });
          });
        }

        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchAllRecords, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'enquiry':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case 'admission':
        return <GraduationCap className="w-5 h-5 text-rose-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contact':
        return 'Contact';
      case 'enquiry':
        return 'Enquiry';
      case 'appointment':
        return 'Appointment';
      case 'admission':
        return 'Admission';
      default:
        return type;
    }
  };


  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder="Search across all records (contacts, enquiries, appointments, admissions)..."
          className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-[600px] overflow-y-auto">
          <div className="p-3 bg-gray-50 border-b border-gray-200 sticky top-0">
            <p className="text-sm font-semibold text-gray-700">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {loading && (
            <div className="p-6 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          {!loading && searchResults.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="p-4 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {getTypeLabel(result.type)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">{result.title}</p>
                  <p className="text-sm text-gray-600 mb-1">{result.subtitle}</p>
                  {result.details && (
                    <p className="text-sm text-gray-500 line-clamp-2">{result.details}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {(() => {
                      const date = new Date(result.created_at);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(2, '0');
                      return `${day}-${month}-${year} ${hours}:${minutes}`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && !loading && searchTerm.length >= 2 && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-8 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No records found</p>
          <p className="text-sm text-gray-500 mt-1">Try searching with different keywords</p>
        </div>
      )}
    </div>
  );
}
