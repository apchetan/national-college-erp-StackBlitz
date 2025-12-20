import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Search, X, User } from 'lucide-react';

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

interface ContactSearchProps {
  onSelectContact: (contact: Contact | null) => void;
  selectedContact: Contact | null;
}

export function ContactSearch({ onSelectContact, selectedContact }: ContactSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
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
    const searchContacts = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchContacts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelectContact = (contact: Contact) => {
    onSelectContact(contact);
    setSearchTerm('');
    setShowResults(false);
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    onSelectContact(null);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-3">
        <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-blue-900 mb-1">Search Existing Contact</p>
          <p className="text-sm text-blue-700">Search by name, email, or phone to autofill contact details</p>
        </div>
      </div>

      {selectedContact ? (
        <div className="bg-white rounded-lg p-4 border border-blue-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <p className="font-semibold text-gray-900">
                  {selectedContact.first_name} {selectedContact.last_name}
                </p>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{selectedContact.email}</p>
                {selectedContact.phone && <p>{selectedContact.phone}</p>}
                {selectedContact.city && <p>City: {selectedContact.city}</p>}
                {selectedContact.company && <p>Company: {selectedContact.company}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Clear selection and enter new contact"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
              {!loading && searchResults.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => handleSelectContact(contact)}
                  className="w-full text-left p-4 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{contact.email}</p>
                      {contact.phone && (
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      )}
                      {contact.city && (
                        <p className="text-xs text-gray-400 mt-1">{contact.city}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showResults && !loading && searchTerm.length >= 2 && searchResults.length === 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
              No contacts found. You can create a new one below.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
