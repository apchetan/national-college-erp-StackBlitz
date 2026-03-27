import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { convertToDBFormat } from '../utils/dateValidation';
import { validateEmail, validateMobile } from '../utils/validation';
import { Contact } from '../types/interfaces';
import { useFormOptions } from './useFormOptions';

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

export function useAppointmentForm() {
  const { specialisations } = useFormOptions();
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
    previousAppointments,
    emailStatus,
    handleSubmit,
    handleHighestQualificationCourseChange,
    shouldShowHighestQualificationSpecialisation,
    getAvailableHighestQualificationSpecialisations,
    getAvailableSpecialisations,
    resetForm,
  };
}
