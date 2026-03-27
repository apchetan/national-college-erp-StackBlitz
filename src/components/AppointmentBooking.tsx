import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  CheckCircle, AlertCircle, ArrowLeft,
  User, Briefcase, GraduationCap, FileText, Calendar, Clock, LayoutDashboard
} from 'lucide-react';
import { convertToDBFormat, cleanDateForForm } from '../utils/dateValidation';
import { ContactSearch } from './ContactSearch';
import { PROGRAMS, SPECIALISATIONS, INDIAN_STATES, EMPLOYMENT_STATUS, QUALIFICATIONS, generateYears } from '../constants/formOptions';
import { validateEmail, validateMobile } from '../utils/validation';
import { useNavigation } from '../App';
import { Contact } from '../types/interfaces';

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

export function AppointmentBooking() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [previousEnquiries, setPreviousEnquiries] = useState<number>(0);
  const [previousAppointments, setPreviousAppointments] = useState<Array<{ id: string; created_at: string; attendance: string | null }>>([]);
  const [emailStatus, setEmailStatus] = useState<{ sent: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    city: '',
    state: '',
    program: '',
    specialization: '',
    highestQualification: '',
    highestQualificationCourse: '',
    highestQualificationSpecialization: '',
    yearOfPassing: '',
    totalExperience: '',
    employmentStatus: '',
    appointmentType: '',
    preferredDate: '',
    timeSlot: '',
  });

  useEffect(() => {
    if (selectedContact) {
      setFormData(prev => ({
        ...prev,
        fullName: `${selectedContact.first_name} ${selectedContact.last_name}`.trim(),
        email: selectedContact.email,
        mobile: selectedContact.phone || '',
        whatsapp: selectedContact.phone || '',
        city: selectedContact.city || '',
      }));

      fetchContactHistory(selectedContact.id);
    } else {
      setPreviousEnquiries(0);
      setPreviousAppointments([]);
    }
  }, [selectedContact]);

  const fetchContactHistory = async (contactId: string) => {
    try {
      const [enquiriesRes, appointmentsRes] = await Promise.all([
        supabase
          .from('enquiries')
          .select('id', { count: 'exact', head: true })
          .eq('contact_id', contactId),
        supabase
          .from('appointments')
          .select('id, created_at, attendance')
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
      ]);

      setPreviousEnquiries(enquiriesRes.count || 0);
      setPreviousAppointments(appointmentsRes.data || []);
    } catch (err) {
      console.error('Error fetching contact history:', err);
    }
  };


  const validateForm = (): boolean => {
    setError('');

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!validateMobile(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!validateMobile(formData.whatsapp)) {
      setError('Please enter a valid 10-digit WhatsApp number');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.program) {
      setError('Please select a program');
      return false;
    }
    const availableSpecs = formData.program === 'PhD'
      ? (() => {
          const allSpecs = new Set<string>();
          const excludeSpecs = ['(General)CBZ', '(General)PCB', '(General)PCM', 'Artificial Intelligence'];
          Object.values(SPECIALISATIONS).forEach(specs => {
            specs.forEach(spec => {
              if (!excludeSpecs.includes(spec)) {
                allSpecs.add(spec);
              }
            });
          });
          allSpecs.add('Pharmacy');
          return Array.from(allSpecs);
        })()
      : SPECIALISATIONS[formData.program] || [];

    if (availableSpecs.length > 0 && !formData.specialization) {
      setError('Please select a specialization');
      return false;
    }
    if (!formData.highestQualification) {
      setError('Please select your highest qualification');
      return false;
    }
    if (!formData.yearOfPassing) {
      setError('Year of passing is required');
      return false;
    }
    if (!formData.employmentStatus) {
      setError('Please select your employment status');
      return false;
    }
    if (!formData.appointmentType) {
      setError('Please select an appointment type');
      return false;
    }
    if (!formData.preferredDate) {
      setError('Please select a preferred appointment date');
      return false;
    }
    if (!formData.timeSlot) {
      setError('Please select a time slot');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: existingByEmail } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      const dbDate = convertToDBFormat(formData.preferredDate);
      if (!dbDate) {
        setError('Please enter a valid date');
        setLoading(false);
        return;
      }

      const appointmentDate = `${dbDate}T${formData.timeSlot}:00`;

      let contactId: string;

      if (selectedContact) {
        contactId = selectedContact.id;
      } else if (existingByEmail) {
        contactId = existingByEmail.id;
      } else {
        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .insert({
            first_name: formData.fullName.split(' ')[0],
            last_name: formData.fullName.split(' ').slice(1).join(' '),
            email: formData.email,
            phone: formData.mobile,
            city: formData.city,
            total_experience: formData.totalExperience ? parseInt(formData.totalExperience) : null,
            source: 'google',
            status: 'new',
          })
          .select()
          .maybeSingle();

        if (contactError) throw contactError;
        contactId = contact!.id;
      }

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          contact_id: contactId,
          title: `${formData.program} Consultation - ${formData.fullName}`,
          description: `Program: ${formData.program}\nSpecialization: ${formData.specialization}\nQualification: ${formData.highestQualification}\nYear of Passing: ${formData.yearOfPassing}\nTotal Experience: ${formData.totalExperience ? formData.totalExperience + ' years' : 'Not specified'}\nEmployment: ${formData.employmentStatus}`,
          appointment_type: 'consultation',
          appointment_date: appointmentDate,
          duration_minutes: 60,
          status: 'scheduled',
          location: 'National College Campus',
        })
        .select()
        .maybeSingle();

      if (appointmentError) throw appointmentError;

      if (appointment) {
        try {
          const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-appointment-emails`;
          const headers = {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          };

          const nameParts = formData.fullName.trim().split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || '';

          const emailResponse = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              appointmentData: {
                appointmentId: appointment.id,
                firstName,
                lastName,
                email: formData.email,
                phone: formData.mobile,
                program: formData.program,
                specialization: formData.specialization,
                preferredDate: formData.preferredDate,
                timeSlot: formData.timeSlot,
                appointmentType: formData.appointmentType,
                city: formData.city,
                state: formData.state,
              }
            }),
          });

          const emailResult = await emailResponse.json();

          if (emailResult.applicantEmailSent) {
            setEmailStatus({
              sent: true,
              message: `A confirmation email has been sent to ${formData.email}`
            });
          } else {
            setEmailStatus({
              sent: false,
              message: 'We could not send the confirmation email right now, but your appointment is confirmed in our system.'
            });
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          setEmailStatus({
            sent: false,
            message: 'We could not send the confirmation email right now, but your appointment is confirmed in our system.'
          });
        }
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleHighestQualificationCourseChange = (course: string) => {
    setFormData(prev => ({
      ...prev,
      highestQualificationCourse: course,
      highestQualificationSpecialization: '',
    }));
  };

  const shouldShowHighestQualificationSpecialisation = () => {
    const coursesWithSpecialisation = ['BA', 'MA', 'BSc', 'MSc', 'MBA', 'Diploma Engg.', 'BTech', 'MTech', 'PhD', 'Other', 'OTHER'];
    return coursesWithSpecialisation.includes(formData.highestQualificationCourse);
  };

  const getAvailableHighestQualificationSpecialisations = () => {
    if (formData.highestQualificationCourse === 'PhD') {
      const allSpecs = new Set<string>();
      const excludeSpecs = ['(General)CBZ', '(General)PCB', '(General)PCM', 'Artificial Intelligence'];

      Object.values(SPECIALISATIONS).forEach(specs => {
        specs.forEach(spec => {
          if (!excludeSpecs.includes(spec)) {
            allSpecs.add(spec);
          }
        });
      });
      allSpecs.add('Pharmacy');
      return Array.from(allSpecs).sort();
    }
    return SPECIALISATIONS[formData.highestQualificationCourse] || SPECIALISATIONS['default'];
  };

  const getAvailableSpecialisations = () => {
    if (!formData.program) return [];

    if (formData.program === 'PhD') {
      const allSpecs = new Set<string>();
      const excludeSpecs = ['(General)CBZ', '(General)PCB', '(General)PCM', 'Artificial Intelligence'];

      Object.values(SPECIALISATIONS).forEach(specs => {
        specs.forEach(spec => {
          if (!excludeSpecs.includes(spec)) {
            allSpecs.add(spec);
          }
        });
      });
      allSpecs.add('Pharmacy');
      return Array.from(allSpecs).sort();
    }

    return SPECIALISATIONS[formData.program] || [];
  };

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
                    onClick={() => navigation.setCurrentPage('dashboard')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigation.setCurrentPage('enquiry')}
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
                    onClick={() => navigation.setCurrentPage('admission')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Admission Form
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigation.setCurrentPage('dashboard')}
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
              onClick={() => {
                setSuccess(false);
                setEmailStatus(null);
                setFormData({
                  fullName: '',
                  mobile: '',
                  whatsapp: '',
                  email: '',
                  city: '',
                  state: '',
                  program: '',
                  specialization: '',
                  highestQualification: '',
                  highestQualificationCourse: '',
                  highestQualificationSpecialization: '',
                  yearOfPassing: '',
                  totalExperience: '',
                  employmentStatus: '',
                  appointmentType: '',
                  preferredDate: '',
                  timeSlot: '',
                });
                setSelectedContact(null);
              }}
              className="px-8 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => navigation.setCurrentPage('dashboard')}
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
                  onClick={() => navigation.setCurrentPage('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => navigation.setCurrentPage('enquiry')}
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
                  onClick={() => navigation.setCurrentPage('admission')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
                >
                  <GraduationCap className="w-4 h-4" />
                  Admission Form
                </button>
              </div>
            </div>

            <button
              onClick={() => navigation.setCurrentPage('dashboard')}
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

            {previousAppointments.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Previous Appointments: {previousAppointments.length} appointment{previousAppointments.length !== 1 ? 's' : ''}
                </p>
                <div className="text-xs text-blue-700 space-y-1">
                  {previousAppointments.slice(0, 3).map((apt, idx) => (
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

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Program Details</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Interested <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="program"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value, specialization: '' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">Select a course</option>
                      {PROGRAMS.map(program => (
                        <option key={program.id} value={program.id}>{program.name}</option>
                      ))}
                    </select>
                  </div>

                  {formData.program && getAvailableSpecialisations().length > 0 && (
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="specialization"
                        disabled={!formData.program}
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {formData.program ? 'Select specialization' : 'Select a course first'}
                        </option>
                        {getAvailableSpecialisations().map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Educational & Professional Background</h3>
              </div>

              <div>
                <label htmlFor="highestQualification" className="block text-sm font-medium text-gray-700 mb-2">
                  Highest Qualification <span className="text-red-500">*</span>
                </label>
                <select
                  id="highestQualification"
                  value={formData.highestQualification}
                  onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select your highest qualification</option>
                  {QUALIFICATIONS.map(qual => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="highestQualificationCourse" className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <select
                    id="highestQualificationCourse"
                    value={formData.highestQualificationCourse}
                    onChange={(e) => handleHighestQualificationCourseChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select a course</option>
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="BA">BA</option>
                    <option value="BBA">BBA</option>
                    <option value="BCA">BCA</option>
                    <option value="BCom">BCom</option>
                    <option value="BEd">BEd</option>
                    <option value="BSc">BSc</option>
                    <option value="BTech">BTech</option>
                    <option value="Diploma Engg.">Diploma Engg.</option>
                    <option value="LLB">LLB</option>
                    <option value="LLM">LLM</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                    <option value="MSc">MSc</option>
                    <option value="MTech">MTech</option>
                    <option value="PhD">PhD</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                {shouldShowHighestQualificationSpecialisation() && (
                  <div>
                    <label htmlFor="highestQualificationSpecialization" className="block text-sm font-medium text-gray-700 mb-2">
                      Specialisation
                    </label>
                    <select
                      id="highestQualificationSpecialization"
                      disabled={!formData.highestQualificationCourse}
                      value={formData.highestQualificationSpecialization}
                      onChange={(e) => setFormData({ ...formData, highestQualificationSpecialization: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.highestQualificationCourse ? 'Select specialisation' : 'Select a course first'}
                      </option>
                      {getAvailableHighestQualificationSpecialisations().map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="yearOfPassing" className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Passing <span className="text-red-500">*</span>
                </label>
                <select
                  id="yearOfPassing"
                  value={formData.yearOfPassing}
                  onChange={(e) => setFormData({ ...formData, yearOfPassing: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select year of passing</option>
                  {generateYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="totalExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Experience
                </label>
                <select
                  id="totalExperience"
                  value={formData.totalExperience}
                  onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select years of experience</option>
                  {Array.from({ length: 51 }, (_, i) => i).map(years => (
                    <option key={years} value={years}>{years} {years === 1 ? 'year' : 'years'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Employment Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select your employment status</option>
                  {EMPLOYMENT_STATUS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="your.email@example.com"
                />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Your city"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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
