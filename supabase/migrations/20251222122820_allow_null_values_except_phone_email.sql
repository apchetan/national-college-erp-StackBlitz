/*
  # Allow NULL Values in All Fields Except Phone and Email

  ## Changes
  This migration updates all tables to allow NULL values in fields, with exceptions for:
  - Email (remains NOT NULL)
  - Phone (changed to NOT NULL)
  - Foreign key fields (remain NOT NULL for referential integrity)

  ## Tables Modified

  ### 1. contacts
  - first_name: Allow NULL
  - last_name: Allow NULL
  - phone: Make NOT NULL (was nullable)

  ### 2. enquiries
  - subject: Allow NULL
  - message: Allow NULL

  ### 3. appointments
  - title: Allow NULL
  - appointment_date: Allow NULL

  ### 4. admissions
  - program: Allow NULL

  ### 5. interactions
  - interaction_type: Allow NULL
  - description: Allow NULL

  ### 6. payments
  - amount: Allow NULL
  - payment_date: Allow NULL
  - payment_mode: Allow NULL

  ### 7. support_forms
  - subject: Allow NULL
  - message: Allow NULL
  - enquiry_type: Allow NULL
  - priority: Allow NULL
  - status: Allow NULL

  ### 8. student_status
  - program: Allow NULL

  ## Security
  No security changes - existing RLS policies remain in place

  ## Important Notes
  1. Foreign key fields (contact_id, admission_id, etc.) remain NOT NULL for data integrity
  2. Email field remains NOT NULL as requested
  3. Phone field changed to NOT NULL as requested
  4. admission_date was previously removed from admissions table, not included here
*/

-- contacts table: Allow NULL for first_name, last_name, and make phone NOT NULL
ALTER TABLE contacts 
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name DROP NOT NULL,
  ALTER COLUMN phone SET NOT NULL;

-- enquiries table: Allow NULL for subject and message
ALTER TABLE enquiries 
  ALTER COLUMN subject DROP NOT NULL,
  ALTER COLUMN message DROP NOT NULL;

-- appointments table: Allow NULL for title and appointment_date
ALTER TABLE appointments 
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN appointment_date DROP NOT NULL;

-- admissions table: Allow NULL for program
ALTER TABLE admissions 
  ALTER COLUMN program DROP NOT NULL;

-- interactions table: Allow NULL for interaction_type and description
ALTER TABLE interactions 
  ALTER COLUMN interaction_type DROP NOT NULL,
  ALTER COLUMN description DROP NOT NULL;

-- payments table: Allow NULL for amount, payment_date, and payment_mode
ALTER TABLE payments 
  ALTER COLUMN amount DROP NOT NULL,
  ALTER COLUMN payment_date DROP NOT NULL,
  ALTER COLUMN payment_mode DROP NOT NULL;

-- support_forms table: Allow NULL for subject, message, enquiry_type, priority, and status
ALTER TABLE support_forms 
  ALTER COLUMN subject DROP NOT NULL,
  ALTER COLUMN message DROP NOT NULL,
  ALTER COLUMN enquiry_type DROP NOT NULL,
  ALTER COLUMN priority DROP NOT NULL,
  ALTER COLUMN status DROP NOT NULL;

-- student_status table: Allow NULL for program
ALTER TABLE student_status 
  ALTER COLUMN program DROP NOT NULL;