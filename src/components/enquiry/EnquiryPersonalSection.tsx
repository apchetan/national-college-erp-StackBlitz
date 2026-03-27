import { MessageSquare } from 'lucide-react';
import { SearchableSelect } from '../SearchableSelect';
import { useFormOptions } from '../../hooks/useFormOptions';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile1: string;
  mobile2: string;
  dateOfBirth: string;
  city: string;
  company: string;
  source: string;
  program: string;
  specialisation: string;
  subject: string;
  message: string;
  highestQualification: string;
  highestQualificationCourse: string;
  highestQualificationSpecialization: string;
  yearOfPassing: string;
  totalExperience: string;
  employmentStatus: string;
}

interface EnquiryPersonalSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  previousEnquiries: Array<{ id: string; created_at: string }>;
}

export function EnquiryPersonalSection({ formData, setFormData, previousEnquiries }: EnquiryPersonalSectionProps) {
  const { cities, loadingOptions } = useFormOptions();

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>

      {previousEnquiries.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Multiple Entries: {previousEnquiries.length} previous enquir{previousEnquiries.length === 1 ? 'y' : 'ies'}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Earlier enquiry dates: {previousEnquiries.slice(0, 5).map(e => new Date(e.created_at).toLocaleDateString()).join(', ')}
            {previousEnquiries.length > 5 && ` and ${previousEnquiries.length - 5} more`}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mobile1" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile 1
            </label>
            <input
              type="tel"
              id="mobile1"
              value={formData.mobile1}
              onChange={(e) => setFormData({ ...formData, mobile1: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="mobile2" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile 2
            </label>
            <input
              type="tel"
              id="mobile2"
              value={formData.mobile2}
              onChange={(e) => setFormData({ ...formData, mobile2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <SearchableSelect
              options={cities}
              value={formData.city}
              onChange={(value) => setFormData({ ...formData, city: value })}
              placeholder="Select a city"
              label="City"
              loading={loadingOptions}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Current Company/Organization
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
              How did you hear about us?
            </label>
            <select
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="email_naukri">Email from naukri.com</option>
              <option value="email_foundit">Email from Foundit.com</option>
              <option value="referred_student_friend">Referred by (Student/Friend)</option>
              <option value="referred_staff">Referred by Staff</option>
              <option value="sms">SMS</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="google">Google</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="webchat">WebChat</option>
              <option value="missed_call">Missed Call</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
