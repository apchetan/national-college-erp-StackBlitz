/*
  # Add Email Status Fields to Appointments Table
  
  ## Purpose
  Track email delivery status for appointment booking confirmations sent to both
  applicants and administrators.
  
  ## New Fields
  - `email_applicant_status` (text) - Status of email sent to applicant (pending/sent/failed)
  - `email_admin_status` (text) - Status of email sent to admin (pending/sent/failed)
  - `email_last_error` (text) - Last error message if email failed (nullable)
  - `email_sent_at` (timestamptz) - Timestamp when emails were successfully sent (nullable)
  
  ## Default Values
  - Both status fields default to 'pending' for new appointments
  - Error and sent_at fields are nullable and default to NULL
  
  ## Use Cases
  - Track whether confirmation emails were sent successfully
  - Enable resending of failed emails from admin panel
  - Provide visibility into email delivery issues
*/

-- Add email status fields to appointments table
DO $$
BEGIN
  -- Add email_applicant_status field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'email_applicant_status'
  ) THEN
    ALTER TABLE appointments 
    ADD COLUMN email_applicant_status text DEFAULT 'pending' 
    CHECK (email_applicant_status IN ('pending', 'sent', 'failed'));
  END IF;

  -- Add email_admin_status field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'email_admin_status'
  ) THEN
    ALTER TABLE appointments 
    ADD COLUMN email_admin_status text DEFAULT 'pending' 
    CHECK (email_admin_status IN ('pending', 'sent', 'failed'));
  END IF;

  -- Add email_last_error field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'email_last_error'
  ) THEN
    ALTER TABLE appointments 
    ADD COLUMN email_last_error text;
  END IF;

  -- Add email_sent_at field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'email_sent_at'
  ) THEN
    ALTER TABLE appointments 
    ADD COLUMN email_sent_at timestamptz;
  END IF;
END $$;