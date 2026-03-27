export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  mobile1?: string | null;
  mobile2?: string | null;
  date_of_birth?: string | null;
  city?: string | null;
  company?: string | null;
  source?: string;
  status?: string;
  created_at?: string;
  created_by?: string;
  notes?: string;
  total_experience?: number | null;
}

export interface Enquiry {
  id: string;
  contact_id: string;
  subject: string;
  message: string;
  enquiry_type: string;
  priority: string;
  status: string;
  created_at: string;
  created_by?: string;
  annual_salary?: number;
  job_title?: string;
  date_of_application?: string;
  current_location?: string;
  preferred_locations?: string[];
  total_experience?: string;
  current_company_name?: string;
  current_company_designation?: string;
  department?: string;
  role?: string;
  industry?: string;
  key_skills?: string[];
  notice_period?: string;
  resume_headline?: string;
  summary?: string;
  ug_degree?: string;
  ug_specialization?: string;
  ug_institute?: string;
  ug_graduation_year?: number;
  pg_degree?: string;
  pg_specialization?: string;
  pg_institute?: string;
  pg_graduation_year?: number;
  doctorate_degree?: string;
  doctorate_specialization?: string;
  doctorate_institute?: string;
  doctorate_graduation_year?: number;
  gender?: string;
  marital_status?: string;
  hometown?: string;
  pin_code?: string;
  work_permit_usa?: boolean;
  permanent_address?: string;
  phd_regular_while_working?: string;
  receive_call_related?: string;
  phd_area_of_interest?: string;
  looking_for?: string;
  attend_phd_webinar?: string;
  assigned_to?: string | null;
}

export interface Appointment {
  id: string;
  contact_id: string;
  appointment_date: string;
  title: string;
  description?: string;
  appointment_type?: string;
  status: string;
  location?: string;
  duration_minutes?: number;
  created_at: string;
  created_by?: string;
  program?: string;
  specialization?: string;
  time_slot?: string;
  attendance?: string | null;
  email_sent?: boolean;
  email_error?: string | null;
  assigned_to?: string | null;
  contacts?: Contact;
}

export interface Admission {
  id: string;
  contact_id: string;
  program: string;
  specialisation?: string | null;
  status: string;
  qualification?: string[];
  experience_years?: number;
  previous_institution?: string;
  documents_submitted?: boolean;
  payment_status?: string;
  amount?: number;
  amount_paid?: number;
  notes?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  admission_date?: string;
  contacts?: Contact;
}

export interface StudentStatus {
  id: string;
  admission_id: string;
  contact_id: string;
  program: string;
  specialisation?: string;
  courseware_exam_status?: string;
  degree_status?: string;
  enrolment_no_status?: string;
  exam_status?: string;
  lor_status?: string;
  ms_hard_copy_status?: string;
  ms_hard_copy_courier_status?: string;
  ms_scan_status?: string;
  provisional_degree_status?: string;
  provisional_degree_courier_status?: string;
  recommendation_letter_status?: string;
  result_status?: string;
  roll_no_status?: string;
  university_phd_offer_letter_status?: string;
  university_visit_status?: string;
  university_visit1_status?: string;
  university_visit2_status?: string;
  university_visit3_status?: string;
  viva_status?: string;
  wes_status?: string;
  roll_no_values?: string[];
  roll_no_checkboxes?: boolean[];
  ms_scan_checkboxes?: boolean[];
  ms_hard_copy_checkboxes?: boolean[];
  ms_hard_copy_courier_checkboxes?: boolean[];
  provisional_degree_issued?: boolean;
  degree_issued?: boolean;
  university_phd_offer_letter_issued?: boolean;
  enrolment_no_value?: string;
  provisional_degree_courier_docket?: string;
  degree_courier_docket?: string;
  university_phd_offer_letter_courier_docket?: string;
  lor_issued?: boolean;
  lor_courier_docket?: string;
  recommendation_letter_issued?: boolean;
  recommendation_letter_courier_docket?: string;
  wes_issued?: boolean;
  wes_courier_docket?: string;
  ms_scan_issued?: boolean;
  ms_scan_courier_docket?: string;
  ms_hard_copy_issued?: boolean;
  ms_hard_copy_courier_docket?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  admission_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  transaction_number?: string | null;
  receipt_file_url?: string | null;
  notes?: string | null;
  created_at: string;
  created_by?: string;
  updated_at: string;
  receipt_date?: string | null;
  balance_fee?: number | null;
  counselor?: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'editor' | 'viewer';
  is_active: boolean;
  created_at?: string;
}

export interface ContactReport {
  contact: Contact;
  enquiries: Enquiry[];
  appointments: Appointment[];
  admissions: Admission[];
  studentStatuses: StudentStatus[];
  payments: Payment[];
}

export interface Permission {
  id?: string;
  user_id: string;
  resource: 'contacts' | 'enquiries' | 'appointments' | 'admissions' | 'payments' | 'support' | 'student_status' | 'all_forms';
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_import: boolean;
}
