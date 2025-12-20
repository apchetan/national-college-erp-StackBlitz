/*
  # Fix log_interaction Function to Use SECURITY DEFINER

  1. Problem
    - The log_interaction function runs with the permissions of the calling user
    - When appointments are created, the trigger tries to insert into interactions table
    - Users without 'create' permission on interactions get blocked by RLS policies
    - This causes "new row violates row-level security policy for table interactions" error

  2. Solution
    - Recreate log_interaction function with SECURITY DEFINER
    - This allows the function to bypass RLS policies when creating interaction logs
    - The function will run with the permissions of the function owner (postgres)

  3. Changes
    - Drop existing log_interaction function
    - Recreate with SECURITY DEFINER attribute
    - Keep the same logic and search_path security setting

  4. Security Notes
    - Function only inserts audit/log records, which is safe
    - Uses parameterized insert, not dynamic SQL
    - search_path is still set to prevent injection attacks
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS log_interaction() CASCADE;

-- Recreate with SECURITY DEFINER
CREATE OR REPLACE FUNCTION log_interaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

-- Recreate all the triggers that use this function
CREATE TRIGGER log_enquiry_interaction
  AFTER INSERT ON enquiries
  FOR EACH ROW
  EXECUTE FUNCTION log_interaction('enquiry', 'New enquiry');

CREATE TRIGGER log_appointment_interaction
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_interaction('appointment', 'New appointment');

CREATE TRIGGER log_admission_interaction
  AFTER INSERT ON admissions
  FOR EACH ROW
  EXECUTE FUNCTION log_interaction('admission', 'New admission');
