import { Calendar, Clock } from 'lucide-react';

interface FormData {
  fullName: string;
  mobile: string;
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
  appointmentType: string;
  preferredDate: string;
  timeSlot: string;
}

interface AppointmentSchedulingProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  previousAppointments: Array<{ id: string; created_at: string; attendance: string | null }>;
}

export function AppointmentScheduling({ formData, setFormData, previousAppointments }: AppointmentSchedulingProps) {
  return (
    <>
      {previousAppointments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            Previous Appointments: {previousAppointments.length} appointment{previousAppointments.length !== 1 ? 's' : ''}
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            {previousAppointments.slice(0, 3).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between">
                <span>{new Date(apt.created_at).toLocaleDateString()}</span>
                <span className={`px-2 py-0.5 rounded ${
                  apt.attendance === 'Show' ? 'bg-green-100 text-green-800' :
                  apt.attendance === 'No-Show' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {apt.attendance || 'Not Set'}
                </span>
              </div>
            ))}
            {previousAppointments.length > 3 && (
              <p className="text-blue-600 font-medium">and {previousAppointments.length - 3} more...</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-900" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Appointment Date & Time</h3>
        </div>

        <div>
          <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type <span className="text-red-500">*</span>
          </label>
          <select
            id="appointmentType"
            value={formData.appointmentType}
            onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select appointment type</option>
            <option value="PhD, One-on-One">PhD, One-on-One</option>
            <option value="SRP meeting">SRP meeting</option>
            <option value="PhD Webinar">PhD Webinar</option>
            <option value="Other Webinar">Other Webinar</option>
          </select>
        </div>

        <div>
          <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
            Choose Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="preferredDate"
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Time Slot (60 minutes) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { time: '11:00', label: '11:00 AM - 12:00 PM' },
              { time: '12:00', label: '12:00 PM - 1:00 PM' },
              { time: '14:00', label: '2:00 PM - 3:00 PM' },
              { time: '15:00', label: '3:00 PM - 4:00 PM' },
              { time: '16:00', label: '4:00 PM - 5:00 PM' },
              { time: '17:00', label: '5:00 PM - 6:00 PM' }
            ].map(slot => (
              <button
                key={slot.time}
                type="button"
                onClick={() => setFormData({ ...formData, timeSlot: slot.time })}
                className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                  formData.timeSlot === slot.time
                    ? 'border-blue-900 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-blue-300 text-gray-700'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="text-xs font-medium text-center">{slot.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
