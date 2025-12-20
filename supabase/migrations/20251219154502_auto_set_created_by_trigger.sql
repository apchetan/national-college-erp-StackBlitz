/*
  # Automatically Set Created By Field

  ## Purpose
  This migration creates database triggers that automatically set the `created_by` field
  to the current authenticated user's ID when new records are created.

  ## Changes Made
  
  ### 1. Function to set created_by
  - Create a reusable function that sets created_by to auth.uid()
  
  ### 2. Triggers for automatic tracking
  - Add trigger to contacts table
  - Add trigger to enquiries table
  - Add trigger to appointments table
  - Add trigger to admissions table
  - Add trigger to student_status table
  - Add trigger to payments table
  
  ## Notes
  - Triggers only fire on INSERT operations
  - Uses auth.uid() to get the current user
  - Will set created_by automatically for all new records
*/

-- Create function to automatically set created_by
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for contacts
DROP TRIGGER IF EXISTS set_contacts_created_by ON contacts;
CREATE TRIGGER set_contacts_created_by
  BEFORE INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- Add trigger for enquiries
DROP TRIGGER IF EXISTS set_enquiries_created_by ON enquiries;
CREATE TRIGGER set_enquiries_created_by
  BEFORE INSERT ON enquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- Add trigger for appointments
DROP TRIGGER IF EXISTS set_appointments_created_by ON appointments;
CREATE TRIGGER set_appointments_created_by
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- Add trigger for admissions
DROP TRIGGER IF EXISTS set_admissions_created_by ON admissions;
CREATE TRIGGER set_admissions_created_by
  BEFORE INSERT ON admissions
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- Add trigger for student_status
DROP TRIGGER IF EXISTS set_student_status_created_by ON student_status;
CREATE TRIGGER set_student_status_created_by
  BEFORE INSERT ON student_status
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- Add trigger for payments
DROP TRIGGER IF EXISTS set_payments_created_by ON payments;
CREATE TRIGGER set_payments_created_by
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();