/*
  # Update Source Field Options

  1. Changes
    - Drop existing CHECK constraint on `source` column in `contacts` table
    - Add new CHECK constraint with expanded source options including:
      - Email from naukri.com
      - Email from Foundit.com
      - Referred by (Student/Friend)
      - Referred by Staff
      - SMS
      - LinkedIn
      - Facebook
      - Google
      - Instagram
      - YouTube
      - WhatsApp
      - WebChat
      - Missed Call
      - Other
  
  2. Notes
    - Provides more granular tracking of lead sources
    - Maintains backward compatibility by keeping 'other' option
*/

DO $$
BEGIN
  ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_source_check;
  
  ALTER TABLE contacts ADD CONSTRAINT contacts_source_check 
    CHECK (source IN (
      'email_naukri',
      'email_foundit',
      'referred_student_friend',
      'referred_staff',
      'sms',
      'linkedin',
      'facebook',
      'google',
      'instagram',
      'youtube',
      'whatsapp',
      'webchat',
      'missed_call',
      'other'
    ));
END $$;