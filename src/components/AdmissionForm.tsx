import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Upload, CheckCircle, AlertCircle, ArrowLeft,
  User, Briefcase, GraduationCap, FileText, LayoutDashboard
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

export function AdmissionForm() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [previousAdmissions, setPreviousAdmissions] = useState<Array<{ id: string; created_at: string; program: string }>>([]);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    mobile1: '',
    mobile2: '',
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
    resume: null,
    idProof: null,
    certificates: null,
  });

  useEffect(() => {
    if (selectedContact) {
      setFormData(prev => ({
        ...prev,
        fullName: `${selectedContact.first_name} ${selectedContact.last_name}`.trim(),
        email: selectedContact.email,
        mobile: selectedContact.phone || '',
        mobile1: selectedContact.mobile1 || '',
        mobile2: selectedContact.mobile2 || '',
        whatsapp: selectedContact.phone || '',
        city: selectedContact.city || '',
      }));

      fetchPreviousAdmissions(selectedContact.id);
    } else {
      setPreviousAdmissions([]);
    }
  }, [selectedContact]);

  const fetchPreviousAdmissions = async (contactId: string) => {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('id, created_at, program')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreviousAdmissions(data || []);
    } catch (err) {
      console.error('Error fetching previous admissions:', err);
      setPreviousAdmissions([]);
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
    if (!formData.state) {
      setError('State is required');
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
            mobile1: formData.mobile1 || null,
            mobile2: formData.mobile2 || null,
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

      const { error: admissionError } = await supabase
        .from('admissions')
        .insert({
          contact_id: contactId,
          program: formData.program,
          specialisation: formData.specialization || null,
          qualification: [formData.highestQualification],
          experience_years: formData.totalExperience ? parseInt(formData.totalExperience) : 0,
          previous_institution: null,
          documents_submitted: false,
          payment_status: 'pending',
          amount: 0,
          amount_paid: 0,
          status: 'applied',
          notes: `Qualification: ${formData.highestQualification}\nYear of Passing: ${formData.yearOfPassing}\nTotal Experience: ${formData.totalExperience ? formData.totalExperience + ' years' : 'Not specified'}\nEmployment: ${formData.employmentStatus}\nState: ${formData.state}`,
        });

      if (admissionError) throw admissionError;

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit admission form');
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div className="leading-none">
                    <h1 className="text-xl font-bold text-gray-900 leading-none mb-0.5">Mirror</h1>
                    <p className="text-xs font-semibold text-amber-600 leading-none">(ERP-CRM)</p>
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
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-amber-600 text-white">
                    <GraduationCap className="w-4 h-4" />
                    Admission Form
                  </div>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Admission Application Submitted!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for applying to National College. Our admissions team will review your application and contact you shortly to discuss the next steps in the enrollment process.
          </p>
          <div className="bg-amber-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Application Details:</h3>
            <div className="space-y-2 text-left">
              <p className="text-gray-700"><span className="font-medium">Program:</span> {formData.program} - {formData.specialization}</p>
              <p className="text-gray-700"><span className="font-medium">Name:</span> {formData.fullName}</p>
              <p className="text-gray-700"><span className="font-medium">Mobile:</span> {formData.mobile}</p>
              <p className="text-gray-700"><span className="font-medium">Email:</span> {formData.email}</p>
              <p className="text-gray-700"><span className="font-medium">Qualification:</span> {formData.highestQualification}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSuccess(false);
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
                  yearOfPassing: '',
                  employmentStatus: '',
                  resume: null,
                  idProof: null,
                  certificates: null,
                });
                setSelectedContact(null);
              }}
              className="px-8 py-3 bg-amber-900 text-white rounded-lg font-semibold hover:bg-amber-800 transition"
            >
              Submit Another Application
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
                <div className="p-2 bg-amber-600 rounded-lg">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div className="leading-none">
                  <h1 className="text-xl font-bold text-gray-900 leading-none mb-0.5">Mirror</h1>
                  <p className="text-xs font-semibold text-amber-600 leading-none">(ERP-CRM)</p>
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
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-amber-600 text-white">
                  <GraduationCap className="w-4 h-4" />
                  Admission Form
                </div>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-amber-900" />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Upload className="w-6 h-6 text-amber-900" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Upload Documents</h3>
                  <p className="text-sm text-gray-600 mt-1">Optional - You can upload these later</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'resume', label: 'Resume / CV', accept: '.pdf,.doc,.docx' },
                  { id: 'idProof', label: 'ID Proof (Aadhar/PAN/Passport)', accept: '.pdf,.jpg,.jpeg,.png' },
                  { id: 'certificates', label: 'Educational Certificates', accept: '.pdf,.jpg,.jpeg,.png' }
                ].map(doc => (
                  <div key={doc.id} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-amber-400 transition">
                    <label htmlFor={doc.id} className="cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{doc.label}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formData[doc.id as keyof FormData] ?
                              (formData[doc.id as keyof FormData] as File).name :
                              `Click to upload or drag and drop`}
                          </p>
                        </div>
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="file"
                        id={doc.id}
                        accept={doc.accept}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData({ ...formData, [doc.id]: file });
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-lg font-semibold text-lg hover:from-amber-800 hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Submitting Application...' : 'Submit Admission Application'}
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

      <footer className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-8 h-8 text-amber-400" />
            <h3 className="text-2xl font-bold">National College</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4 text-amber-100">
            <a href="https://www.nationalcollege.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              www.nationalcollege.in
            </a>
            <span className="hidden md:inline">|</span>
            <a href="tel:08068507627" className="hover:text-white transition">
              080 68507627
            </a>
          </div>
          <div className="inline-block bg-amber-500 text-amber-900 px-4 py-2 rounded-full font-semibold text-sm">
            Established 1998 - Excellence in Education
          </div>
        </div>
      </footer>
    </div>
  );
}
