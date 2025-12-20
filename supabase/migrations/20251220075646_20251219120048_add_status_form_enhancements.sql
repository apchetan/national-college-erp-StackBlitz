/*
  # Add Enhanced Status Form Fields
  
  1. New Columns Added
    - `roll_no_values` - Array of 8 text values for roll numbers
    - `roll_no_checkboxes` - Array of 8 booleans for roll number sub-checkboxes
    - `ms_scan_checkboxes` - Array of 8 booleans for MS SCAN status sub-checkboxes
    - `ms_hard_copy_checkboxes` - Array of 8 booleans for MS Hard Copy sub-checkboxes
    - `ms_hard_copy_courier_checkboxes` - Array of 8 booleans for MS Hard Copy Courier sub-checkboxes
    - `provisional_degree_issued` - Boolean for Provisional Degree issued checkbox
    - `degree_issued` - Boolean for Degree issued checkbox
    - `university_phd_offer_letter_issued` - Boolean for University PhD Offer Letter issued checkbox
    - `enrolment_no_value` - Text field for Enrolment No. value
  
  2. Purpose
    These fields enhance the student status tracking form with:
    - Multiple roll number tracking (up to 8)
    - Detailed semester-wise tracking for documents
    - Issued status for degrees and offer letters
    - Enrolment number storage
*/

-- Add roll number tracking fields
ALTER TABLE student_status
ADD COLUMN IF NOT EXISTS roll_no_values text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS roll_no_checkboxes boolean[] DEFAULT ARRAY[false, false, false, false, false, false, false, false];

-- Add MS SCAN status checkboxes
ALTER TABLE student_status
ADD COLUMN IF NOT EXISTS ms_scan_checkboxes boolean[] DEFAULT ARRAY[false, false, false, false, false, false, false, false];

-- Add MS Hard Copy checkboxes
ALTER TABLE student_status
ADD COLUMN IF NOT EXISTS ms_hard_copy_checkboxes boolean[] DEFAULT ARRAY[false, false, false, false, false, false, false, false];

-- Add MS Hard Copy Courier checkboxes
ALTER TABLE student_status
ADD COLUMN IF NOT EXISTS ms_hard_copy_courier_checkboxes boolean[] DEFAULT ARRAY[false, false, false, false, false, false, false, false];

-- Add issued checkboxes for degrees and offer letter
ALTER TABLE student_status
ADD COLUMN IF NOT EXISTS provisional_degree_issued boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS degree_issued boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS university_phd_offer_letter_issued boolean DEFAULT false;

-- Add enrolment number value field
ALTER TABLE student_status
ADD COLUMN IF NOT EXISTS enrolment_no_value text;