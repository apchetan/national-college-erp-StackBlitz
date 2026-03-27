import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, MessageSquare, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { ContactSearch } from './ContactSearch';
import { sanitizeDateValue, cleanDateForForm } from '../utils/dateValidation';
import { checkForDuplicates, PotentialDuplicate } from '../utils/duplicateDetection';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import { CITIES, QUALIFICATIONS, SPECIALISATIONS } from '../constants/formOptions';
import { Contact } from '../types/interfaces';

export function SupportForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [potentialDuplicates, setPotentialDuplicates] = useState<PotentialDuplicate[]>([]);
  const [forceCreate, setForceCreate] = useState(false);
  const [previousSupportForms, setPreviousSupportForms] = useState<Array<{ id: string; created_at: string }>>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    city: '',
    company: '',
    source: 'other' as const,
    program: '',
    specialisation: '',
    qualification: [] as string[],
    experienceYears: 0,
    previousInstitution: '',
    documentsSubmitted: false,
    amount: 0,
    amountPaid: 0,
    subject: '',
    message: '',
    enquiryType: 'general' as const,
    priority: 'medium' as const,
    notes: '',
  });

  useEffect(() => {
    if (selectedContact) {
      setFormData(prev => ({
        ...prev,
        firstName: selectedContact.first_name,
        lastName: selectedContact.last_name,
        email: selectedContact.email,
        phone: selectedContact.phone || '',
        dateOfBirth: cleanDateForForm(selectedContact.date_of_birth),
        city: selectedContact.city || '',
        company: selectedContact.company || '',
        source: selectedContact.source as any,
      }));

      fetchPreviousSupportForms(selectedContact.id);
    } else {
      setPreviousSupportForms([]);
    }
  }, [selectedContact]);

  const fetchPreviousSupportForms = async (contactId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_forms')
        .select('id, created_at')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreviousSupportForms(data || []);
    } catch (err) {
      console.error('Error fetching previous support forms:', err);
      setPreviousSupportForms([]);
    }
  };

  const handleQualificationToggle = (qual: string) => {
    setFormData(prev => ({
      ...prev,
      qualification: prev.qualification.includes(qual)
        ? prev.qualification.filter(q => q !== qual)
        : [...prev.qualification, qual]
    }));
  };

  const handleProgramChange = (program: string) => {
    setFormData(prev => ({
      ...prev,
      program,
      specialisation: '',
    }));
  };

  const shouldShowSpecialisation = () => {
    const programsWithSpecialisation = ['BA', 'MA', 'BSc', 'MSc', 'MBA', 'Diploma Engg.', 'BTech', 'MTech', 'PhD', 'Other', 'OTHER'];
    return programsWithSpecialisation.includes(formData.program);
  };

  const getAvailableSpecialisations = () => {
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
    return SPECIALISATIONS[formData.program] || SPECIALISATIONS['default'];
  };

  const handleClearForm = () => {
    setSelectedContact(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      city: '',
      company: '',
      source: 'other',
      program: '',
      specialisation: '',
      qualification: [],
      experienceYears: 0,
      previousInstitution: '',
      documentsSubmitted: false,
      amount: 0,
      amountPaid: 0,
      subject: '',
      message: '',
      enquiryType: 'general',
      priority: 'medium',
      notes: '',
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let contactId: string;

      if (selectedContact) {
        contactId = selectedContact.id;
      } else {
        if (!forceCreate) {
          const duplicates = await checkForDuplicates({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          });

          if (duplicates.length > 0) {
            setPotentialDuplicates(duplicates);
            setLoading(false);
            return;
          }
        }

        const contactData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: sanitizeDateValue(formData.dateOfBirth),
          city: formData.city || null,
          company: formData.company || null,
          source: formData.source,
          status: 'new' as const,
        };

        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .insert(contactData)
          .select()
          .single();

        if (contactError) throw contactError;
        contactId = contact.id;
      }

      const supportData = {
        contact_id: contactId,
        subject: formData.subject,
        message: formData.message,
        enquiry_type: formData.enquiryType,
        priority: formData.priority,
        status: 'new' as const,
      };

      const { error: supportError } = await supabase
        .from('support_forms')
        .insert(supportData);

      if (supportError) throw supportError;

      setSuccess(true);
      setSelectedContact(null);
      setForceCreate(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        city: '',
        company: '',
        source: 'other',
        program: '',
        specialisation: '',
        qualification: [],
        experienceYears: 0,
        previousInstitution: '',
        documentsSubmitted: false,
        amount: 0,
        amountPaid: 0,
        subject: '',
        message: '',
        enquiryType: 'general',
        priority: 'medium',
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = (duplicate: PotentialDuplicate) => {
    setSelectedContact({
      id: duplicate.id,
      first_name: duplicate.first_name,
      last_name: duplicate.last_name,
      email: duplicate.email,
      phone: duplicate.phone,
      date_of_birth: null,
      city: null,
      company: null,
      source: 'other',
    });
    setPotentialDuplicates([]);
  };

  const handleCreateNew = () => {
    setForceCreate(true);
    setPotentialDuplicates([]);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 0);
  };

  const handleCancelDuplicate = () => {
    setPotentialDuplicates([]);
    setForceCreate(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Support Form</h2>
            <p className="text-gray-600">Request support or assistance</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Support request submitted successfully!</p>
              <p className="text-sm text-green-700 mt-1">We'll get back to you shortly.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-900">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                    Course
                  </label>
                  <select
                    id="program"
                    value={formData.program}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select a course</option>
                    <option value="PhD">PhD</option>
                    <option value="BTech">BTech</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                    <option value="MSc">MSc</option>
                    <option value="MTech">MTech</option>
                    <option value="Diploma Engg.">Diploma Engg.</option>
                    <option value="LLB">LLB</option>
                    <option value="LLM">LLM</option>
                    <option value="BSc">BSc</option>
                    <option value="BBA">BBA</option>
                    <option value="BCA">BCA</option>
                    <option value="BCom">BCom</option>
                    <option value="BA">BA</option>
                    <option value="BEd">BEd</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                {shouldShowSpecialisation() && (
                  <div>
                    <label htmlFor="specialisation" className="block text-sm font-medium text-gray-700 mb-2">
                      Specialisation
                    </label>
                    <select
                      id="specialisation"
                      disabled={!formData.program}
                      value={formData.specialisation}
                      onChange={(e) => setFormData({ ...formData, specialisation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.program ? 'Select specialisation' : 'Select a course first'}
                      </option>
                      {getAvailableSpecialisations().map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {formData.enquiryType !== 'support' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Highest Qualification</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="program-edu" className="block text-sm font-medium text-gray-700 mb-2">
                      Course
                    </label>
                    <select
                      id="program-edu"
                      value={formData.program}
                      onChange={(e) => handleProgramChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

                  {shouldShowSpecialisation() && (
                    <div>
                      <label htmlFor="specialisation-edu" className="block text-sm font-medium text-gray-700 mb-2">
                        Specialisation
                      </label>
                      <select
                        id="specialisation-edu"
                        disabled={!formData.program}
                        value={formData.specialisation}
                        onChange={(e) => setFormData({ ...formData, specialisation: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {formData.program ? 'Select specialisation' : 'Select a course first'}
                        </option>
                        {getAvailableSpecialisations().map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="previousInstitution" className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Institution
                    </label>
                    <input
                      type="text"
                      id="previousInstitution"
                      value={formData.previousInstitution}
                      onChange={(e) => setFormData({ ...formData, previousInstitution: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="experienceYears"
                      min="0"
                      max="50"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>

            {previousSupportForms.length > 0 && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Multiple Entries: {previousSupportForms.length} previous support form{previousSupportForms.length === 1 ? '' : 's'}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Earlier submission dates: {previousSupportForms.slice(0, 5).map(s => new Date(s.created_at).toLocaleDateString()).join(', ')}
                  {previousSupportForms.length > 5 && ` and ${previousSupportForms.length - 5} more`}
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
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select a city</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
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

              {formData.enquiryType !== 'support' && (
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
              )}
            </div>
          </div>

          {formData.enquiryType !== 'general' && (
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleClearForm}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition flex items-center justify-center gap-2"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              {loading ? 'Submitting...' : 'Submit Support Request'}
            </button>
          </div>
        </form>
      </div>

      {potentialDuplicates.length > 0 && (
        <DuplicateWarningModal
          duplicates={potentialDuplicates}
          onUseExisting={handleUseExisting}
          onCreateNew={handleCreateNew}
          onCancel={handleCancelDuplicate}
        />
      )}
    </div>
  );
}
