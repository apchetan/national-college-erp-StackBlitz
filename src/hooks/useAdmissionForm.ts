import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { validateEmail, validateMobile } from '../utils/validation';
import { Contact } from '../types/interfaces';
import { useFormOptions } from './useFormOptions';

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

export function useAdmissionForm() {
  const { specialisations } = useFormOptions();
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
          Object.values(specialisations).forEach(specs => {
            specs.forEach(spec => {
              if (!excludeSpecs.includes(spec)) {
                allSpecs.add(spec);
              }
            });
          });
          allSpecs.add('Pharmacy');
          return Array.from(allSpecs);
        })()
      : specialisations[formData.program] || [];

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
    return specialisations[formData.highestQualificationCourse] || specialisations['default'];
  };

  const getAvailableSpecialisations = () => {
    if (!formData.program) return [];

    if (formData.program === 'PhD') {
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

    return specialisations[formData.program] || [];
  };

  const resetForm = () => {
    setSuccess(false);
    setFormData({
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
    setSelectedContact(null);
  };

  return {
    formData,
    setFormData,
    loading,
    success,
    error,
    selectedContact,
    setSelectedContact,
    previousAdmissions,
    handleSubmit,
    handleHighestQualificationCourseChange,
    shouldShowHighestQualificationSpecialisation,
    getAvailableHighestQualificationSpecialisations,
    getAvailableSpecialisations,
    resetForm,
  };
}
