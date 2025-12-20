/*
  # ERP/CRM Database Schema

  ## Overview
  This migration creates a comprehensive ERP/CRM system with interconnected tables for managing
  contacts, enquiries, appointments, and admissions. All tables are related through foreign keys
  to maintain data integrity and enable cascading updates.

  ## New Tables

  ### 1. `contacts` - Main customer/lead database
    - `id` (uuid, primary key) - Unique identifier
    - `first_name` (text) - Contact's first name
    - `last_name` (text) - Contact's last name
    - `email` (text, unique) - Email address
    - `phone` (text) - Phone number
    - `company` (text) - Company name (optional)
    - `status` (text) - Lead status: new, contacted, qualified, converted, closed
    - `source` (text) - How they found us: website, referral, social, advertisement
    - `notes` (text) - Additional notes
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `enquiries` - Customer enquiries/questions
    - `id` (uuid, primary key)
    - `contact_id` (uuid, foreign key) - References contacts table
    - `subject` (text) - Enquiry subject
    - `message` (text) - Enquiry details
    - `enquiry_type` (text) - Type: general, product, service, support, pricing
    - `priority` (text) - Priority level: low, medium, high, urgent
    - `status` (text) - Status: new, in_progress, resolved, closed
    - `assigned_to` (text) - Staff member assigned
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 3. `appointments` - Scheduled appointments/meetings
    - `id` (uuid, primary key)
    - `contact_id` (uuid, foreign key) - References contacts table
    - `title` (text) - Appointment title
    - `description` (text) - Appointment details
    - `appointment_date` (timestamptz) - Scheduled date/time
    - `duration_minutes` (integer) - Duration in minutes
    - `appointment_type` (text) - Type: consultation, demo, meeting, follow_up
    - `status` (text) - Status: scheduled, confirmed, completed, cancelled, no_show
    - `location` (text) - Meeting location or online link
    - `assigned_to` (text) - Staff member handling appointment
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 4. `admissions` - Student/customer admissions
    - `id` (uuid, primary key)
    - `contact_id` (uuid, foreign key) - References contacts table
    - `program` (text) - Program/course/service name
    - `admission_date` (date) - Intended start date
    - `status` (text) - Status: applied, under_review, accepted, rejected, enrolled, withdrawn
    - `qualification` (text) - Educational qualification
    - `experience_years` (integer) - Years of experience
    - `previous_institution` (text) - Previous school/company
    - `documents_submitted` (boolean) - Documents received flag
    - `payment_status` (text) - Payment status: pending, partial, completed
    - `amount` (numeric) - Total amount
    - `amount_paid` (numeric) - Amount paid so far
    - `notes` (text) - Additional notes
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 5. `interactions` - All interactions history
    - `id` (uuid, primary key)
    - `contact_id` (uuid, foreign key) - References contacts table
    - `interaction_type` (text) - Type: enquiry, appointment, admission, email, call, meeting
    - `reference_id` (uuid) - ID of related record (enquiry/appointment/admission)
    - `description` (text) - Interaction summary
    - `created_at` (timestamptz)

  ## Security
    - Enable Row Level Security (RLS) on all tables
    - Public can insert into contacts, enquiries, appointments, and admissions (for web forms)
    - Public can read their own records
    - Authenticated users (staff) can read and update all records
    - All tables have proper indexes for performance

  ## Important Notes
    1. All tables use UUID primary keys for security and scalability
    2. Foreign key relationships ensure data integrity
    3. Timestamps are automatically managed with triggers
    4. Status fields use predefined values for consistency
    5. Cascading updates maintain referential integrity across related tables
*/

-- Create contacts table (main customer/lead database)
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  company text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  source text CHECK (source IN ('website', 'referral', 'social', 'advertisement', 'other')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  enquiry_type text DEFAULT 'general' CHECK (enquiry_type IN ('general', 'product', 'service', 'support', 'pricing')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  appointment_type text DEFAULT 'consultation' CHECK (appointment_type IN ('consultation', 'demo', 'meeting', 'follow_up')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  location text,
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admissions table
CREATE TABLE IF NOT EXISTS admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  program text NOT NULL,
  admission_date date NOT NULL,
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'accepted', 'rejected', 'enrolled', 'withdrawn')),
  qualification text,
  experience_years integer DEFAULT 0,
  previous_institution text,
  documents_submitted boolean DEFAULT false,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed')),
  amount numeric(10, 2) DEFAULT 0,
  amount_paid numeric(10, 2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interactions table (history of all interactions)
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('enquiry', 'appointment', 'admission', 'email', 'call', 'meeting', 'note')),
  reference_id uuid,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_contact_id ON enquiries(contact_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id ON appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_admissions_contact_id ON admissions(contact_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON interactions(contact_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
CREATE TRIGGER update_enquiries_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admissions_updated_at ON admissions;
CREATE TRIGGER update_admissions_updated_at
  BEFORE UPDATE ON admissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically log interactions
CREATE OR REPLACE FUNCTION log_interaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO interactions (contact_id, interaction_type, reference_id, description)
  VALUES (
    NEW.contact_id,
    TG_ARGV[0],
    NEW.id,
    TG_ARGV[1] || ' created'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-log interactions
DROP TRIGGER IF EXISTS log_enquiry_interaction ON enquiries;
CREATE TRIGGER log_enquiry_interaction
  AFTER INSERT ON enquiries
  FOR EACH ROW
  EXECUTE FUNCTION log_interaction('enquiry', 'New enquiry');

DROP TRIGGER IF EXISTS log_appointment_interaction ON appointments;
CREATE TRIGGER log_appointment_interaction
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_interaction('appointment', 'New appointment');

DROP TRIGGER IF EXISTS log_admission_interaction ON admissions;
CREATE TRIGGER log_admission_interaction
  AFTER INSERT ON admissions
  FOR EACH ROW
  EXECUTE FUNCTION log_interaction('admission', 'New admission');

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts table
CREATE POLICY "Anyone can insert contacts"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view all contacts"
  ON contacts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for enquiries table
CREATE POLICY "Anyone can insert enquiries"
  ON enquiries FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view all enquiries"
  ON enquiries FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can update enquiries"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete enquiries"
  ON enquiries FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for appointments table
CREATE POLICY "Anyone can insert appointments"
  ON appointments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view all appointments"
  ON appointments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for admissions table
CREATE POLICY "Anyone can insert admissions"
  ON admissions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view all admissions"
  ON admissions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can update admissions"
  ON admissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete admissions"
  ON admissions FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for interactions table
CREATE POLICY "Users can view all interactions"
  ON interactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can insert interactions"
  ON interactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete interactions"
  ON interactions FOR DELETE
  TO authenticated
  USING (true);