/*
  # Add Attendance Field to Appointments Table

  1. Changes
    - Add `attendance` column to appointments table
    - Attendance can be 'Show', 'No-Show', or NULL (not yet determined)
    - This tracks whether the contact attended the appointment

  2. Purpose
    - Track attendance for multiple appointment instances
    - Display attendance history in re-enquiry scenarios
    - Show previous appointment attendance in status reports
*/

-- Add attendance column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS attendance text CHECK (attendance IN ('Show', 'No-Show'));

-- Add comment to explain the field
COMMENT ON COLUMN appointments.attendance IS 'Tracks whether contact attended the appointment: Show, No-Show, or NULL if not yet determined';
