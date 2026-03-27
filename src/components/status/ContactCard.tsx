import { User, Calendar, Mail, Phone, MapPin, Briefcase, FileText } from 'lucide-react';
import { Contact } from '../../types/interfaces';

interface ContactCardProps {
  contact: Contact;
  getCreatorName: (createdBy?: string) => string;
  getStatusBadgeColor: (status: string) => string;
}

export function ContactCard({ contact, getCreatorName, getStatusBadgeColor }: ContactCardProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-full p-3">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadgeColor(contact.status)}`}>
              {contact.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">
            <Calendar className="w-3 h-3 inline mr-1" />
            Registered: {new Date(contact.created_at).toLocaleDateString()}
          </div>
          {contact.created_by && (
            <div className="text-xs text-blue-600 font-medium mt-1">
              Created by: {getCreatorName(contact.created_by)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Email:</span> {contact.email}
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Phone:</span> {contact.phone}
          </div>
        )}
        {contact.date_of_birth && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium">DOB:</span> {new Date(contact.date_of_birth).toLocaleDateString()}
          </div>
        )}
        {contact.city && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium">City:</span> {contact.city}
          </div>
        )}
        {contact.company && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Company:</span> {contact.company}
          </div>
        )}
        {contact.source && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Source:</span> {contact.source}
          </div>
        )}
      </div>

      {contact.notes && (
        <div className="mt-4 p-3 bg-white rounded-lg">
          <span className="text-sm font-medium text-gray-700">Notes:</span>
          <p className="text-sm text-gray-600 mt-1">{contact.notes}</p>
        </div>
      )}
    </div>
  );
}
