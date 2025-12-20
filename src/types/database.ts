export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          company: string | null;
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
          source: 'website' | 'referral' | 'social' | 'advertisement' | 'other' | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
          source?: 'website' | 'referral' | 'social' | 'advertisement' | 'other' | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
          source?: 'website' | 'referral' | 'social' | 'advertisement' | 'other' | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      enquiries: {
        Row: {
          id: string;
          contact_id: string | null;
          subject: string;
          message: string;
          enquiry_type: 'general' | 'product' | 'service' | 'support' | 'pricing';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'new' | 'in_progress' | 'resolved' | 'closed';
          assigned_to: string | null;
          annual_salary: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id?: string | null;
          subject: string;
          message: string;
          enquiry_type?: 'general' | 'product' | 'service' | 'support' | 'pricing';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'new' | 'in_progress' | 'resolved' | 'closed';
          assigned_to?: string | null;
          annual_salary?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string | null;
          subject?: string;
          message?: string;
          enquiry_type?: 'general' | 'product' | 'service' | 'support' | 'pricing';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'new' | 'in_progress' | 'resolved' | 'closed';
          assigned_to?: string | null;
          annual_salary?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          contact_id: string | null;
          title: string;
          description: string | null;
          appointment_date: string;
          duration_minutes: number;
          appointment_type: 'consultation' | 'demo' | 'meeting' | 'follow_up';
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          location: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id?: string | null;
          title: string;
          description?: string | null;
          appointment_date: string;
          duration_minutes?: number;
          appointment_type?: 'consultation' | 'demo' | 'meeting' | 'follow_up';
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          location?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string | null;
          title?: string;
          description?: string | null;
          appointment_date?: string;
          duration_minutes?: number;
          appointment_type?: 'consultation' | 'demo' | 'meeting' | 'follow_up';
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          location?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admissions: {
        Row: {
          id: string;
          contact_id: string | null;
          program: string;
          admission_date: string;
          status: 'applied' | 'under_review' | 'accepted' | 'rejected' | 'enrolled' | 'withdrawn';
          qualification: string[] | null;
          experience_years: number;
          previous_institution: string | null;
          documents_submitted: boolean;
          payment_status: 'pending' | 'partial' | 'completed';
          amount: number;
          amount_paid: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id?: string | null;
          program: string;
          admission_date: string;
          status?: 'applied' | 'under_review' | 'accepted' | 'rejected' | 'enrolled' | 'withdrawn';
          qualification?: string[] | null;
          experience_years?: number;
          previous_institution?: string | null;
          documents_submitted?: boolean;
          payment_status?: 'pending' | 'partial' | 'completed';
          amount?: number;
          amount_paid?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string | null;
          program?: string;
          admission_date?: string;
          status?: 'applied' | 'under_review' | 'accepted' | 'rejected' | 'enrolled' | 'withdrawn';
          qualification?: string[] | null;
          experience_years?: number;
          previous_institution?: string | null;
          documents_submitted?: boolean;
          payment_status?: 'pending' | 'partial' | 'completed';
          amount?: number;
          amount_paid?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          contact_id: string | null;
          interaction_type: 'enquiry' | 'appointment' | 'admission' | 'email' | 'call' | 'meeting' | 'note';
          reference_id: string | null;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id?: string | null;
          interaction_type: 'enquiry' | 'appointment' | 'admission' | 'email' | 'call' | 'meeting' | 'note';
          reference_id?: string | null;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string | null;
          interaction_type?: 'enquiry' | 'appointment' | 'admission' | 'email' | 'call' | 'meeting' | 'note';
          reference_id?: string | null;
          description?: string;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          admission_id: string;
          amount: number;
          payment_date: string;
          payment_mode: 'cash' | 'cheque' | 'card' | 'upi' | 'net_banking' | 'other';
          transaction_number: string | null;
          notes: string | null;
          receipt_file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          admission_id: string;
          amount: number;
          payment_date?: string;
          payment_mode?: 'cash' | 'cheque' | 'card' | 'upi' | 'net_banking' | 'other';
          transaction_number?: string | null;
          notes?: string | null;
          receipt_file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          admission_id?: string;
          amount?: number;
          payment_date?: string;
          payment_mode?: 'cash' | 'cheque' | 'card' | 'upi' | 'net_banking' | 'other';
          transaction_number?: string | null;
          notes?: string | null;
          receipt_file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
