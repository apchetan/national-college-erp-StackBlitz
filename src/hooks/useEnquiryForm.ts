import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { sanitizeDateValue, cleanDateForForm } from '../utils/dateValidation';
import { checkForDuplicates, PotentialDuplicate } from '../utils/duplicateDetection';
import { Contact } from '../types/interfaces';

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
  source: 'email_naukri' | 'email_foundit' | 'referred_student_friend' | 'referred_staff' | 'sms' | 'linkedin' | 'facebook' | 'google' | 'instagram' | 'youtube' | 'whatsapp' | 'webchat' | 'missed_call' | 'other';
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

export function useEnquiryForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [potentialDuplicates, setPotentialDuplicates] = useState<PotentialDuplicate[]>([]);
  const [forceCreate, setForceCreate] = useState(false);
  const [previousEnquiries, setPreviousEnquiries] = useState<Array<{ id: string; created_at: string }>>([]);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile1: '',
    mobile2: '',
    dateOfBirth: '',
    city: '',
    company: '',
    source: 'other',
    program: '',
    specialisation: '',
    subject: '',
    message: '',
    highestQualification: '',
    highestQualificationCourse: '',
    highestQualificationSpecialization: '',
    yearOfPassing: '',
    totalExperience: '',
    employmentStatus: '',
  });

  useEffect(() => {
    if (selectedContact) {
      setFormData(prev => ({
        ...prev,
        firstName: selectedContact.first_name,
        lastName: selectedContact.last_name,
        email: selectedContact.email,
        phone: selectedContact.phone || '',
        mobile1: selectedContact.mobile1 || '',
        mobile2: selectedContact.mobile2 || '',
        dateOfBirth: cleanDateForForm(selectedContact.date_of_birth),
        city: selectedContact.city || '',
        company: selectedContact.company || '',
        source: selectedContact.source as any,
      }));

      fetchPreviousEnquiries(selectedContact.id);
    } else {
      setPreviousEnquiries([]);
    }
  }, [selectedContact]);

  const fetchPreviousEnquiries = async (contactId: string) => {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('id, created_at')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreviousEnquiries(data || []);
    } catch (err) {
      console.error('Error fetching previous enquiries:', err);
      setPreviousEnquiries([]);
    }
  };

  const shouldShowSpecialisation = (course: string) => {
    const coursesWithSpecialisation = ['BA', 'MA', 'BSc', 'MSc', 'MBA', 'Diploma Engg.', 'BTech', 'MTech', 'PhD', 'Other', 'OTHER'];
    return coursesWithSpecialisation.includes(course);
  };

  const getAvailableSpecialisations = (course: string, specialisations: Record<string, string[]>) => {
    if (course === 'PhD') {
      const allSpecs = new Set<string>();
      const excludeSpecs = ['(General)CBZ', '(General)PCB', '(General)PCM', 'Artificial Intelligence'];

      Object.values(specialisations).forEach(specs => {
        specs.forEach(spec => {
          if (!excludeSpecs.includes(spec)) {
            allSpecs.add(spec);
          }
        });
      });
      allSpecs.add('Pharmacy');
      return Array.from(allSpecs).sort();
    }
    return specialisations[course] || specialisations['default'] || [];
  };

  const handleProgramChange = (program: string) => {
    setFormData(prev => ({
      ...prev,
      program,
      specialisation: '',
    }));
  };

  const handleHighestQualificationCourseChange = (course: string) => {
    setFormData(prev => ({
      ...prev,
      highestQualificationCourse: course,
      highestQualificationSpecialization: '',
    }));
  };

  const handleClearForm = () => {
    setSelectedContact(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      mobile1: '',
      mobile2: '',
      dateOfBirth: '',
      city: '',
      company: '',
      source: 'other',
      program: '',
      specialisation: '',
      subject: '',
      message: '',
      highestQualification: '',
      highestQualificationCourse: '',
      highestQualificationSpecialization: '',
      yearOfPassing: '',
      totalExperience: '',
      employmentStatus: '',
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
          mobile1: formData.mobile1 || null,
          mobile2: formData.mobile2 || null,
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

      const enquiryData = {
        contact_id: contactId,
        subject: formData.subject,
        message: formData.message,
        enquiry_type: 'general' as const,
        priority: 'medium' as const,
        status: 'new' as const,
      };

      const { error: enquiryError } = await supabase
        .from('enquiries')
        .insert(enquiryData);

      if (enquiryError) throw enquiryError;

      setSuccess(true);
      setSelectedContact(null);
      setForceCreate(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mobile1: '',
        mobile2: '',
        dateOfBirth: '',
        city: '',
        company: '',
        source: 'other',
        program: '',
        specialisation: '',
        subject: '',
        message: '',
        highestQualification: '',
        highestQualificationCourse: '',
        highestQualificationSpecialization: '',
        yearOfPassing: '',
        totalExperience: '',
        employmentStatus: '',
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
      mobile1: null,
      mobile2: null,
      date_of_birth: null,
      city: null,
      company: null,
      source: 'other',
    });
    setPotentialDuplicates([]);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 0);
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

  return {
    formData,
    setFormData,
    loading,
    success,
    error,
    selectedContact,
    setSelectedContact,
    previousEnquiries,
    potentialDuplicates,
    handleSubmit,
    handleProgramChange,
    handleHighestQualificationCourseChange,
    shouldShowSpecialisation,
    getAvailableSpecialisations,
    handleClearForm,
    handleUseExisting,
    handleCreateNew,
    handleCancelDuplicate,
  };
}
