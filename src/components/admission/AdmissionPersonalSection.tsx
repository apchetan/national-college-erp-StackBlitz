import { User, GraduationCap } from 'lucide-react';
import { INDIAN_STATES } from '../../constants/formOptions';

interface FormData {
  fullName: string;
  mobile: string;
  mobile1: string;
  mobile2: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  program: string;
  specialization: string;
  highestQualification: string;
  highestQualificationCourse: string;
  highestQualificationSpecialization: string;
  yearOfPassing: string;
  totalExperience: string;
  employmentStatus: string;
  resume: File | null;
  idProof: File | null;
  certificates: File | null;
}

interface AdmissionPersonalSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  previousAdmissions: Array<{ id: string; created_at: string; program: string }>;
}

export function AdmissionPersonalSection({ formData, setFormData, previousAdmissions }: AdmissionPersonalSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 rounded-lg">
          <User className="w-6 h-6 text-amber-900" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
      </div>

      {previousAdmissions.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm font-semibold text-orange-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Multiple Admissions: {previousAdmissions.length} previous admission{previousAdmissions.length === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-orange-700 mt-1">
            Earlier admission dates: {previousAdmissions.slice(0, 3).map(a => new Date(a.created_at).toLocaleDateString() + ' (' + a.program + ')').join(', ')}
            {previousAdmissions.length > 3 && ` and ${previousAdmissions.length - 3} more`}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          placeholder="Enter your full name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="mobile"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            placeholder="10-digit mobile number"
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            placeholder="10-digit WhatsApp number"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email ID <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          placeholder="your.email@example.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="mobile1" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile 1
          </label>
          <input
            type="tel"
            id="mobile1"
            value={formData.mobile1}
            onChange={(e) => setFormData({ ...formData, mobile1: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            placeholder="Mobile number 1"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            placeholder="Mobile number 2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            placeholder="Your city"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          >
            <option value="">Select your state</option>
            {INDIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
