/*
  # Create Student Status Table

  1. New Tables
    - `student_status`
      - `id` (uuid, primary key)
      - `admission_id` (uuid, foreign key to admissions)
      - `contact_id` (uuid, foreign key to contacts)
      - `program` (text, course name)
      - `specialisation` (text, optional)
      - Status tracking fields (20 fields):
        - courseware_exam_status
        - degree_status
        - enrolment_no_status
        - exam_status
        - lor_status
        - ms_hard_copy_status
        - ms_hard_copy_courier_status
        - ms_scan_status
        - provisional_degree_status
        - provisional_degree_courier_status
        - recommendation_letter_status
        - result_status
        - roll_no_status
        - university_phd_offer_letter_status
        - university_visit_status
        - university_visit1_status
        - university_visit2_status
        - university_visit3_status
        - viva_status
        - wes_status
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)
      - `updated_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `student_status` table
    - Add policies for authenticated users to manage their data
    - Admins can view and modify all records

  3. Indexes
    - Index on admission_id for faster lookups
    - Index on contact_id for faster lookups
    - Index on program for filtering
*/

-- Create student_status table
CREATE TABLE IF NOT EXISTS student_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id uuid REFERENCES admissions(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  program text NOT NULL,
  specialisation text,
  
  -- Status tracking fields (each can be: null, or specific values)
  courseware_exam_status text CHECK (courseware_exam_status IN ('Done', 'Not Done')),
  degree_status text CHECK (degree_status IN ('Received', 'Not Received')),
  enrolment_no_status text CHECK (enrolment_no_status IN ('Received', 'Not Received')),
  exam_status text CHECK (exam_status IN ('Done', 'Not Done')),
  lor_status text CHECK (lor_status IN ('Received', 'Not Received')),
  ms_hard_copy_status text CHECK (ms_hard_copy_status IN ('Received', 'Not Received')),
  ms_hard_copy_courier_status text CHECK (ms_hard_copy_courier_status IN ('Sent', 'Not Sent')),
  ms_scan_status text CHECK (ms_scan_status IN ('Received', 'Not Received')),
  provisional_degree_status text CHECK (provisional_degree_status IN ('Received', 'Not Received')),
  provisional_degree_courier_status text CHECK (provisional_degree_courier_status IN ('Sent', 'Not Sent')),
  recommendation_letter_status text CHECK (recommendation_letter_status IN ('Received', 'Not Received')),
  result_status text CHECK (result_status IN ('Declared', 'Not Declared')),
  roll_no_status text CHECK (roll_no_status IN ('Received', 'Not Received')),
  university_phd_offer_letter_status text CHECK (university_phd_offer_letter_status IN ('Received', 'Not Received')),
  university_visit_status text CHECK (university_visit_status IN ('Visited', 'Not Visited')),
  university_visit1_status text CHECK (university_visit1_status IN ('Visited', 'Not Visited')),
  university_visit2_status text CHECK (university_visit2_status IN ('Visited', 'Not Visited')),
  university_visit3_status text CHECK (university_visit3_status IN ('Visited', 'Not Visited')),
  viva_status text CHECK (viva_status IN ('Visited', 'Not Visited')),
  wes_status text CHECK (wes_status IN ('Received', 'Not Received')),
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_status_admission_id ON student_status(admission_id);
CREATE INDEX IF NOT EXISTS idx_student_status_contact_id ON student_status(contact_id);
CREATE INDEX IF NOT EXISTS idx_student_status_program ON student_status(program);
CREATE INDEX IF NOT EXISTS idx_student_status_created_at ON student_status(created_at DESC);

-- Enable RLS
ALTER TABLE student_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view student status records
CREATE POLICY "Users can view student status"
  ON student_status FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Users can insert student status records
CREATE POLICY "Users can insert student status"
  ON student_status FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Users can update student status records
CREATE POLICY "Users can update student status"
  ON student_status FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Users can delete student status records
CREATE POLICY "Users can delete student status"
  ON student_status FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_status_updated_at
  BEFORE UPDATE ON student_status
  FOR EACH ROW
  EXECUTE FUNCTION update_student_status_updated_at();