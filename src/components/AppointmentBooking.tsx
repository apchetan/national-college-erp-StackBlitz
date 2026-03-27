import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, AlertCircle, ArrowLeft,
  GraduationCap, FileText, Calendar, LayoutDashboard
} from 'lucide-react';
import { ContactSearch } from './ContactSearch';
import { AppointmentPersonalInfo } from './appointment/AppointmentPersonalInfo';
import { AppointmentAcademicInfo } from './appointment/AppointmentAcademicInfo';
import { AppointmentScheduling } from './appointment/AppointmentScheduling';
import { useAppointmentForm } from '../hooks/useAppointmentForm';

export function AppointmentBooking() {
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    loading,
    success,
    error,
    selectedContact,
    setSelectedContact,
    previousEnquiries,
    previousAppointments,
    emailStatus,
    handleSubmit,
    handleHighestQualificationCourseChange,
    shouldShowHighestQualificationSpecialisation,
    getAvailableHighestQualificationSpecialisations,
    getAvailableSpecialisations,
    resetForm,
  } = useAppointmentForm();

  if (success) {
    const formatTime = (time: string) => {
      const [hour] = time.split(':');
      const hourNum = parseInt(hour);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
      return `${displayHour}:00 ${ampm}`;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="leading-none">
                    <h1 className="text-xl font-bold text-gray-900 leading-none mb-0.5">Mirror</h1>
                    <p className="text-xs font-semibold text-blue-600 leading-none">(ERP-CRM)</p>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/enquiry')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                  >
                    <FileText className="w-4 h-4" />
                    Enquiry Form
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-600 text-white">
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </div>
                  <button
                    onClick={() => navigate('/admission')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Admission Form
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center p-8 min-h-[calc(100vh-4rem)]">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Appointment Booked Successfully!</h2>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for booking an appointment with National College. Our team will contact you shortly to confirm your appointment and discuss your program requirements.
          </p>
          {emailStatus && (
            <div className={`p-4 rounded-lg mb-4 ${emailStatus.sent ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${emailStatus.sent ? 'text-green-800' : 'text-yellow-800'}`}>
                {emailStatus.message}
              </p>
            </div>
          )}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Appointment Details:</h3>
            <div className="space-y-2 text-left">
              <p className="text-gray-700"><span className="font-medium">Program:</span> {formData.program} - {formData.specialization}</p>
              <p className="text-gray-700"><span className="font-medium">Name:</span> {formData.fullName}</p>
              <p className="text-gray-700"><span className="font-medium">Date:</span> {new Date(formData.preferredDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-gray-700"><span className="font-medium">Time:</span> {formatTime(formData.timeSlot)} - {formatTime((parseInt(formData.timeSlot.split(':')[0]) + 1).toString() + ':00')}</p>
              <p className="text-gray-700"><span className="font-medium">Mobile:</span> {formData.mobile}</p>
              <p className="text-gray-700"><span className="font-medium">Email:</span> {formData.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="px-8 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="leading-none">
                  <h1 className="text-xl font-bold text-gray-900 leading-none mb-0.5">Mirror</h1>
                  <p className="text-xs font-semibold text-blue-600 leading-none">(ERP-CRM)</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/enquiry')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4" />
                  Enquiry Form
                </button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-600 text-white">
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </div>
                <button
                  onClick={() => navigate('/admission')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                >
                  <GraduationCap className="w-4 h-4" />
                  Admission Form
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-900">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-12">
            <ContactSearch
              onSelectContact={setSelectedContact}
              selectedContact={selectedContact}
            />

            {previousEnquiries > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Re-Enquiry: This is enquiry #{previousEnquiries} for this contact
                </p>
              </div>
            )}

            <AppointmentAcademicInfo
              formData={formData}
              setFormData={setFormData}
              getAvailableSpecialisations={getAvailableSpecialisations}
              handleHighestQualificationCourseChange={handleHighestQualificationCourseChange}
              shouldShowHighestQualificationSpecialisation={shouldShowHighestQualificationSpecialisation}
              getAvailableHighestQualificationSpecialisations={getAvailableHighestQualificationSpecialisations}
            />

            <AppointmentPersonalInfo
              formData={formData}
              setFormData={setFormData}
            />

            <AppointmentScheduling
              formData={formData}
              setFormData={setFormData}
              previousAppointments={previousAppointments}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg font-semibold text-lg hover:from-blue-800 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Booking Appointment...' : 'Book Appointment'}
              <CheckCircle className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>

      <a
        href="https://wa.me/918068507627"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition transform hover:scale-110 z-50"
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-8 h-8 text-amber-400" />
            <h3 className="text-2xl font-bold">National College</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4 text-blue-100">
            <a href="https://www.nationalcollege.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              www.nationalcollege.in
            </a>
            <span className="hidden md:inline">|</span>
            <a href="tel:08068507627" className="hover:text-white transition">
              080 68507627
            </a>
          </div>
          <div className="inline-block bg-amber-500 text-blue-900 px-4 py-2 rounded-full font-semibold text-sm">
            Established 1998 - Excellence in Education
          </div>
        </div>
      </footer>
    </div>
  );
}
